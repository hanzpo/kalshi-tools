import React from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';
import { UrlComboBox } from '../UrlComboBox';
import { MarketLiveData } from '../types';
import { extractTicker } from '../useMarketData';
import { fetchKalshiEvent, fetchKalshiMarket } from '../../../lib/kalshiApi';

export interface MatchupProps {
  type: 'matchup';
  ticker: string;
  marketUrl: string;
  pollInterval: number;
  team1Name: string;
  team2Name: string;
  team1Color: string;
  team2Color: string;
  showOdds: boolean;
  showPayout: boolean;
  payoutWager: number;
  vsStyle: 'text' | 'slash' | 'hidden';
  nameFont: string;
  oddsFont: string;
  payoutFont: string;
  textShadow: string;
}

const FONT_OPTIONS = [
  { value: "'Sohne Schmal', 'Kalshi Sans', sans-serif", label: 'Söhne Schmal' },
  { value: "'Kalshi Sans', sans-serif", label: 'Kalshi Sans' },
  { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue' },
  { value: "'Oswald', sans-serif", label: 'Oswald' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: "'Arial Black', sans-serif", label: 'Arial Black' },
];

const ODDS_FONT_OPTIONS = [
  { value: "'Matricha', 'Kalshi Sans', sans-serif", label: 'Matricha' },
  { value: "'Sohne Schmal', 'Kalshi Sans', sans-serif", label: 'Söhne Schmal' },
  { value: "'Kalshi Sans', sans-serif", label: 'Kalshi Sans' },
  { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue' },
  { value: "'Oswald', sans-serif", label: 'Oswald' },
];

function MatchupRenderer({ props, width, height, liveData }: {
  props: MatchupProps; width: number; height: number; liveData?: MarketLiveData;
}) {
  // Scale based on the more constraining dimension
  const rowCount = 1 + (props.showOdds ? 1 : 0);
  const heightBasedSize = height / (rowCount * 1.4);
  // Estimate width of names row: bold uppercase chars ~0.62em each + vs/gaps
  const t1Len = (props.team1Name || 'TEAM1').length;
  const t2Len = (props.team2Name || 'TEAM2').length;
  const vsEm = props.vsStyle !== 'hidden' ? 1.5 : 0;
  const widthBasedSize = width / ((t1Len + t2Len) * 0.62 + vsEm + 0.3);
  const fontSize = Math.min(heightBasedSize, widthBasedSize);
  const vsFontSize = fontSize * 0.35;
  const oddsFontSize = fontSize * 0.55;
  const payoutFontSize = fontSize * 0.25;
  const gap = height * 0.03;

  let team1Odds = 50;
  let team2Odds = 50;
  if (liveData) {
    if (liveData.marketType === 'multi' && liveData.outcomes && liveData.outcomes.length >= 2) {
      team1Odds = liveData.outcomes[0].odds;
      team2Odds = liveData.outcomes[1].odds;
    } else {
      team1Odds = liveData.odds;
      team2Odds = 100 - liveData.odds;
    }
  }

  const wager = props.payoutWager || 100;

  if (!props.ticker && !liveData) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '2px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: "'Kalshi Sans', sans-serif" }}>
        Set team names & paste market URL
      </div>
    );
  }

  const nameFont = props.nameFont || "'Sohne Schmal', 'Kalshi Sans', sans-serif";
  const oddsFont = props.oddsFont || "'Matricha', 'Kalshi Sans', sans-serif";
  const payoutFont = props.payoutFont || "'Kalshi Sans', sans-serif";
  const shadow = props.textShadow || 'none';

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', gap }}>
      {/* Team names row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: fontSize * 0.15 }}>
        <span style={{ fontSize, fontWeight: 900, color: props.team1Color, letterSpacing: -2, lineHeight: 1, textTransform: 'uppercase', textShadow: shadow, fontFamily: nameFont }}>
          {props.team1Name || 'TEAM1'}
        </span>
        {props.vsStyle !== 'hidden' && (
          <span style={{ fontSize: vsFontSize, fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1, textShadow: shadow, fontFamily: "'Kalshi Sans', sans-serif" }}>
            {props.vsStyle === 'slash' ? '/' : 'vs'}
          </span>
        )}
        <span style={{ fontSize, fontWeight: 900, color: props.team2Color, letterSpacing: -2, lineHeight: 1, textTransform: 'uppercase', textShadow: shadow, fontFamily: nameFont }}>
          {props.team2Name || 'TEAM2'}
        </span>
      </div>

      {/* Odds row */}
      {props.showOdds && (
        <div style={{ display: 'flex', gap: fontSize * 0.4, alignItems: 'flex-start' }}>
          {/* Team 1 odds */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: oddsFontSize * 0.5, color: props.team1Color, lineHeight: 1, textShadow: shadow, fontFamily: oddsFont }}>
                {team1Odds < team2Odds ? '\u2191' : '\u2193'}
              </span>
              <span style={{ fontSize: oddsFontSize, fontWeight: 800, color: props.team1Color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, textShadow: shadow, fontFamily: oddsFont }}>
                {team1Odds}%
              </span>
            </div>
            {props.showPayout && (
              <span style={{ fontSize: payoutFontSize, color: props.team1Color, opacity: 0.8, fontVariantNumeric: 'tabular-nums', textShadow: shadow, fontFamily: payoutFont }}>
                ${wager} → ${team1Odds > 0 ? Math.round(wager / (team1Odds / 100)) : '?'}
              </span>
            )}
          </div>
          {/* Team 2 odds */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: oddsFontSize * 0.5, color: props.team2Color, lineHeight: 1, textShadow: shadow, fontFamily: oddsFont }}>
                {team2Odds < team1Odds ? '\u2191' : '\u2193'}
              </span>
              <span style={{ fontSize: oddsFontSize, fontWeight: 800, color: props.team2Color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, textShadow: shadow, fontFamily: oddsFont }}>
                {team2Odds}%
              </span>
            </div>
            {props.showPayout && (
              <span style={{ fontSize: payoutFontSize, color: props.team2Color, opacity: 0.8, fontVariantNumeric: 'tabular-nums', textShadow: shadow, fontFamily: payoutFont }}>
                ${wager} → ${team2Odds > 0 ? Math.round(wager / (team2Odds / 100)) : '?'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchupPropsEditor({ props, onChange }: { props: MatchupProps; onChange: (p: MatchupProps) => void }) {
  const [loading, setLoading] = React.useState(false);
  const lastFetchedRef = React.useRef(props.ticker);
  const propsRef = React.useRef(props);
  propsRef.current = props;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  // Debounce ticker extraction + auto-fetch team names
  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      const { marketUrl, ticker: currentTicker } = propsRef.current;
      if (!marketUrl.trim()) {
        if (currentTicker) onChangeRef.current({ ...propsRef.current, ticker: '' });
        return;
      }
      const ticker = extractTicker(marketUrl);
      if (!ticker) return;

      const updates: Partial<MatchupProps> = {};
      if (ticker !== currentTicker) updates.ticker = ticker;

      // Fetch team data if ticker is new
      if (ticker !== lastFetchedRef.current) {
        lastFetchedRef.current = ticker;
        setLoading(true);
        const colors = ['#00DD94', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

        try {
          const { markets } = await fetchKalshiEvent(ticker);
          if (markets.length >= 2) {
            updates.team1Name = markets[0].ticker.split('-').pop() || 'TEAM1';
            updates.team2Name = markets[1].ticker.split('-').pop() || 'TEAM2';
            updates.team1Color = colors[0];
            updates.team2Color = colors[1];
          } else if (markets.length === 1) {
            const suffix = markets[0].ticker.split('-').pop() || '';
            updates.team1Name = suffix || markets[0].yes_sub_title || 'YES';
            updates.team2Name = 'NO';
          }
        } catch {
          try {
            const m = await fetchKalshiMarket(ticker);
            updates.team1Name = m.yes_sub_title || 'YES';
            updates.team2Name = m.no_sub_title || 'NO';
          } catch { /* keep existing names */ }
        }
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
        <span className={oe.fieldLabel}>Market URL</span>
        <UrlComboBox value={props.marketUrl} onChange={url => onChange({ ...props, marketUrl: url })} placeholder="https://kalshi.com/markets/..." />
        {loading && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Loading team data...</span>}
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Team 1</span>
          <input type="text" className={oe.input} value={props.team1Name} placeholder="SEA" onChange={e => onChange({ ...props, team1Name: e.target.value })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Color</span>
          <input type="color" className={oe.color} value={props.team1Color} onChange={e => onChange({ ...props, team1Color: e.target.value })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Team 2</span>
          <input type="text" className={oe.input} value={props.team2Name} placeholder="NE" onChange={e => onChange({ ...props, team2Name: e.target.value })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Color</span>
          <input type="color" className={oe.color} value={props.team2Color} onChange={e => onChange({ ...props, team2Color: e.target.value })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>VS Style</span>
          <select className={oe.select} value={props.vsStyle} onChange={e => onChange({ ...props, vsStyle: e.target.value as any })}>
            <option value="text">vs</option>
            <option value="slash">/</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Name Font</span>
          <select className={oe.select} value={props.nameFont || "'Sohne Schmal', 'Kalshi Sans', sans-serif"} onChange={e => onChange({ ...props, nameFont: e.target.value })}>
            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Odds Font</span>
          <select className={oe.select} value={props.oddsFont || "'Matricha', 'Kalshi Sans', sans-serif"} onChange={e => onChange({ ...props, oddsFont: e.target.value })}>
            {ODDS_FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Payout Font</span>
          <select className={oe.select} value={props.payoutFont || "'Kalshi Sans', sans-serif"} onChange={e => onChange({ ...props, payoutFont: e.target.value })}>
            {ODDS_FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            <option value="'Kalshi Sans', sans-serif">Kalshi Sans</option>
          </select>
        </div>
      </div>
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>Text Shadow</span>
        <input type="text" className={oe.input} value={props.textShadow || ''} placeholder="0 2px 12px rgba(0,0,0,0.8)" onChange={e => onChange({ ...props, textShadow: e.target.value })} />
      </div>
      <div className={oe.row}>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showOdds} onChange={e => onChange({ ...props, showOdds: e.target.checked })} />
          Show Odds
        </label>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showPayout} onChange={e => onChange({ ...props, showPayout: e.target.checked })} />
          Show Payout
        </label>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Wager $</span>
          <input type="number" className={oe.inputSm} value={props.payoutWager} min={1} onChange={e => onChange({ ...props, payoutWager: parseInt(e.target.value) || 100 })} />
        </div>
      </div>
    </div>
  );
}

registerElement<MatchupProps>({
  type: 'matchup',
  label: 'Matchup',
  layerLabel: (p) => `${p.team1Name || '?'} vs ${p.team2Name || '?'}`,
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('path', { d: 'M6 4v16' }),
    React.createElement('path', { d: 'M18 4v16' }),
    React.createElement('path', { d: 'M6 12h12' }),
    React.createElement('circle', { cx: 6, cy: 4, r: 2 }),
    React.createElement('circle', { cx: 18, cy: 4, r: 2 }),
  ),
  defaults: {
    width: 700, height: 280, zIndex: 2,
    props: {
      type: 'matchup', ticker: '', marketUrl: '', pollInterval: 30,
      team1Name: 'TEAM1', team2Name: 'TEAM2',
      team1Color: '#00DD94', team2Color: '#3B82F6',
      showOdds: true, showPayout: true, payoutWager: 100,
      vsStyle: 'text',
      nameFont: "'Sohne Schmal', 'Kalshi Sans', sans-serif",
      oddsFont: "'Matricha', 'Kalshi Sans', sans-serif",
      payoutFont: "'Kalshi Sans', sans-serif",
      textShadow: '0 2px 12px rgba(0,0,0,0.8)',
    },
  },
  Renderer: MatchupRenderer,
  PropsEditor: MatchupPropsEditor,
  usesMarketData: true,
});
