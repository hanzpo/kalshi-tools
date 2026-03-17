import React from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';
import { UrlComboBox } from '../UrlComboBox';
import { MarketLiveData, LiveTrade } from '../types';
import { extractTicker } from '../useMarketData';
import { fetchKalshiEvent } from '../../../lib/kalshiApi';

export interface TradeFeedProps {
  type: 'trade-feed';
  ticker: string;
  marketUrl: string;
  pollInterval: number;
  maxTrades: number;
  showDot: boolean;
  headerText: string;
  headerColor: string;
  dotColor: string;
  amountColor: string;
  /** Serialized JSON map of outcomes: key -> { label, acronym, color } */
  outcomeMap: string;
  fontSize: number;
  lineSpacing: number;
  showSide: boolean;
  useAcronyms: boolean;
  textShadow: string;
  fontFamily: string;
}

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: "'Sohne Schmal', 'Barlow Condensed', sans-serif", label: 'Söhne Schmal' },
  { value: "'Matricha', 'Barlow Condensed', sans-serif", label: 'Matricha' },
  { value: "'Barlow Condensed', sans-serif", label: 'Barlow Condensed' },
  { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue' },
  { value: "'Oswald', sans-serif", label: 'Oswald' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: "'Arial Black', sans-serif", label: 'Arial Black' },
];

interface ParsedOutcome {
  label: string;
  acronym: string;
  color: string;
}

function parseOutcomeMap(raw: string): Record<string, ParsedOutcome> {
  try {
    const parsed = JSON.parse(raw);
    const result: Record<string, ParsedOutcome> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === 'string') {
        // Shorthand: {"SEA": "#09C285"} -> label=key, color=val
        result[key] = { label: key, acronym: key, color: val };
      } else if (val && typeof val === 'object' && 'label' in (val as any)) {
        const entry = val as ParsedOutcome;
        result[key] = { ...entry, acronym: entry.acronym || key };
      }
    }
    return result;
  } catch {
    return {};
  }
}

function matchOutcome(
  trade: LiveTrade,
  outcomeMap: Record<string, ParsedOutcome>,
): ParsedOutcome | null {
  // Exact ticker match
  if (outcomeMap[trade.ticker]) return outcomeMap[trade.ticker];
  // Match by suffix (last segment after '-'), which is the outcome identifier
  const parts = trade.ticker.split('-');
  const suffix = parts[parts.length - 1];
  if (outcomeMap[suffix]) return outcomeMap[suffix];
  // Try suffix as a case-insensitive partial match against keys
  const suffixUpper = suffix.toUpperCase();
  for (const [key, val] of Object.entries(outcomeMap)) {
    if (suffixUpper === key.toUpperCase()) return val;
  }
  return null;
}

function formatTradeAmount(trade: LiveTrade): string {
  const dollars = Math.round(trade.contracts * (trade.priceCents / 100));
  return `+$${dollars || trade.costDollars}`;
}

// ---- Renderer ----

