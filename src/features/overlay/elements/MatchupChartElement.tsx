import React, { useId, useMemo, useRef, useEffect } from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';
import { UrlComboBox } from '../UrlComboBox';
import { MarketLiveData, LiveTrade } from '../types';
import { extractTicker } from '../useMarketData';
import { fetchKalshiEvent } from '../../../lib/kalshiApi';
import { scaleLinear } from '@visx/scale';

export interface MatchupChartProps {
  type: 'matchup-chart';
  ticker: string;
  marketUrl: string;
  pollInterval: number;
  team1Name: string;
  team2Name: string;
  team1Color: string;
  team2Color: string;
  showLabels: boolean;
  labelSize: number;
  lineWidth: number;
  showGlow: boolean;
  showAreaFill: boolean;
}

// ---- Helpers ----

interface PricePoint {
  index: number;
  price: number;
}

function smoothLinePath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]}L${pts[1][0]},${pts[1][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function smoothAreaPath(pts: [number, number][], baseY: number): string {
  const line = smoothLinePath(pts);
  if (!line) return '';
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line}L${last[0]},${baseY}L${first[0]},${baseY}Z`;
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Build price history for an outcome from its trades.
 * Falls back to synthesized movement around current odds.
 */
function buildOutcomePriceHistory(
  trades: LiveTrade[] | undefined,
  outcomeTicker: string | undefined,
  currentOdds: number,
): PricePoint[] {
  if (trades && trades.length > 0 && outcomeTicker) {
    // Filter trades for this specific outcome market
    const outcomeTrades = trades.filter(t => t.ticker === outcomeTicker);
    if (outcomeTrades.length >= 2) {
      const sorted = [...outcomeTrades].sort((a, b) => a.timestamp - b.timestamp);
      const points: PricePoint[] = sorted.map((t, i) => ({ index: i, price: t.priceCents }));
      const last = points[points.length - 1];
      if (Math.abs(last.price - currentOdds) > 0.5) {
        points.push({ index: points.length, price: currentOdds });
      }
      return points;
    }
  }

  // Synthesize gentle movement around current price
  const b = currentOdds;
  const offsets = [-5, -2, 3, -1, 4, 1, -3, 2, 0];
  return offsets.map((off, i) => ({
    index: i,
    price: Math.max(1, Math.min(99, b + off)),
  }));
}

// ---- Renderer ----

function MatchupChartRenderer({ props, width, height, liveData }: {
  props: MatchupChartProps; width: number; height: number; liveData?: MarketLiveData;
}) {
  const rawUid = useId();
  const uid = rawUid.replace(/:/g, '');

  // Extract per-outcome data
  const team1Odds = liveData?.outcomes?.[0]?.odds ?? (liveData?.odds ?? 50);
  const team2Odds = liveData?.outcomes?.[1]?.odds ?? (liveData ? 100 - liveData.odds : 50);

  // Find market tickers for each outcome from tickerToName
  const [team1Ticker, team2Ticker] = useMemo(() => {
    if (!liveData?.tickerToName) return [undefined, undefined];
    const entries = Object.entries(liveData.tickerToName);
    return [entries[0]?.[0], entries[1]?.[0]];
  }, [liveData?.tickerToName]);

  const team1History = useMemo(
    () => buildOutcomePriceHistory(liveData?.trades, team1Ticker, team1Odds),
    [liveData?.trades, team1Ticker, team1Odds],
  );

  const team2History = useMemo(
    () => buildOutcomePriceHistory(liveData?.trades, team2Ticker, team2Odds),
    [liveData?.trades, team2Ticker, team2Odds],
  );

  // Compute shared y-scale across both histories
  const allPrices = useMemo(() => {
    return [...team1History.map(p => p.price), ...team2History.map(p => p.price)];
  }, [team1History, team2History]);

  const maxPoints = Math.max(team1History.length, team2History.length);

  if (!props.ticker && !liveData) {
    const s = Math.min(width / 400, height / 200);
    return (
      <div style={{
        width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)', borderRadius: 10 * s,
        border: '2px dashed rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.35)', fontSize: Math.max(11, 14 * s),
        fontFamily: 'Inter, sans-serif',
      }}>
        Paste a matchup event URL
      </div>
    );
  }

  if (!liveData) {
    const s = Math.min(width / 400, height / 200);
    return (
      <div style={{
        width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)', borderRadius: 10 * s,
        color: 'rgba(255,255,255,0.35)', fontSize: Math.max(11, 14 * s),
        fontFamily: 'Inter, sans-serif',
      }}>
        Loading…
      </div>
    );
  }

  const yMin = Math.min(...allPrices);
  const yMax = Math.max(...allPrices);
  const dataRange = Math.max(5, yMax - yMin);
  const padding = dataRange * 0.3;

  const labelFontSize = props.labelSize * Math.min(width / 400, height / 300);
  const linePx = props.lineWidth;

  // Reserve space for labels on the right
  const labelAreaWidth = props.showLabels ? labelFontSize * 4.5 : 0;
  const chartWidth = width - labelAreaWidth;

  const xScale = scaleLinear({
    domain: [0, maxPoints - 1],
    range: [0, chartWidth],
  });
  const yScale = scaleLinear({
    domain: [yMin - padding, yMax + padding],
    range: [height, 0],
  });

  function toScreenPts(history: PricePoint[]): [number, number][] {
    return history.map(p => [
      xScale(p.index * (maxPoints - 1) / Math.max(1, history.length - 1)) as number,
      yScale(p.price) as number,
    ]);
  }

  const pts1 = toScreenPts(team1History);
  const pts2 = toScreenPts(team2History);
  const line1 = smoothLinePath(pts1);
  const line2 = smoothLinePath(pts2);
  const area1 = props.showAreaFill ? smoothAreaPath(pts1, height) : '';
  const area2 = props.showAreaFill ? smoothAreaPath(pts2, height) : '';

  const endPt1 = pts1[pts1.length - 1];
  const endPt2 = pts2[pts2.length - 1];

  const team1Name = props.team1Name || liveData.outcomes?.[0]?.name || 'T1';
  const team2Name = props.team2Name || liveData.outcomes?.[1]?.name || 'T2';

  return (
    <div style={{
      width, height, position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      <svg width={chartWidth} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <linearGradient id={`${uid}fill1`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hexToRgba(props.team1Color, 0.2)} />
            <stop offset="70%" stopColor={hexToRgba(props.team1Color, 0.03)} />
            <stop offset="100%" stopColor={hexToRgba(props.team1Color, 0)} />
          </linearGradient>
          <linearGradient id={`${uid}fill2`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hexToRgba(props.team2Color, 0.2)} />
            <stop offset="70%" stopColor={hexToRgba(props.team2Color, 0.03)} />
            <stop offset="100%" stopColor={hexToRgba(props.team2Color, 0)} />
          </linearGradient>
        </defs>

        {/* Area fills */}
        {props.showAreaFill && area2 && (
          <path d={area2} fill={`url(#${uid}fill2)`} />
        )}
        {props.showAreaFill && area1 && (
          <path d={area1} fill={`url(#${uid}fill1)`} />
        )}

        {/* Team 2 line (drawn first so team1 is on top) */}
        {line2 && (
          <>
            {props.showGlow && (
              <path d={line2} fill="none" stroke={hexToRgba(props.team2Color, 0.12)} strokeWidth={linePx + 4} strokeLinecap="round" />
            )}
            <path d={line2} fill="none" stroke={props.team2Color} strokeWidth={linePx} strokeLinecap="round" />
            {endPt2 && (
              <>
                <circle cx={endPt2[0]} cy={endPt2[1]} r={linePx + 3} fill={props.team2Color} opacity={0.15} />
                <circle cx={endPt2[0]} cy={endPt2[1]} r={linePx + 1} fill={props.team2Color} />
              </>
            )}
          </>
        )}

        {/* Team 1 line */}
        {line1 && (
          <>
            {props.showGlow && (
              <path d={line1} fill="none" stroke={hexToRgba(props.team1Color, 0.12)} strokeWidth={linePx + 4} strokeLinecap="round" />
            )}
            <path d={line1} fill="none" stroke={props.team1Color} strokeWidth={linePx} strokeLinecap="round" />
            {endPt1 && (
              <>
                <circle cx={endPt1[0]} cy={endPt1[1]} r={linePx + 3} fill={props.team1Color} opacity={0.15} />
                <circle cx={endPt1[0]} cy={endPt1[1]} r={linePx + 1} fill={props.team1Color} />
              </>
            )}
          </>
        )}
      </svg>

      {/* Labels on the right */}
      {props.showLabels && endPt1 && endPt2 && (
        <div style={{
          position: 'absolute', right: 0, top: 0, width: labelAreaWidth,
          height, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: `${height * 0.08}px 0`,
          pointerEvents: 'none',
        }}>
          {/* Higher-odds team at top, lower at bottom */}
          {(() => {
            const top = team1Odds >= team2Odds
              ? { name: team1Name, odds: team1Odds, color: props.team1Color }
              : { name: team2Name, odds: team2Odds, color: props.team2Color };
            const bottom = team1Odds >= team2Odds
              ? { name: team2Name, odds: team2Odds, color: props.team2Color }
              : { name: team1Name, odds: team1Odds, color: props.team1Color };

            return (
              <>
                <div style={{ textAlign: 'right', paddingRight: width * 0.02 }}>
                  <div style={{
                    fontSize: labelFontSize * 0.65, fontWeight: 700,
                    color: top.color, letterSpacing: '0.04em',
                    textTransform: 'uppercase', lineHeight: 1.2,
                    textShadow: '0 1px 6px rgba(0,0,0,0.8)',
                  }}>
                    {top.name}
                  </div>
                  <div style={{
                    fontSize: labelFontSize, fontWeight: 900,
                    color: top.color, fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1, letterSpacing: '-0.02em',
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  }}>
                    {top.odds}%
                  </div>
                </div>
                <div style={{ textAlign: 'right', paddingRight: width * 0.02 }}>
                  <div style={{
                    fontSize: labelFontSize * 0.65, fontWeight: 700,
                    color: bottom.color, letterSpacing: '0.04em',
                    textTransform: 'uppercase', lineHeight: 1.2,
                    textShadow: '0 1px 6px rgba(0,0,0,0.8)',
                  }}>
                    {bottom.name}
                  </div>
                  <div style={{
                    fontSize: labelFontSize, fontWeight: 900,
                    color: bottom.color, fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1, letterSpacing: '-0.02em',
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  }}>
                    {bottom.odds}%
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ---- Props Editor ----

function MatchupChartPropsEditor({ props, onChange }: { props: MatchupChartProps; onChange: (p: MatchupChartProps) => void }) {
  const [loading, setLoading] = React.useState(false);
  const lastFetchedRef = useRef(props.ticker);
  const propsRef = useRef(props);
  propsRef.current = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Debounce ticker extraction + auto-fetch team names
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const { marketUrl, ticker: currentTicker } = propsRef.current;
      if (!marketUrl.trim()) {
        if (currentTicker) onChangeRef.current({ ...propsRef.current, ticker: '' });
        return;
      }
      const ticker = extractTicker(marketUrl);
      if (!ticker) return;

      const updates: Partial<MatchupChartProps> = {};
      if (ticker !== currentTicker) updates.ticker = ticker;

      if (ticker !== lastFetchedRef.current) {
        lastFetchedRef.current = ticker;
        setLoading(true);
        try {
          const { markets } = await fetchKalshiEvent(ticker);
          if (markets.length >= 2) {
            updates.team1Name = markets[0].ticker.split('-').pop() || 'T1';
            updates.team2Name = markets[1].ticker.split('-').pop() || 'T2';
          }
        } catch { /* keep existing names */ }
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
        <span className={oe.fieldLabel}>Event URL</span>
        <UrlComboBox value={props.marketUrl} onChange={url => onChange({ ...props, marketUrl: url })} placeholder="https://kalshi.com/markets/..." />
        {loading && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Loading teams...</span>}
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
          <span className={oe.fieldLabel}>Label Size</span>
          <input type="range" min={16} max={80} value={props.labelSize} onChange={e => onChange({ ...props, labelSize: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Line Width</span>
          <input type="range" min={1} max={6} step={0.5} value={props.lineWidth} onChange={e => onChange({ ...props, lineWidth: parseFloat(e.target.value) })} style={{ width: '100%' }} />
        </div>
      </div>
      <div className={oe.row}>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showLabels} onChange={e => onChange({ ...props, showLabels: e.target.checked })} />
          Labels
        </label>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showGlow} onChange={e => onChange({ ...props, showGlow: e.target.checked })} />
          Glow
        </label>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showAreaFill} onChange={e => onChange({ ...props, showAreaFill: e.target.checked })} />
          Area Fill
        </label>
      </div>
    </div>
  );
}

// ---- Register ----

registerElement<MatchupChartProps>({
  type: 'matchup-chart',
  label: 'Matchup Chart',
  layerLabel: (p) => `${p.team1Name || '?'} / ${p.team2Name || '?'} chart`,
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('path', { d: 'M3 20l5-10 4 6 4-8 5 4' }),
    React.createElement('path', { d: 'M3 16l6-4 4 2 4-6 4 3', strokeDasharray: '3 2' }),
  ),
  defaults: {
    width: 450, height: 350, zIndex: 1,
    props: {
      type: 'matchup-chart',
      ticker: '',
      marketUrl: '',
      pollInterval: 30,
      team1Name: '',
      team2Name: '',
      team1Color: '#09C285',
      team2Color: '#3B82F6',
      showLabels: true,
      labelSize: 36,
      lineWidth: 2.5,
      showGlow: true,
      showAreaFill: true,
    },
  },
  Renderer: MatchupChartRenderer,
  PropsEditor: MatchupChartPropsEditor,
  usesMarketData: true,
  usesTradeData: true,
});
