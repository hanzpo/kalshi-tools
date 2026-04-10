import React, { useEffect, useId, useMemo, useRef } from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';
import { UrlComboBox } from '../UrlComboBox';
import { MarketLiveData, LiveTrade } from '../types';
import { extractTicker } from '../useMarketData';
import { scaleLinear } from '@visx/scale';

export interface MarketProps {
  type: 'market';
  ticker: string;
  marketUrl: string;
  pollInterval: number;
  showTitle: boolean;
  showVolume: boolean;
  accentColor: string;
  bgOpacity: number; // 0-1, default 1
}

// ---- SVG Path Helpers (pure math, no visx rendering) ----

interface PricePoint {
  index: number;
  price: number;
}

/** Catmull-Rom to cubic bezier — produces a smooth curve through all points */
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

/** Smooth area path — curve on top, straight line at baseY on bottom, closed */
function smoothAreaPath(pts: [number, number][], baseY: number): string {
  const line = smoothLinePath(pts);
  if (!line) return '';
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line}L${last[0]},${baseY}L${first[0]},${baseY}Z`;
}

/** Build price history from trade data */
function buildPriceHistory(trades: LiveTrade[] | undefined, currentOdds: number): PricePoint[] {
  if (!trades || trades.length === 0) {
    // Synthesize gentle movement around current price
    const b = currentOdds;
    return [b - 4, b - 2, b + 1.5, b - 1, b + 3, b + 0.5, b - 1.5, b + 2, b]
      .map((p, i) => ({ index: i, price: Math.max(1, Math.min(99, p)) }));
  }

  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const points: PricePoint[] = sorted.map((t, i) => ({ index: i, price: t.priceCents }));

  // Append current odds as latest point if different from last trade
  const last = points[points.length - 1];
  if (Math.abs(last.price - currentOdds) > 0.5) {
    points.push({ index: points.length, price: currentOdds });
  }

  // Ensure at least 2 points
  if (points.length < 2) {
    points.unshift({ index: 0, price: points[0].price });
    points.forEach((p, i) => { p.index = i; });
  }

  return points;
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const KALSHI_LOGO = 'M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z';

// ---- Shared chart background component ----

function ChartBackground({ width, height, priceHistory, chartColor, uid, isLarge }: {
  width: number; height: number; priceHistory: PricePoint[]; chartColor: string; uid: string; isLarge: boolean;
}) {
  if (priceHistory.length < 2) return null;

  const prices = priceHistory.map(p => p.price);
  const yMin = Math.min(...prices);
  const yMax = Math.max(...prices);
  const dataRange = Math.max(2, yMax - yMin);

  // Chart takes up the lower ~55% of the box — text goes in the top area
  const xScale = scaleLinear({
    domain: [0, priceHistory.length - 1],
    range: [0, width],
  });
  const yScale = scaleLinear({
    domain: [yMin - dataRange * 0.4, yMax + dataRange * (isLarge ? 2 : 1.5)],
    range: [height, 0],
  });

  const screenPts: [number, number][] = priceHistory.map(p => [
    xScale(p.index) as number,
    yScale(p.price) as number,
  ]);

  const linePath = smoothLinePath(screenPts);
  const areaPath = smoothAreaPath(screenPts, height);
  if (!linePath) return null;

  const endPt = screenPts[screenPts.length - 1];

  return (
    <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <linearGradient id={`${uid}fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hexToRgba(chartColor, 0.25)} />
          <stop offset="60%" stopColor={hexToRgba(chartColor, 0.06)} />
          <stop offset="100%" stopColor={hexToRgba(chartColor, 0)} />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${uid}fill)`} />

      {/* Subtle glow line */}
      <path d={linePath} fill="none" stroke={hexToRgba(chartColor, 0.1)} strokeWidth={5} strokeLinecap="round" />

      {/* Main chart line */}
      <path d={linePath} fill="none" stroke={chartColor} strokeWidth={2.5} strokeLinecap="round" />

      {/* End dot glow */}
      <circle cx={endPt[0]} cy={endPt[1]} r={6} fill={chartColor} opacity={0.15} />
      {/* End dot */}
      <circle cx={endPt[0]} cy={endPt[1]} r={3} fill={chartColor} />
    </svg>
  );
}

// ---- Renderer ----

function MarketRenderer({ props, width, height, liveData }: {
  props: MarketProps; width: number; height: number; liveData?: MarketLiveData;
}) {
  const rawUid = useId();
  const uid = rawUid.replace(/:/g, '');

  const priceHistory = useMemo(
    () => liveData?.odds != null ? buildPriceHistory(liveData.trades, liveData.odds) : [],
    [liveData?.trades, liveData?.odds],
  );

  const s = Math.min(width / 400, height / 200);
  const area = width * height;
  const isLarge = area >= 50000 && Math.min(width, height) >= 100;
  const isTiny = area < 10000 || Math.min(width, height) < 45;

  // ---- Placeholder states ----

  if (!props.ticker && !liveData) {
    return (
      <div style={{
        width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)', borderRadius: 10 * s,
        border: '2px dashed rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.35)', fontSize: Math.max(11, 14 * s),
        fontFamily: 'Kalshi Sans, sans-serif',
      }}>
        Paste a Kalshi market URL
      </div>
    );
  }

  if (liveData?.status === 'error') {
    return (
      <div style={{
        width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(239,68,68,0.06)', borderRadius: 10 * s,
        border: '1px solid rgba(239,68,68,0.15)',
        color: '#ef4444', fontSize: Math.max(11, 14 * s),
        fontFamily: 'Kalshi Sans, sans-serif',
      }}>
        Failed to load market
      </div>
    );
  }

  if (!liveData) {
    return (
      <div style={{
        width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)', borderRadius: 10 * s,
        color: 'rgba(255,255,255,0.35)', fontSize: Math.max(11, 14 * s),
        fontFamily: 'Kalshi Sans, sans-serif',
      }}>
        Loading…
      </div>
    );
  }

  // ---- Derived values ----
  const firstPrice = priceHistory[0]?.price ?? liveData.odds;
  const lastPrice = priceHistory[priceHistory.length - 1]?.price ?? liveData.odds;
  const priceChange = lastPrice - firstPrice;
  const isPositive = priceChange >= 0;
  const chartColor = isPositive ? props.accentColor : '#ef4444';
  const textShadow = '0 1px 4px rgba(0,0,0,0.9)';

  // ---- Multi-outcome market ----

  if (liveData.marketType === 'multi' && liveData.outcomes) {
    const pad = Math.max(12, 16 * s);
    const titleH = props.showTitle ? Math.max(20, 28 * s) : 0;
    const footerH = Math.max(16, 22 * s);
    const availH = height - titleH - footerH - pad * 2;
    const rowH = Math.max(22, 28 * s);
    const rowGap = Math.max(3, 4 * s);
    const maxOutcomes = Math.max(2, Math.floor((availH + rowGap) / (rowH + rowGap)));
    const topOdds = Math.max(1, ...liveData.outcomes.slice(0, maxOutcomes).map(o => o.odds));
    const barMaxFraction = Math.min(0.55, width > 500 ? 0.55 : 0.45);

    return (
      <div style={{
        width, height, position: 'relative',
        background: `rgba(0,0,0,${props.bgOpacity ?? 1})`, backdropFilter: (props.bgOpacity ?? 1) < 1 ? 'blur(16px)' : undefined,
        borderRadius: 10 * s,
        border: `1px solid rgba(255,255,255,0.06)`,
        overflow: 'hidden', fontFamily: 'Kalshi Sans, sans-serif',
      }}>

        <div style={{
          position: 'relative', zIndex: 1,
          padding: pad, height: '100%', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Title row */}
          {props.showTitle && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: Math.max(8, 10 * s), gap: 8 * s, flexShrink: 0,
            }}>
              <div style={{
                fontSize: Math.max(12, 15 * s), fontWeight: 700, color: '#fff',
                flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                letterSpacing: '-0.01em',
              }}>
                {liveData.title}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4 * s,
                flexShrink: 0,
              }}>
                <div style={{
                  width: Math.max(5, 6 * s), height: Math.max(5, 6 * s),
                  borderRadius: '50%', background: '#ef4444',
                  boxShadow: '0 0 4px rgba(239,68,68,0.5)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
                <span style={{
                  fontSize: Math.max(8, 9.5 * s), fontWeight: 700,
                  color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em',
                }}>LIVE</span>
              </div>
            </div>
          )}

          {/* Outcome rows */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: rowGap, justifyContent: 'center', overflow: 'hidden' }}>
            {liveData.outcomes.slice(0, maxOutcomes).map((outcome, i) => {
              const barW = Math.max(0.04, outcome.odds / topOdds) * barMaxFraction;
              const isLeader = i === 0;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: Math.max(6, 8 * s),
                  height: rowH,
                }}>
                  {/* Color pip */}
                  <div style={{
                    width: Math.max(3, 3.5 * s), alignSelf: 'stretch',
                    borderRadius: 2,
                    background: isLeader ? props.accentColor : hexToRgba(props.accentColor, 0.4 + (outcome.odds / topOdds) * 0.4),
                    flexShrink: 0,
                  }} />
                  {/* Name */}
                  <div style={{
                    flex: 1, fontSize: Math.max(11, 13 * s),
                    color: isLeader ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                    fontWeight: isLeader ? 600 : 400,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    minWidth: 0,
                  }}>
                    {outcome.name}
                  </div>
                  {/* Odds value */}
                  <div style={{
                    fontSize: Math.max(12, 14 * s), fontWeight: 700,
                    color: isLeader ? '#fff' : 'rgba(255,255,255,0.65)',
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: Math.max(32, 40 * s), textAlign: 'right',
                    flexShrink: 0,
                  }}>
                    {outcome.odds}<span style={{ fontSize: '0.75em', opacity: 0.5 }}>%</span>
                  </div>
                  {/* Bar */}
                  <div style={{
                    width: width * barMaxFraction,
                    height: Math.max(5, 6 * s),
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 3,
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    <div style={{
                      width: `${barW / barMaxFraction * 100}%`,
                      height: '100%',
                      background: isLeader
                        ? `linear-gradient(90deg, ${hexToRgba(props.accentColor, 0.7)}, ${props.accentColor})`
                        : `linear-gradient(90deg, ${hexToRgba(props.accentColor, 0.25)}, ${hexToRgba(props.accentColor, 0.5)})`,
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: Math.max(6, 8 * s), flexShrink: 0,
          }}>
            {props.showVolume ? (
              <div style={{
                fontSize: Math.max(9, 10.5 * s), color: 'rgba(255,255,255,0.3)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                Vol: ${liveData.volume.toLocaleString()}
              </div>
            ) : <div />}
            <svg width={Math.max(32, 44 * s)} height={Math.max(9, 13 * s)} viewBox="0 0 772 226" fill="none" style={{ opacity: 0.3 }}>
              <path d={KALSHI_LOGO} fill={props.accentColor} />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // ---- Binary / forecast market with full-bleed chart ----

  return (
    <div style={{
      width, height, position: 'relative',
      background: `rgba(0,0,0,${props.bgOpacity ?? 1})`, backdropFilter: (props.bgOpacity ?? 1) < 1 ? 'blur(16px)' : undefined,
      borderRadius: 10 * s,
      border: `1px solid ${hexToRgba(chartColor, 0.15)}`,
      overflow: 'hidden', fontFamily: 'Kalshi Sans, sans-serif',
    }}>
      {/* Top accent glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${hexToRgba(chartColor, 0.5)}, transparent)`,
      }} />

      {/* Background chart */}
      <ChartBackground
        width={width} height={height}
        priceHistory={priceHistory}
        chartColor={chartColor}
        uid={`${uid}b`}
        isLarge={isLarge}
      />

      {/* Content overlay */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', height: '100%', boxSizing: 'border-box',
        padding: `${Math.max(8, 12 * s)}px ${Math.max(10, 16 * s)}px`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* Top: title + LIVE badge */}
        {!isTiny && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: 8 * s,
          }}>
            {props.showTitle ? (
              <div style={{
                fontSize: Math.max(10, (isLarge ? 14 : 12) * s),
                fontWeight: 600, color: '#fff', opacity: 0.85,
                lineHeight: 1.3, textShadow,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: isLarge ? 2 : 1,
                WebkitBoxOrient: 'vertical' as const,
                flex: 1, minWidth: 0,
              }}>
                {liveData.title}
              </div>
            ) : <div style={{ flex: 1 }} />}

            {/* LIVE badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4 * s,
              background: 'rgba(0,0,0,0.45)', borderRadius: 100,
              padding: `${Math.max(2, 3 * s)}px ${Math.max(5, 8 * s)}px`,
              flexShrink: 0,
            }}>
              <div style={{
                width: Math.max(4, 5 * s), height: Math.max(4, 5 * s),
                borderRadius: '50%', background: '#ef4444',
                boxShadow: `0 0 ${3 * s}px rgba(239,68,68,0.6)`,
              }} />
              <span style={{
                fontSize: Math.max(7, 9 * s), fontWeight: 700,
                color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em',
              }}>LIVE</span>
            </div>
          </div>
        )}

        {/* Bottom: odds, change, volume, branding */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          {/* Left: odds + delta */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: Math.max(4, 8 * s), flexWrap: 'wrap' }}>
            <div style={{
              fontSize: Math.max(18, (isLarge ? 44 : isTiny ? 24 : 32) * s),
              fontWeight: 800, color: '#fff',
              fontVariantNumeric: 'tabular-nums', lineHeight: 1,
              textShadow,
            }}>
              {liveData.odds}<span style={{
                fontSize: Math.max(11, (isLarge ? 24 : isTiny ? 14 : 18) * s),
                opacity: 0.5,
              }}>%</span>
            </div>

            {priceChange !== 0 && !isTiny && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 2 * s,
                fontSize: Math.max(9, (isLarge ? 16 : 12) * s),
                fontWeight: 700, color: chartColor, textShadow,
              }}>
                <span>{isPositive ? '▲' : '▼'}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.abs(priceChange).toFixed(1)}</span>
              </div>
            )}

            {isLarge && (
              <div style={{
                fontSize: Math.max(9, 12 * s),
                color: 'rgba(255,255,255,0.35)', fontWeight: 500, textShadow,
              }}>
                chance
              </div>
            )}
          </div>

          {/* Right: volume + Kalshi */}
          {!isTiny && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 * s,
            }}>
              {props.showVolume && isLarge && (
                <div style={{
                  fontSize: Math.max(8, 10 * s),
                  color: 'rgba(255,255,255,0.35)',
                  fontVariantNumeric: 'tabular-nums', textShadow,
                }}>
                  Vol: ${liveData.volume.toLocaleString()}
                </div>
              )}
              <svg
                width={Math.max(28, (isLarge ? 50 : 36) * s)}
                height={Math.max(8, (isLarge ? 14 : 10) * s)}
                viewBox="0 0 772 226" fill="none"
                style={{ opacity: 0.4 }}
              >
                <path d={KALSHI_LOGO} fill={chartColor} />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Props Editor ----