function TradeFeedRenderer({ props, width, height, liveData }: {
  props: TradeFeedProps; width: number; height: number; liveData?: MarketLiveData;
}) {
  const outcomeMap = React.useMemo(() => parseOutcomeMap(props.outcomeMap), [props.outcomeMap]);
  const maxTrades = props.maxTrades || 6;
  const lineSpacing = props.lineSpacing || 1.4;
  // Scale font from bounding box — use the more constraining dimension
  const totalRows = (props.headerText ? 1.3 : 0) + maxTrades;
  const heightBasedSize = height / (totalRows * lineSpacing);
  const widthBasedSize = width / 14; // ~14em per trade line at mixed sizes
  const fontSize = Math.min(heightBasedSize, widthBasedSize);

  const trades = liveData?.trades || [];
  const visibleTrades = trades.slice(0, maxTrades);

  if (!props.ticker) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '2px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        Paste a Kalshi market URL to show live trades
      </div>
    );
  }

  if (liveData?.status === 'error') {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        Failed to load trades
      </div>
    );
  }

  if (!liveData || !liveData.trades) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        Loading trades...
      </div>
    );
  }

  if (visibleTrades.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        No recent trades
      </div>
    );
  }

  const font = props.fontFamily || 'Inter, sans-serif';
  const shadow = props.textShadow || 'none';

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', gap: fontSize * 0.3, fontFamily: font, overflow: 'hidden' }}>
      {/* Header */}
      {props.headerText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: fontSize * 0.1 }}>
          {props.showDot && (
            <div style={{
              width: fontSize * 0.4, height: fontSize * 0.4, borderRadius: '50%',
              backgroundColor: props.dotColor || '#ef4444', flexShrink: 0,
              animation: 'pulse 2s ease-in-out infinite',
            }} />
          )}
          <span style={{ fontSize, fontWeight: 700, color: props.headerColor || '#ffffff', lineHeight: 1, textShadow: shadow }}>
            {props.headerText}
          </span>
        </div>
      )}
      {/* Trade entries */}
      {visibleTrades.map((trade, i) => {
        const outcome = matchOutcome(trade, outcomeMap);
        // Fallback: use tickerToName mapping from market data, then try outcome matching
        let fallbackLabel = trade.ticker.split('-').pop() || trade.ticker;
        if (!outcome && liveData?.tickerToName?.[trade.ticker]) {
          fallbackLabel = liveData.tickerToName[trade.ticker];
        } else if (!outcome && liveData?.outcomes) {
          const suffix = fallbackLabel.toUpperCase();
          const match = liveData.outcomes.find(o =>
            o.name.toUpperCase().includes(suffix) || suffix.includes(o.name.toUpperCase().slice(0, 3))
          );
          if (match) fallbackLabel = match.name;
        }
        const label = outcome
          ? (props.useAcronyms ? outcome.acronym : outcome.label)
          : (props.useAcronyms ? (trade.ticker.split('-').pop() || fallbackLabel) : fallbackLabel);
        const color = outcome?.color || '#ffffff';
        const amount = formatTradeAmount(trade);
        const sideLabel = props.showSide ? (trade.side === 'yes' ? 'YES' : 'NO') : null;
        const isNew = Date.now() - trade.timestamp < 10000; // highlight trades < 10s old

        return (
          <div key={trade.id} style={{
            display: 'flex', alignItems: 'baseline', gap: fontSize * 0.25, lineHeight: lineSpacing,
            animation: isNew ? 'tradeFadeIn 0.4s ease-out' : undefined,
            opacity: i === 0 ? 1 : Math.max(0.5, 1 - i * 0.08),
          }}>
            <span style={{ fontSize, fontWeight: 700, color: props.amountColor || '#09C285', fontVariantNumeric: 'tabular-nums', textShadow: shadow }}>
              {amount}
            </span>
            <span style={{ fontSize: fontSize * 0.75, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textShadow: shadow }}>
              on
            </span>
            <span style={{ fontSize, fontWeight: 800, color, textShadow: shadow }}>
              {label}
            </span>
            {sideLabel && (
              <span style={{ fontSize: fontSize * 0.55, fontWeight: 600, color: trade.side === 'yes' ? '#09C285' : '#ef4444', opacity: 0.7, textShadow: shadow }}>
                {sideLabel}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Outcome Map Editor ----

interface OutcomeEntry {
  key: string;
  label: string;
  acronym: string;
  color: string;
}

function outcomeMapToEntries(raw: string): OutcomeEntry[] {
  const parsed = parseOutcomeMap(raw);
  return Object.entries(parsed).map(([key, val]) => ({
    key,
    label: val.label,
    acronym: val.acronym,
    color: val.color,
  }));
}

function entriesToOutcomeMap(entries: OutcomeEntry[]): string {
  const map: Record<string, { label: string; acronym: string; color: string }> = {};
  for (const e of entries) {
    if (!e.key) continue;
    map[e.key] = { label: e.label || e.key, acronym: e.acronym || e.key, color: e.color };
  }
  return JSON.stringify(map);
}

function OutcomeMapEditor({ outcomeMap, onChange }: { outcomeMap: string; onChange: (map: string) => void }) {
  const entries = outcomeMapToEntries(outcomeMap);

  const update = (index: number, patch: Partial<OutcomeEntry>) => {
    const next = entries.map((e, i) => i === index ? { ...e, ...patch } : e);
    onChange(entriesToOutcomeMap(next));
  };

  if (entries.length === 0) {
    return (
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>Outcomes</span>
        <span style={{ fontSize: 11, color: '#6b7280' }}>Apply a market URL to populate outcomes.</span>
      </div>
    );
  }

  return (
    <div className={oe.fieldFull}>
      <span className={oe.fieldLabel}>Outcomes</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {entries.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="text"
              className={oe.inputSm}
              style={{ flex: 1, minWidth: 0 }}
              placeholder="Full name"
              title="Full display name"
              value={entry.label}
              onChange={e => update(i, { label: e.target.value })}
            />
            <input
              type="text"
              className={oe.inputSm}
              style={{ width: 48, flexShrink: 0 }}
              placeholder="Abbr"
              title="Acronym / abbreviation"
              value={entry.acronym}
              onChange={e => update(i, { acronym: e.target.value })}
            />
            <input
              type="color"
              className={oe.color}
              value={entry.color}
              onChange={e => update(i, { color: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Props Editor ----

function TradeFeedPropsEditor({ props, onChange }: { props: TradeFeedProps; onChange: (p: TradeFeedProps) => void }) {
  const [loading, setLoading] = React.useState(false);
  const lastFetchedRef = React.useRef(props.ticker);
  const propsRef = React.useRef(props);
  propsRef.current = props;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  // Debounce ticker extraction + auto-fetch outcome map
  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      const { marketUrl, ticker: currentTicker } = propsRef.current;
      if (!marketUrl.trim()) {
        if (currentTicker) onChangeRef.current({ ...propsRef.current, ticker: '' });
        return;
      }
      const ticker = extractTicker(marketUrl);
      if (!ticker) return;

      const updates: Partial<TradeFeedProps> = {};
      if (ticker !== currentTicker) updates.ticker = ticker;

      // Fetch outcome map if ticker is new
      if (ticker !== lastFetchedRef.current) {
        lastFetchedRef.current = ticker;
        setLoading(true);

        try {
          const { markets } = await fetchKalshiEvent(ticker);
          if (markets.length > 1) {
            const map: Record<string, { label: string; acronym: string; color: string }> = {};
            const colors = ['#09C285', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
            markets.forEach((m, i) => {
              const suffix = m.ticker.split('-').pop() || m.ticker;
              const label = m.yes_sub_title || m.title || suffix;
              map[suffix] = { label, acronym: suffix, color: colors[i % colors.length] };
            });
            updates.outcomeMap = JSON.stringify(map);
          }
        } catch { /* keep existing */ }
        setLoading(false);
      }

      if (Object.keys(updates).length > 0) {
        onChangeRef.current({ ...propsRef.current, ...updates });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [props.marketUrl]);

  return (
    <div className={oe.props}>
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>Market / Event URL</span>
        <UrlComboBox value={props.marketUrl} onChange={url => onChange({ ...props, marketUrl: url })} placeholder="https://kalshi.com/markets/..." />
        {loading && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Loading outcomes...</span>}
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Header</span>
          <input type="text" className={oe.input} value={props.headerText} onChange={e => onChange({ ...props, headerText: e.target.value })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Header Color</span>
          <input type="color" className={oe.color} value={props.headerColor || '#ffffff'} onChange={e => onChange({ ...props, headerColor: e.target.value })} />
        </div>
      </div>
      <div className={oe.row}>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showDot} onChange={e => onChange({ ...props, showDot: e.target.checked })} />
          Live Dot
        </label>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showSide} onChange={e => onChange({ ...props, showSide: e.target.checked })} />
          Show Side
        </label>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.useAcronyms} onChange={e => onChange({ ...props, useAcronyms: e.target.checked })} />
          Acronyms
        </label>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Dot Color</span>
          <input type="color" className={oe.color} value={props.dotColor || '#ef4444'} onChange={e => onChange({ ...props, dotColor: e.target.value })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Amount Color</span>
          <input type="color" className={oe.color} value={props.amountColor || '#09C285'} onChange={e => onChange({ ...props, amountColor: e.target.value })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Max Trades</span>
          <input type="number" className={oe.inputSm} value={props.maxTrades || 6} min={1} max={20} onChange={e => onChange({ ...props, maxTrades: parseInt(e.target.value) || 6 })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Font Size</span>
          <input type="number" className={oe.inputSm} value={props.fontSize || 36} min={8} max={120} onChange={e => onChange({ ...props, fontSize: parseInt(e.target.value) || 36 })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Line Spacing</span>
          <input type="number" className={oe.inputSm} value={props.lineSpacing || 1.4} min={0.8} max={3} step={0.1} onChange={e => onChange({ ...props, lineSpacing: parseFloat(e.target.value) || 1.4 })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Font</span>
          <select className={oe.select} value={props.fontFamily || 'Inter, sans-serif'} onChange={e => onChange({ ...props, fontFamily: e.target.value })}>
            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>Text Shadow</span>
        <input type="text" className={oe.input} value={props.textShadow || ''} placeholder="0 2px 12px rgba(0,0,0,0.8)" onChange={e => onChange({ ...props, textShadow: e.target.value })} />
      </div>
      <OutcomeMapEditor outcomeMap={props.outcomeMap} onChange={map => onChange({ ...props, outcomeMap: map })} />
    </div>
  );
}

// ---- Register ----

registerElement<TradeFeedProps>({
  type: 'trade-feed',
  label: 'Trade Feed',
  layerLabel: (p) => p.ticker || 'No market',
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('path', { d: 'M12 2v20' }),
    React.createElement('path', { d: 'M2 12h20' }),
    React.createElement('path', { d: 'M7 7l5-5 5 5' }),
    React.createElement('path', { d: 'M7 17l5 5 5-5' }),
  ),
  defaults: {
    width: 500, height: 400, zIndex: 2,
    props: {
      type: 'trade-feed',
      ticker: '',
      marketUrl: '',
      pollInterval: 15,
      maxTrades: 6,
      showDot: true,
      headerText: 'Live Trade',
      headerColor: '#ffffff',
      dotColor: '#ef4444',
      amountColor: '#09C285',
      outcomeMap: '{"SEA":"#09C285","NE":"#3B82F6"}',
      fontSize: 36,
      lineSpacing: 1.4,
      showSide: false,
      useAcronyms: true,
      textShadow: '0 2px 12px rgba(0,0,0,0.8)',
      fontFamily: 'Inter, sans-serif',
    },
  },
  Renderer: TradeFeedRenderer,
  PropsEditor: TradeFeedPropsEditor,
  usesMarketData: true,
  usesTradeData: true,
});
