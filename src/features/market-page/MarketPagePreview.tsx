import { useMemo, useState } from 'react';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { GridRows } from '@visx/grid';
import { curveLinear } from '@visx/curve';
import { MarketPageConfig } from '../../types/market-page';

interface MarketPagePreviewProps {
  config: MarketPageConfig;
  onOutcomeSelect: (outcomeId: string) => void;
  onSideSelect: (side: 'Yes' | 'No') => void;
  onSubmitOrder: () => void;
  onAmountChange: (amount: number) => void;
  onLimitPriceChange: (price: number) => void;
  onSidebarStateChange: (state: 'trading' | 'review' | 'confirmation') => void;
  onLogoClick?: () => void;
}

const MARKET_PAGE_PREVIEW_ID = 'market-page-preview';

// Kalshi logo SVG
function KalshiLogo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="55" height="16" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="currentColor" />
    </svg>
  );
}

// Default outcome colors matching Kalshi
const OUTCOME_COLORS = ['#09C285', '#F5A623', '#265CFF', '#FF5A5A', '#9333EA', '#F59E0B'];

// Get outcome color, swapping black for white in dark mode
function getOutcomeColor(color: string, isDarkMode: boolean): string {
  if (isDarkMode && color === '#000000') return '#ffffff';
  return color;
}

/** Shorthand for var(--kmp-*) inline style */
const v = (name: string) => `var(--kmp-${name})`;

// Sub-nav category labels
const SUB_NAV_ITEMS = ['Trending', 'Politics', 'Sports', 'Culture', 'Crypto', 'Climate', 'Economics', 'Mentions', 'Companies', 'Financials', 'Tech & Science'];