function MarketPropsEditor({ props, onChange }: { props: MarketProps; onChange: (p: MarketProps) => void }) {
  const propsRef = useRef(props);
  propsRef.current = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Debounce ticker extraction so partial URLs don't hit the API
  useEffect(() => {
    const timeout = setTimeout(() => {
      const { marketUrl, ticker: currentTicker } = propsRef.current;
      if (!marketUrl.trim()) {
        if (currentTicker) onChangeRef.current({ ...propsRef.current, ticker: '' });
        return;
      }
      const ticker = extractTicker(marketUrl);
      if (ticker && ticker !== currentTicker) {
        onChangeRef.current({ ...propsRef.current, ticker });
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [props.marketUrl]);

  return (
    <div className={oe.props}>
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>Market URL</span>
        <UrlComboBox value={props.marketUrl} onChange={url => onChange({ ...props, marketUrl: url })} placeholder="https://kalshi.com/markets/..." />
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Accent</span>
          <input type="color" className={oe.color} value={props.accentColor} onChange={e => onChange({ ...props, accentColor: e.target.value })} />
        </div>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showTitle} onChange={e => onChange({ ...props, showTitle: e.target.checked })} />
          Title
        </label>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showVolume} onChange={e => onChange({ ...props, showVolume: e.target.checked })} />
          Volume
        </label>
      </div>
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>Background Opacity — {Math.round((props.bgOpacity ?? 1) * 100)}%</span>
        <input type="range" min={0} max={1} step={0.05} value={props.bgOpacity ?? 1} onChange={e => onChange({ ...props, bgOpacity: parseFloat(e.target.value) })} style={{ width: '100%' }} />
      </div>
    </div>
  );
}

// ---- Register ----

registerElement<MarketProps>({
  type: 'market',
  label: 'Market',
  layerLabel: (p) => p.ticker || 'No market',
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('path', { d: 'M3 3v18h18' }),
    React.createElement('path', { d: 'M7 16l4-8 4 4 6-10' }),
  ),
  defaults: {
    width: 400,
    height: 200,
    zIndex: 1,
    props: {
      type: 'market',
      ticker: '',
      marketUrl: '',
      pollInterval: 30,
      showTitle: true,
      showVolume: true,
      accentColor: '#00DD94',
      bgOpacity: 1,
    },
  },
  Renderer: MarketRenderer,
  PropsEditor: MarketPropsEditor,
  usesMarketData: true,
  usesTradeData: true,
});