export function MarketPagePreview({
  config,
  onOutcomeSelect,
  onSideSelect,
  onSubmitOrder,
  onAmountChange,
  onLimitPriceChange,
  onSidebarStateChange,
  onLogoClick,
}: MarketPagePreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    rules: true,
    timeline: false,
    about: false,
  });
  const [amountInput, setAmountInput] = useState('');

  // Chart scales for visx
  const chartScales = useMemo(() => {
    if (config.chartData.length === 0) return null;

    const width = 600;
    const height = 140;
    const padding = { left: 0, right: 50, top: 10, bottom: 20 };

    const allValues: number[] = [];
    config.outcomes.forEach((outcome) => {
      config.chartData.forEach((d) => {
        const key = `value_${outcome.id}`;
        if (d[key] !== undefined) {
          allValues.push(d[key]);
        }
      });
    });

    if (allValues.length === 0) {
      config.chartData.forEach((d) => allValues.push(d.value));
    }

    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;
    const paddedMin = Math.max(0, minVal - range * 0.1);
    const paddedMax = Math.min(100, maxVal + range * 0.1);

    const xScale = scaleLinear<number>({
      domain: [0, config.chartData.length - 1],
      range: [padding.left, width - padding.right],
    });

    const yScale = scaleLinear<number>({
      domain: [paddedMin, paddedMax],
      range: [height - padding.bottom, padding.top],
    });

    return { xScale, yScale, width, padding };
  }, [config.chartData, config.outcomes]);

  const volume = useMemo(() => {
    if (config.volume) return config.volume;
    const total = config.outcomes.reduce((sum, o) => sum + o.volume, 0);
    if (total >= 1000000) return `$${(total / 1000000).toFixed(1)}M`;
    if (total >= 1000) return `$${total.toLocaleString()}`;
    return `$${total.toLocaleString()}`;
  }, [config.volume, config.outcomes]);

  const sidebarState = config.showReviewPage
    ? config.sidebarState
    : config.sidebarState === 'review'
      ? 'trading'
      : config.sidebarState;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Get top 3 outcomes for legend
  const topOutcomes = useMemo(() => {
    return [...config.outcomes]
      .sort((a, b) => b.yesPrice - a.yesPrice)
      .slice(0, 3);
  }, [config.outcomes]);

  const isDark = config.darkMode === true;
  const selectedOutcome = config.outcomes.find(o => o.id === config.selectedOutcome);

  return (
    <div
      id={MARKET_PAGE_PREVIEW_ID}
      className={`kmp flex min-h-screen w-full flex-col antialiased transition-[background-color,color] duration-200 ${isDark ? 'kmp-dark' : ''}`}
      style={{ background: v('surface'), color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', system-ui, sans-serif" }}
    >
      {/* ═══ Navigation Bar ═══ */}
      <nav className="kmp-nav sticky top-0 z-[100] w-full" style={{ background: v('surface') }}>
        {/* Main nav row */}
        <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between px-6">
          <div className="flex items-center gap-0">
            <button className="flex cursor-pointer items-center border-none bg-none p-0 pr-4" onClick={onLogoClick}>
              <KalshiLogo style={{ color: '#28CC95', width: 80, height: 24 }} />
            </button>
            <div className="flex items-center gap-0">
              {[
                { label: 'MARKETS', badge: null },
                { label: 'LIVE', badge: '21' },
                { label: 'SOCIAL', badge: null },
                { label: 'FAIRNESS', badge: null, dropdown: true },
                { label: 'RESEARCH', badge: null },
              ].map((item) => (
                <a
                  key={item.label}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] no-underline"
                  style={{ color: v('text-primary'), letterSpacing: '1.04px', lineHeight: '20px', fontWeight: 600, fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                >
                  {item.label}
                  {item.badge && (
                    <span className="text-[12px]" style={{ color: '#D91616', fontWeight: 500, lineHeight: '18px' }}>{item.badge}</span>
                  )}
                  {item.dropdown && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}>
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search bar — 400px max, pill shape, subtle bg */}
            <div
              className="kmp-nav-search flex w-[400px] cursor-pointer items-center rounded-full"
              style={{
                background: v('bg'),
                fontFamily: "Inter, 'Inter Fallback', sans-serif",
                height: 38,
                paddingLeft: 16,
                paddingRight: 16,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: v('text-tertiary'), flexShrink: 0, marginRight: 8 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="text-[16px]" style={{ color: v('text-tertiary'), lineHeight: '24px' }}>Trade on anything</span>
            </div>
            {/* Log in */}
            <button
              className="cursor-pointer rounded-full border bg-transparent text-[13px] font-normal"
              style={{ color: v('yes'), borderColor: v('border'), fontFamily: "Inter, 'Inter Fallback', sans-serif", padding: '8px 12px', height: 40 }}
            >
              Log in
            </button>
            {/* Sign up */}
            <button
              className="cursor-pointer rounded-full border-none text-[13px] font-normal"
              style={{ background: '#28CC95', color: isDark ? 'rgba(0,0,0,0.9)' : '#fff', fontFamily: "Inter, 'Inter Fallback', sans-serif", padding: '8px 12px', height: 40 }}
            >
              Sign up
            </button>
          </div>
        </div>
        {/* Sub-nav row */}
        <div className="mx-auto flex max-w-[1320px] items-center gap-4 px-6 pb-2" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}` }}>
          {SUB_NAV_ITEMS.map((item) => (
            <a
              key={item}
              className="cursor-pointer whitespace-nowrap py-1 text-[15px] no-underline"
              style={{ color: v('text-primary'), lineHeight: '22px', fontWeight: 500, fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* ═══ Main Layout ═══ */}
      <div className="kmp-layout mx-auto flex w-full max-w-[1320px] flex-1 gap-10 px-6 pt-6">
        {/* ─── Main Content ─── */}
        <div className="kmp-content min-w-0 flex-1">
          {/* Market Header */}
          <header className="kmp-header mb-6">
            <div className="flex items-start gap-4">
              {/* Market image */}
              <div className="kmp-header-image size-20 shrink-0 overflow-hidden rounded-lg" style={{ background: v('bg') }}>
                {config.image ? (
                  <img src={config.image} alt={config.title} className="size-full object-cover" draggable={false} />
                ) : (
                  <div className="kmp-header-image-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                )}
              </div>
              {/* Title column: breadcrumb + title sit next to the image */}
              <div className="flex min-w-0 flex-1 flex-col gap-1" style={{ marginRight: 24 }}>
                {/* Breadcrumb – small text above the title */}
                <div className="flex items-center gap-1 text-[15px]" style={{ lineHeight: '22px', color: v('text-primary'), fontWeight: 500, fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                  <span className="cursor-pointer">{config.category || 'Politics'}</span>
                  <span className="text-[13px]" style={{ color: v('text-primary'), fontWeight: 400, lineHeight: '20px' }}>·</span>
                  <span className="cursor-pointer">{config.subcategory || 'Congress'}</span>
                </div>
                <h1
                  className="kmp-title m-0 text-[30px] font-medium leading-[36px]"
                  style={{ color: v('text-primary'), fontFamily: "'Barlow Condensed', 'Inter', sans-serif" }}
                >
                  {config.title || 'Market Title'}
                </h1>
              </div>
              {/* Action icons */}
              <div className="kmp-header-actions flex shrink-0 items-center gap-1">
              {/* Calendar */}
              <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent" style={{ color: v('text-primary') }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
              {/* Comment */}
              <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent" style={{ color: v('text-primary') }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              {/* Share */}
              <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent" style={{ color: v('text-primary') }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
              {/* Download */}
              <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent" style={{ color: v('text-primary') }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
            </div>
          </header>

          {/* Chart Legend */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {topOutcomes.map((outcome, index) => (
                <div key={outcome.id} className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: getOutcomeColor(outcome.color || OUTCOME_COLORS[index % OUTCOME_COLORS.length], isDark) }}
                  />
                  <span className="text-[15px] font-normal" style={{ color: v('text-primary'), lineHeight: '22px', fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                    {outcome.name}
                  </span>
                  <span className="text-[16px] font-normal" style={{ color: v('text-primary') }}>
                    {outcome.yesPrice}%
                  </span>
                </div>
              ))}
            </div>
            <KalshiLogo style={{ color: v('brand'), height: 14, width: 'auto' }} />
          </div>

          {/* Chart */}
          <div className="mb-2 w-full">
            <svg className="block h-auto w-full" viewBox="0 0 650 180" preserveAspectRatio="xMidYMid meet">
              {chartScales && (
                <GridRows
                  scale={chartScales.yScale}
                  width={chartScales.width - chartScales.padding.right}
                  left={chartScales.padding.left}
                  stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  tickValues={[0, 25, 50, 75, 100]}
                />
              )}

              {/* Y-axis labels */}
              <g>
                {['100%', '75%', '50%', '25%', '0%'].map((label, i) => (
                  <text key={i} x="615" y={15 + i * 37} className="kmp-axis-label">
                    {label}
                  </text>
                ))}
              </g>

              {/* Chart lines */}
              {chartScales && config.outcomes.map((outcome) => (
                <LinePath
                  key={outcome.id}
                  data={config.chartData}
                  x={(_d, i) => chartScales.xScale(i) ?? 0}
                  y={(d) => chartScales.yScale(d[`value_${outcome.id}`] ?? d.value) ?? 0}
                  stroke={getOutcomeColor(outcome.color, isDark)}
                  strokeWidth={2}
                  curve={curveLinear}
                />
              ))}

              {/* X-axis month labels */}
              <g>
                {['Oct', 'Dec', 'Jan', 'Feb', 'Mar'].map((label, i) => (
                  <text key={i} x={20 + i * 140} y="175" className="kmp-axis-label">
                    {label}
                  </text>
                ))}
              </g>
            </svg>
          </div>

          {/* Chart Footer */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            <span className="text-[13px] font-normal" style={{ color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
              {volume} vol
            </span>
            <div className="flex items-center gap-1">
              {['1D', '1W', '1M', 'ALL'].map((range) => (
                <button
                  key={range}
                  className={`cursor-pointer rounded-md border-none px-2 py-1 text-[13px] ${config.chartTimeRange === range ? 'font-semibold' : 'font-normal'}`}
                  style={{
                    color: config.chartTimeRange === range ? v('text-primary') : v('text-tertiary'),
                    background: 'transparent',
                    fontFamily: "Inter, 'Inter Fallback', sans-serif",
                  }}
                >
                  {range}
                </button>
              ))}
              {/* Settings icon */}
              <button className="flex items-center justify-center p-1.5" style={{ color: v('text-secondary'), background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Markets Header */}
          <div className="kmp-markets-header flex items-center py-3">
            <div className="kmp-markets-header-left flex-1" />
            <div className="kmp-markets-header-center text-[13px] font-normal" style={{ color: v('text-secondary'), width: 100, fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
              Chance
            </div>
            <div className="kmp-markets-header-right flex items-center justify-end gap-1" style={{ width: 288 }}>
              <button
                className="flex size-8 cursor-pointer items-center justify-center rounded-md border-none bg-transparent"
                style={{ color: v('text-tertiary') }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                </svg>
              </button>
              <button
                className="flex size-8 cursor-pointer items-center justify-center rounded-md border-none bg-transparent"
                style={{ color: v('text-tertiary') }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </div>

          {/* Markets List */}
          <div className="flex flex-col">
            {config.outcomes.map((outcome, index) => {
              const isResolvedNo = config.eventStatus === 'closed' && outcome.yesPrice <= 0;
              return (
                <div
                  key={outcome.id}
                  className={`kmp-market-row flex cursor-pointer items-center gap-3 ${config.selectedOutcome === outcome.id ? 'selected' : ''}`}
                  style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, padding: '16px 12px', margin: '0 -12px' }}
                  onClick={() => onOutcomeSelect(outcome.id)}
                >
                  {/* Outcome image */}
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg" style={{ background: v('bg') }}>
                    {outcome.image ? (
                      <img src={outcome.image} alt={outcome.name} className="size-full object-cover" draggable={false} />
                    ) : (
                      <div className="kmp-market-thumb-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                    )}
                  </div>
                  {/* Outcome name */}
                  <div className="kmp-market-info min-w-0 flex-1">
                    <span className="text-[15px] font-normal" style={{ color: v('text-primary'), lineHeight: '22px', fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                      {outcome.name}
                    </span>
                  </div>
                  {/* Chance percentage */}
                  <div className="kmp-market-chance flex items-baseline gap-1.5" style={{ width: 100 }}>
                    {isResolvedNo ? (
                      <span className="text-[24px] font-medium" style={{ color: v('no'), fontFamily: "'Barlow Condensed', 'Inter', sans-serif", lineHeight: '28px' }}>
                        No
                      </span>
                    ) : (
                      <>
                        <span className="text-[24px] font-medium" style={{ color: v('text-primary'), fontFamily: "'Barlow Condensed', 'Inter', sans-serif", lineHeight: '28px' }}>
                          {outcome.yesPrice}%
                        </span>
                        {outcome.change !== 0 && (
                          <span className="text-[12px] font-medium" style={{ color: outcome.change > 0 ? v('yes') : v('no'), lineHeight: '18px', fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                            {outcome.change > 0 ? '▲' : '▼'}&thinsp;{Math.abs(outcome.change)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {/* Yes/No buttons */}
                  {!isResolvedNo && config.eventStatus !== 'closed' && (
                    <div className="kmp-market-buttons flex justify-end gap-2" style={{ width: 288 }}>
                      <button
                        className={`kmp-btn kmp-btn-yes flex h-8 cursor-pointer items-center justify-center gap-1 px-3 text-[13px] font-normal ${index === 0 ? 'selected' : ''}`}
                        style={{ width: 136, fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOutcomeSelect(outcome.id);
                          onSideSelect('Yes');
                        }}
                      >
                        Yes <span className="ml-1">{outcome.yesPrice}¢</span>
                      </button>
                      <button
                        className="kmp-btn kmp-btn-no flex h-8 cursor-pointer items-center justify-center gap-1 px-3 text-[13px] font-normal"
                        style={{ width: 136, fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOutcomeSelect(outcome.id);
                          onSideSelect('No');
                        }}
                      >
                        No <span className="ml-1">{outcome.noPrice}¢</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {config.outcomes.length > 3 && (
              <button
                className="cursor-pointer border-none bg-transparent py-3 text-left text-[15px] font-normal"
                style={{ color: v('text-primary'), lineHeight: '22px', fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
              >
                More markets
              </button>
            )}
          </div>

          {/* Market Rules Section */}
          {config.showRules && (
            <section style={{ marginTop: 32, marginBottom: 24, paddingBottom: 16 }}>
              <button
                className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent pb-3 pt-0 text-left"
                style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                onClick={() => toggleSection('rules')}
              >
                <h2 className="m-0 text-[24px] font-medium leading-[28px]" style={{ color: v('text-primary'), fontFamily: "'Barlow Condensed', 'Inter', sans-serif" }}>
                  Market Rules
                </h2>
                <svg
                  className={`transition-transform duration-200 ${expandedSections.rules ? 'rotate-180' : ''}`}
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: v('text-tertiary') }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {/* Thin divider below heading */}
              <div style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, marginBottom: 16 }} />
              {expandedSections.rules && (
                <div className="pb-4">
                  {/* Outcome selector dropdown */}
                  {config.selectedOutcome && (
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex cursor-pointer items-center gap-1">
                        <span className="text-[15px] font-medium" style={{ color: v('yes') }}>
                          {selectedOutcome?.name}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: v('yes') }}>
                          <path d="M7 10l5 5 5-5z" />
                        </svg>
                      </div>
                      {/* Info icon */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: v('text-tertiary') }}>
                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </div>
                  )}
                  <p className="mb-4 text-[15px] leading-[1.6]" style={{ color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                    {config.rulesText || 'This market will resolve to "Yes" if the specified outcome occurs.'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="cursor-pointer rounded-lg border px-3 py-2 text-[13px] font-normal"
                      style={{ color: v('yes'), borderColor: v('border'), background: 'transparent', fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                    >
                      View full rules
                    </button>
                    <button
                      className="cursor-pointer rounded-lg border px-3 py-2 text-[13px] font-normal"
                      style={{ color: v('yes'), borderColor: v('border'), background: 'transparent', fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                    >
                      Help center
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Timeline and payout Section */}
          <section style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            <button
              className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-4 text-left"
              style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
              onClick={() => toggleSection('timeline')}
            >
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: v('text-secondary') }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-[16px] font-normal" style={{ color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                  Timeline and payout
                </span>
              </div>
              <svg
                className={`transition-transform duration-200 ${expandedSections.timeline ? 'rotate-180' : ''}`}
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ color: v('text-tertiary') }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSections.timeline && (
              <div className="pb-4">
                <p className="mb-3 text-[15px] leading-[1.6]" style={{ color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                  Contracts pay out $1.00 if the outcome is correct.
                </p>
              </div>
            )}
          </section>

          {/* About Section */}
          <section style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            <button
              className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-4 text-left"
              style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
              onClick={() => toggleSection('about')}
            >
              <span className="text-[16px] font-normal" style={{ color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                About
              </span>
              <svg
                className={`transition-transform duration-200 ${expandedSections.about ? 'rotate-180' : ''}`}
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ color: v('text-tertiary') }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSections.about && (
              <div className="pb-4">
                <p className="mb-3 text-[15px] leading-[1.6]" style={{ color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                  This market tracks the outcome of the event described in the title. Trade based on your predictions.
                </p>
              </div>
            )}
          </section>

          {/* Related Markets */}
          {config.showRelatedMarkets && config.relatedMarkets.length > 0 && (
            <section className="pt-4" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: v('text-primary') }}>People are also buying</h2>
              <div className="flex flex-col gap-1">
                {config.relatedMarkets.map((market) => (
                  <div key={market.id} className="kmp-related-item flex cursor-pointer items-center gap-3 py-2">
                    <div className="size-10 shrink-0 overflow-hidden rounded-full" style={{ background: v('bg') }}>
                      {market.image ? (
                        <img src={market.image} alt={market.title} className="size-full object-cover" draggable={false} />
                      ) : (
                        <div className="kmp-related-image-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                      )}
                    </div>
                    <span className="text-[15px] font-medium" style={{ color: v('text-primary') }}>{market.title}</span>
                  </div>
                ))}
              </div>
              <button
                className="mt-3 cursor-pointer border-none bg-transparent p-0 text-sm font-medium hover:underline"
                style={{ color: v('yes'), fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
              >
                Show more
              </button>
            </section>
          )}

          {/* Watermark */}
          {config.showWatermark && (
            <div className="kmp-watermark py-6 text-center text-[11px]" style={{ color: 'rgba(128, 128, 128, 0.4)' }}>
              kalshi.tools
            </div>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <div className="kmp-sidebar w-[352px] shrink-0">
          <div className="kmp-sidebar-content sticky top-[107px]">
            {sidebarState === 'trading' && (
              <>
                {/* Sidebar header: image + title + Buy Yes/No label */}
                <div className="mb-3 flex gap-3">
                  <div className="size-14 min-w-[56px] shrink-0 overflow-hidden rounded-lg">
                    {selectedOutcome?.image ? (
                      <img src={selectedOutcome.image} alt="" className="size-full object-cover" draggable={false} />
                    ) : config.image ? (
                      <img src={config.image} alt="" className="size-full object-cover" draggable={false} />
                    ) : (
                      <div className="kmp-sidebar-trade-thumb-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13px] font-normal leading-5" style={{ color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                      {config.title}
                    </span>
                    <span className="flex items-center gap-1 text-[15px] font-semibold leading-[22px]" style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                      <span style={{ color: config.selectedSide === 'Yes' ? v('yes') : v('no') }}>
                        Buy {config.selectedSide}
                      </span>
                      <span style={{ color: v('text-primary') }}>·</span>
                      <span style={{ color: v('text-primary') }}>
                        {selectedOutcome?.name}
                      </span>
                    </span>
                  </div>
                </div>
                {/* Buy / Sell toggle + Dollars */}
                <div className="mb-2 flex items-center gap-1">
                  <button
                    className="kmp-sidebar-toggle active cursor-pointer px-3 py-0 text-[13px] font-normal leading-[30px]"
                    style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif", height: 32 }}
                  >
                    Buy
                  </button>
                  <button
                    className="kmp-sidebar-toggle cursor-pointer px-3 py-0 text-[13px] font-normal leading-[30px]"
                    style={{ color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', sans-serif", height: 32 }}
                  >
                    Sell
                  </button>
                  <div className="flex-1" />
                  <button
                    className="flex cursor-pointer items-center gap-0.5 border-none bg-transparent p-0 text-[13px] font-normal"
                    style={{ color: v('text-primary'), fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                  >
                    Dollars
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </div>
                {/* Yes / No price buttons */}
                <div className="mb-3 flex gap-2">
                  <button
                    className={`kmp-sidebar-yes flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 text-[13px] font-normal ${config.selectedSide === 'Yes' ? 'active' : ''}`}
                    style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                    onClick={() => {
                      onSideSelect('Yes');
                      const outcome = config.outcomes.find(o => o.id === config.selectedOutcome);
                      if (outcome) onLimitPriceChange(outcome.yesPrice);
                    }}
                  >
                    Yes <span className="ml-1">{selectedOutcome?.yesPrice}¢</span>
                  </button>
                  <button
                    className={`kmp-sidebar-no flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 text-[13px] font-normal ${config.selectedSide === 'No' ? 'active' : ''}`}
                    style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                    onClick={() => {
                      onSideSelect('No');
                      const outcome = config.outcomes.find(o => o.id === config.selectedOutcome);
                      if (outcome) onLimitPriceChange(outcome.noPrice);
                    }}
                  >
                    No <span className="ml-1">{selectedOutcome?.noPrice}¢</span>
                  </button>
                </div>
                {/* Amount input */}
                <div className="mb-3">
                  <div className="kmp-sidebar-input-wrapper flex items-center justify-between px-4 py-[13px]">
                    <div className="flex flex-col gap-0.5">
                      <label className="block text-[13px] leading-5" style={{ color: v('text-primary'), fontWeight: 500, fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>Amount</label>
                      <span className="kmp-sidebar-input-sublabel cursor-pointer text-[12px] leading-[18px]" style={{ fontWeight: 500 }}>Earn 3.25% Interest</span>
                    </div>
                    <input
                      type="text"
                      className="kmp-sidebar-input w-[120px] border-none bg-transparent pl-2 text-right text-[30px] tracking-[-0.6px] outline-none"
                      style={{ color: v('text-primary'), fontWeight: 600, fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
                      placeholder="$0"
                      value={amountInput ? `$${amountInput}` : ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setAmountInput(val);
                        onAmountChange(Number(val) || 0);
                      }}
                    />
                  </div>
                </div>
                {/* Sign up to trade / Submit button */}
                <button
                  className="w-full cursor-pointer rounded-lg border-none px-4 py-3 text-[13px] font-normal transition-[opacity,transform] duration-75 hover:opacity-80 active:scale-[0.97]"
                  style={{
                    background: '#28CC95',
                    color: isDark ? 'rgba(0,0,0,0.9)' : '#fff',
                    height: 48,
                    fontFamily: "Inter, 'Inter Fallback', sans-serif",
                  }}
                  onClick={() => {
                    if (config.showReviewPage) {
                      onSidebarStateChange('review');
                      return;
                    }
                    onSubmitOrder();
                    onSidebarStateChange('confirmation');
                  }}
                >
                  {config.showReviewPage ? 'Review' : 'Sign up to trade'}
                </button>
              </>
            )}

            {sidebarState === 'review' && (
              <>
                <div className="mb-3 flex gap-3">
                  <div className="size-14 min-w-[56px] shrink-0 overflow-hidden rounded-lg">
                    {selectedOutcome?.image ? (
                      <img src={selectedOutcome.image} alt="" className="size-full object-cover" draggable={false} />
                    ) : config.image ? (
                      <img src={config.image} alt="" className="size-full object-cover" draggable={false} />
                    ) : (
                      <div className="kmp-sidebar-trade-thumb-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13px] font-normal leading-5" style={{ color: v('text-primary') }}>{config.title}</span>
                    <span className="flex items-center gap-1 text-[15px] font-semibold leading-[22px]">
                      <span style={{ color: config.selectedSide === 'Yes' ? v('yes') : v('no') }}>Buy {config.selectedSide}</span>
                      <span style={{ color: v('text-primary') }}>·</span>
                      <span style={{ color: v('text-primary') }}>{selectedOutcome?.name}</span>
                    </span>
                  </div>
                </div>
                <div className="mb-4 flex items-center justify-between border-b py-4" style={{ borderColor: v('border') }}>
                  <span className="text-base font-semibold" style={{ color: v('text-primary') }}>Review order</span>
                  <KalshiLogo className="h-4" style={{ color: v('brand') }} />
                </div>
                <div className="mb-5">
                  <div className="flex items-center justify-between border-b py-3" style={{ borderColor: v('border-light') }}>
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: v('text-secondary') }}>
                      Estimated cost
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: v('text-tertiary') }}>
                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold" style={{ color: v('text-primary') }}>${config.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between border-b py-3" style={{ borderColor: v('border-light') }}>
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: v('text-secondary') }}>Odds</span>
                    <span className="text-sm font-semibold" style={{ color: v('yes') }}>{config.limitPrice}% chance</span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: v('text-secondary') }}>
                      Payout if {config.selectedSide}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: v('text-tertiary') }}>
                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                    <span className="text-[28px] font-bold" style={{ color: v('yes') }}>
                      ${config.limitPrice > 0 ? Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex size-12 cursor-pointer items-center justify-center rounded-lg border"
                    style={{ borderColor: v('border'), background: 'transparent', color: v('text-primary') }}
                    onClick={() => onSidebarStateChange('trading')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="flex-1 cursor-pointer rounded-lg border-none px-4 py-3 text-[13px] font-normal transition-[opacity,transform] duration-75 hover:opacity-80 active:scale-[0.97]"
                    style={{ background: '#28CC95', color: isDark ? 'rgba(0,0,0,0.9)' : '#fff' }}
                    onClick={() => { onSubmitOrder(); onSidebarStateChange('confirmation'); }}
                  >
                    Submit
                  </button>
                </div>
              </>
            )}

            {sidebarState === 'confirmation' && (
              <div className="text-left">
                <div className="mb-5 flex items-start justify-between">
                  <div className="size-14 overflow-hidden rounded-lg" style={{ background: v('bg') }}>
                    {selectedOutcome?.image ? (
                      <img src={selectedOutcome.image} alt="" className="size-full object-cover" draggable={false} />
                    ) : config.image ? (
                      <img src={config.image} alt="" className="size-full object-cover" draggable={false} />
                    ) : (
                      <div className="kmp-confirmation-thumb-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                    )}
                  </div>
                  <KalshiLogo className="h-4" style={{ color: v('brand') }} />
                </div>
                <div className="mb-1 text-sm" style={{ color: v('text-secondary') }}>{config.title}</div>
                <div className="mb-6 text-xl font-bold" style={{ color: v('text-primary') }}>{selectedOutcome?.name}</div>
                <div className="mb-6">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm" style={{ color: v('text-secondary') }}>Cost</span>
                    <span className="text-sm font-semibold" style={{ color: v('text-primary') }}>${config.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm" style={{ color: v('text-secondary') }}>Odds</span>
                    <span className="text-sm font-semibold" style={{ color: v('yes') }}>{config.limitPrice}% chance</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm" style={{ color: v('text-secondary') }}>Payout if {config.selectedSide}</span>
                    <span className="text-[28px] font-bold" style={{ color: v('yes') }}>
                      ${config.limitPrice > 0 ? Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="-mt-1 text-right text-[13px]" style={{ color: v('text-tertiary') }}>{config.eventDate}</div>
                </div>
                <button
                  className="w-full cursor-pointer rounded-lg border-none px-4 py-3 text-[13px] font-normal transition-[opacity,transform] duration-75 hover:opacity-80 active:scale-[0.97]"
                  style={{ background: '#28CC95', color: isDark ? 'rgba(0,0,0,0.9)' : '#fff', height: 48 }}
                  onClick={() => onSidebarStateChange('trading')}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { MARKET_PAGE_PREVIEW_ID };
