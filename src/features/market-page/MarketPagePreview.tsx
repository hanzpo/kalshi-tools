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
const OUTCOME_COLORS = ['#09C285', '#265CFF', '#000000', '#FF5A5A', '#9333EA', '#F59E0B'];

// Get outcome color, swapping black for white in dark mode
function getOutcomeColor(color: string, isDarkMode: boolean): string {
  if (isDarkMode && color === '#000000') {
    return '#ffffff';
  }
  return color;
}

/** Shorthand for var(--kmp-*) inline style */
const v = (name: string) => `var(--kmp-${name})`;

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
    if (total >= 1000) return `$${Math.round(total / 1000).toLocaleString()},${String(total % 1000).padStart(3, '0')}`;
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

  return (
    <div
      id={MARKET_PAGE_PREVIEW_ID}
      className={`kmp flex min-h-screen w-full flex-col font-sans antialiased transition-[background-color,color] duration-200 ${config.darkMode ? 'kmp-dark' : ''}`}
      style={{ background: v('surface'), color: v('text-primary') }}
    >
      {/* Navigation Bar */}
      <nav
        className="kmp-nav sticky top-0 z-[100] w-full border-b"
        style={{ background: v('surface'), borderColor: v('border') }}
      >
        <div className="kmp-nav-inner mx-auto flex h-14 max-w-[1320px] items-center justify-between px-4">
          <div className="kmp-nav-left flex items-center gap-8">
            <button className="flex cursor-pointer items-center border-none bg-none p-0" onClick={onLogoClick}>
              <KalshiLogo className="h-5 w-auto" style={{ color: v('brand') }} />
            </button>
            <div className="kmp-nav-links flex items-center gap-6">
              <a className="cursor-pointer text-sm font-medium no-underline" style={{ color: v('text-secondary') }}>Markets</a>
              <a className="cursor-pointer text-sm font-medium text-red-500 no-underline">Live</a>
              <a className="cursor-pointer text-sm font-medium no-underline" style={{ color: v('text-secondary') }}>Ideas</a>
              <a className="cursor-pointer text-sm font-medium no-underline" style={{ color: v('text-secondary') }}>API</a>
            </div>
          </div>
          <div className="kmp-nav-right flex items-center gap-3">
            <div
              className="kmp-nav-search flex min-w-[200px] cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm"
              style={{ background: v('bg'), color: v('text-tertiary') }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: v('text-tertiary'), flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search markets or profiles</span>
            </div>
            <button
              className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent"
              style={{ color: v('text-secondary') }}
              title="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className="flex flex-col items-end px-3">
              <span className="text-[11px]" style={{ color: v('text-tertiary') }}>Portfolio</span>
              <span className="text-sm font-semibold" style={{ color: v('text-primary') }}>{config.portfolioBalance || '$1,250.00'}</span>
            </div>
            <button
              className="kmp-nav-btn-primary cursor-pointer rounded-lg border-none px-4 py-2 font-sans text-sm font-medium text-white"
              style={{ background: v('brand') }}
            >
              Deposit
            </button>
            <div
              className="flex size-9 cursor-pointer items-center justify-center rounded-full"
              style={{ background: v('bg'), color: v('text-secondary') }}
            >
              {config.profileImage ? (
                <img src={config.profileImage} alt="Profile" className="size-full rounded-full object-cover" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="kmp-layout mx-auto flex w-full max-w-[1320px] flex-1 gap-6 px-4 py-6">
        {/* Main Content */}
        <div className="kmp-content min-w-0 flex-1">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="cursor-pointer" style={{ color: v('text-secondary') }}>{config.category || 'Entertainment'}</span>
            <span style={{ color: v('text-tertiary') }}>·</span>
            <span className="cursor-pointer" style={{ color: v('text-secondary') }}>{config.subcategory || 'Movies'}</span>
          </div>

          {/* Market Header */}
          <header className="kmp-header mb-6 flex items-start justify-between">
            <div className="kmp-header-left flex items-start gap-4">
              <div className="kmp-header-image size-20 shrink-0 overflow-hidden rounded" style={{ background: v('bg') }}>
                {config.image ? (
                  <img src={config.image} alt={config.title} className="size-full object-cover" />
                ) : (
                  <div className="kmp-header-image-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="kmp-title m-0 text-2xl font-semibold leading-[1.3]" style={{ color: v('text-primary') }}>{config.title || 'Market Title'}</h1>
                <div className="flex items-center gap-2 text-sm" style={{ color: v('text-secondary') }}>
                  {config.eventStatus === 'closed' ? (
                    <span>Closed · {config.eventDate || 'Resolved'}</span>
                  ) : config.eventStatus === 'live' ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-red-500">
                        <span className="size-1.5 animate-[kmp-pulse_2s_infinite] rounded-full bg-red-500" />
                        Live
                      </span>
                      <span style={{ color: v('text-tertiary') }}>·</span>
                      <span>{config.eventDate || 'Mar 15, 7:00pm EDT'}</span>
                    </>
                  ) : (
                    <>
                      <span>Begins in {config.countdownText || '53 days'}</span>
                      <span style={{ color: v('text-tertiary') }}>·</span>
                      <span>{config.eventDate || 'Mar 15, 7:00pm EDT'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="kmp-header-actions flex shrink-0 gap-2">
              {['Calendar', 'Save', 'Share', 'Download'].map((title) => (
                <button
                  key={title}
                  className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent"
                  style={{ color: v('text-primary') }}
                  title={title}
                >
                  {title === 'Calendar' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  )}
                  {title === 'Save' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  )}
                  {title === 'Share' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  )}
                  {title === 'Download' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </header>

          {/* Chart Legend */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {topOutcomes.map((outcome, index) => (
                <div key={outcome.id} className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: getOutcomeColor(outcome.color || OUTCOME_COLORS[index % OUTCOME_COLORS.length], config.darkMode === true) }}
                  />
                  <span className="text-sm" style={{ color: v('text-primary') }}>{outcome.name}</span>
                  <span className="text-sm font-semibold" style={{ color: v('text-primary') }}>{outcome.yesPrice}%</span>
                </div>
              ))}
            </div>
            <KalshiLogo className="h-3.5" style={{ color: v('brand') }} />
          </div>

          {/* Chart */}
          <div className="mb-2 w-full">
            <svg className="block h-auto w-full" viewBox="0 0 650 180" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              {chartScales && (
                <GridRows
                  scale={chartScales.yScale}
                  width={chartScales.width - chartScales.padding.right}
                  left={chartScales.padding.left}
                  stroke={config.darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  tickValues={[25, 50, 75, 100]}
                />
              )}

              {/* Y-axis labels */}
              <g>
                {['100%', '75%', '50%', '25%'].map((label, i) => (
                  <text key={i} x="615" y={15 + i * 40} className="kmp-axis-label">
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
                  stroke={getOutcomeColor(outcome.color, config.darkMode === true)}
                  strokeWidth={2}
                  curve={curveLinear}
                />
              ))}

              {/* X-axis time labels */}
              <g>
                {['8:00am', '8:45am', '9:32am', '10:19am', '11:05am'].map((label, i) => (
                  <text key={i} x={i * 140} y="175" className="kmp-axis-label">
                    {label}
                  </text>
                ))}
              </g>
            </svg>
          </div>

          {/* Chart Footer */}
          <div className="flex items-center justify-between border-b py-3" style={{ borderColor: v('border-light') }}>
            <span className="text-sm font-medium" style={{ color: v('text-primary') }}>{volume} vol</span>
            <div className="flex items-center gap-1">
              {['1D', '1W', '1M', 'ALL'].map((range) => (
                <button
                  key={range}
                  className={`cursor-pointer rounded-md border-none bg-none px-3 py-1.5 font-sans text-sm font-medium ${config.chartTimeRange === range ? 'font-semibold' : ''}`}
                  style={{
                    color: config.chartTimeRange === range ? v('text-primary') : v('text-tertiary'),
                    background: config.chartTimeRange === range ? v('bg') : 'transparent',
                  }}
                >
                  {range}
                </button>
              ))}
              <button className="flex items-center justify-center p-1.5" style={{ color: v('text-secondary') }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Markets Header */}
          <div className="kmp-markets-header flex items-center py-3">
            <div className="kmp-markets-header-left flex-1" />
            <div className="kmp-markets-header-center w-[100px] text-[13px] font-medium" style={{ color: v('text-tertiary') }}>Chance</div>
            <div className="kmp-markets-header-right flex w-60 justify-end gap-1">
              <button
                className="flex size-8 cursor-pointer items-center justify-center rounded-md border-none bg-transparent"
                style={{ color: v('text-tertiary') }}
                title="Sort"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Markets List */}
          <div className="flex flex-col">
            {config.outcomes.map((outcome, index) => (
              <div
                key={outcome.id}
                className={`kmp-market-row flex cursor-pointer items-center gap-3 border-b py-3 ${config.selectedOutcome === outcome.id ? 'selected' : ''}`}
                style={{ borderColor: v('border-light') }}
                onClick={() => onOutcomeSelect(outcome.id)}
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-lg" style={{ background: v('bg') }}>
                  {outcome.image ? (
                    <img src={outcome.image} alt={outcome.name} className="size-full object-cover" />
                  ) : (
                    <div className="kmp-market-thumb-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                  )}
                </div>
                <div className="kmp-market-info min-w-0 flex-1">
                  <span className="text-[15px] font-medium" style={{ color: v('text-primary') }}>{outcome.name}</span>
                </div>
                <div className="kmp-market-chance flex w-[100px] items-baseline gap-1.5">
                  <span className="text-2xl font-semibold" style={{ color: v('text-primary') }}>{outcome.yesPrice}%</span>
                  {outcome.change !== 0 && (
                    <span className="text-xs font-medium" style={{ color: outcome.change > 0 ? v('brand') : v('no') }}>
                      {outcome.change > 0 ? '▲' : '▼'}{Math.abs(outcome.change)}
                    </span>
                  )}
                </div>
                <div className="kmp-market-buttons flex w-60 justify-end gap-2">
                  <button
                    className={`kmp-btn kmp-btn-yes h-10 min-w-[100px] cursor-pointer rounded-lg border-none px-4 font-sans text-[15px] font-medium hover:opacity-90 ${index === 0 ? 'filled' : ''}`}
                    style={index === 0 ? { background: '#265CFF', color: 'white' } : { background: '#EFF2FF', color: '#265CFF' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOutcomeSelect(outcome.id);
                      onSideSelect('Yes');
                    }}
                  >
                    Yes {outcome.yesPrice}¢
                  </button>
                  <button
                    className="kmp-btn kmp-btn-no h-10 min-w-[100px] cursor-pointer rounded-lg border-none px-4 font-sans text-[15px] font-medium hover:opacity-90"
                    style={{ background: '#F9EBFF', color: '#AA08FF' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOutcomeSelect(outcome.id);
                      onSideSelect('No');
                    }}
                  >
                    No {outcome.noPrice}¢
                  </button>
                </div>
              </div>
            ))}
            {config.outcomes.length > 3 && (
              <button
                className="cursor-pointer border-none bg-transparent py-3 text-left font-sans text-[15px] font-medium"
                style={{ color: v('text-primary') }}
              >
                More markets
              </button>
            )}
          </div>

          {/* Rules Summary Section */}
          {config.showRules && (
            <section className="border-t" style={{ borderColor: v('border-light') }}>
              <button
                className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-4 text-left font-sans"
                onClick={() => toggleSection('rules')}
              >
                <h2 className="m-0 text-lg font-semibold" style={{ color: v('text-primary') }}>Rules summary</h2>
                <svg
                  className={`transition-transform duration-200 ${expandedSections.rules ? 'rotate-180' : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: v('text-tertiary') }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedSections.rules && (
                <div className="pb-4">
                  {config.selectedOutcome && (
                    <div className="mb-2 flex cursor-pointer items-center gap-1">
                      <span className="text-[15px] font-medium" style={{ color: v('brand') }}>
                        {config.outcomes.find((o) => o.id === config.selectedOutcome)?.name}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: v('brand') }}>
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </div>
                  )}
                  <p className="mb-3 text-[15px] leading-[1.6]" style={{ color: v('text-primary') }}>
                    {config.rulesText || 'This market will resolve to "Yes" if the specified outcome occurs.'}
                  </p>
                  <a className="cursor-pointer text-sm no-underline hover:underline" style={{ color: v('brand') }}>View full rules</a>
                  <span className="mx-2" style={{ color: v('text-tertiary') }}>·</span>
                  <a className="cursor-pointer text-sm no-underline hover:underline" style={{ color: v('brand') }}>Help center</a>
                </div>
              )}
            </section>
          )}

          {/* Timeline and payout Section */}
          <section className="border-t" style={{ borderColor: v('border-light') }}>
            <button
              className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-4 text-left font-sans"
              onClick={() => toggleSection('timeline')}
            >
              <div className="flex items-center gap-2" style={{ color: v('text-secondary') }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h2 className="m-0 text-lg font-semibold" style={{ color: v('text-primary') }}>Timeline and payout</h2>
              </div>
              <svg
                className={`transition-transform duration-200 ${expandedSections.timeline ? 'rotate-180' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: v('text-tertiary') }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSections.timeline && (
              <div className="pb-4">
                <p className="mb-3 text-[15px] leading-[1.6]" style={{ color: v('text-primary') }}>Contracts pay out $1.00 if the outcome is correct.</p>
              </div>
            )}
          </section>

          {/* About Section */}
          <section className="border-t" style={{ borderColor: v('border-light') }}>
            <button
              className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-4 text-left font-sans"
              onClick={() => toggleSection('about')}
            >
              <h2 className="m-0 text-lg font-semibold" style={{ color: v('text-primary') }}>About</h2>
              <svg
                className={`transition-transform duration-200 ${expandedSections.about ? 'rotate-180' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: v('text-tertiary') }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSections.about && (
              <div className="pb-4">
                <p className="mb-3 text-[15px] leading-[1.6]" style={{ color: v('text-primary') }}>
                  This market tracks the outcome of the event described in the title. Trade based on your predictions.
                </p>
              </div>
            )}
          </section>

          {/* Related Markets */}
          {config.showRelatedMarkets && config.relatedMarkets.length > 0 && (
            <section className="border-t pt-4" style={{ borderColor: v('border-light') }}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: v('text-primary') }}>People are also buying</h2>
              <div className="flex flex-col gap-1">
                {config.relatedMarkets.map((market) => (
                  <div key={market.id} className="kmp-related-item flex cursor-pointer items-center gap-3 py-2">
                    <div className="size-10 shrink-0 overflow-hidden rounded-full" style={{ background: v('bg') }}>
                      {market.image ? (
                        <img src={market.image} alt={market.title} className="size-full object-cover" />
                      ) : (
                        <div className="kmp-related-image-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                      )}
                    </div>
                    <span className="text-[15px] font-medium" style={{ color: v('text-primary') }}>{market.title}</span>
                  </div>
                ))}
              </div>
              <button
                className="mt-3 cursor-pointer border-none bg-transparent p-0 font-sans text-sm font-medium hover:underline"
                style={{ color: v('brand') }}
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

        {/* Sidebar */}
        <div className="kmp-sidebar ml-8 w-[328px] shrink-0">
          <div
            className="kmp-sidebar-content sticky top-[89px] rounded-2xl p-5"
            style={{
              background: v('surface'),
              boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 2px, rgba(0, 0, 0, 0.1) 0px 2px 4px',
            }}
          >
            {sidebarState === 'trading' && (
              <>
                <div className="mb-3 flex gap-3">
                  <div className="size-14 min-w-[56px] shrink-0 overflow-hidden rounded-lg">
                    {config.outcomes.find(o => o.id === config.selectedOutcome)?.image ? (
                      <img src={config.outcomes.find(o => o.id === config.selectedOutcome)?.image || ''} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="kmp-sidebar-trade-thumb-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                    <span className="text-[13px] font-normal leading-5 tracking-[0.13px]" style={{ color: v('text-primary') }}>{config.title}</span>
                    <span className="flex items-center gap-1 text-[15px] font-semibold leading-6">
                      <span className="font-semibold text-[#265CFF]">Buy {config.selectedSide}</span>
                      <span style={{ color: v('text-primary') }}>·</span>
                      <span style={{ color: v('text-primary') }}>{config.outcomes.find(o => o.id === config.selectedOutcome)?.name}</span>
                    </span>
                  </div>
                </div>
                <div className="mb-2 flex items-center gap-1">
                  <button
                    className="kmp-sidebar-toggle active cursor-pointer rounded-full border px-3 py-1 font-sans text-[13px] font-medium leading-5 tracking-[0.13px] transition-[opacity,background-color,transform] duration-75 active:scale-90"
                    style={{ borderColor: v('border'), color: v('text-primary') }}
                  >
                    Buy
                  </button>
                  <button
                    className="kmp-sidebar-toggle cursor-pointer rounded-full border px-3 py-1 font-sans text-[13px] font-medium leading-5 tracking-[0.13px] transition-[opacity,background-color,transform] duration-75 active:scale-90"
                    style={{ borderColor: v('border'), color: v('text-primary') }}
                  >
                    Sell
                  </button>
                  <div className="flex-1" />
                  <button
                    className="flex cursor-pointer items-center gap-0.5 rounded-lg border-none bg-transparent p-0 font-sans text-[13px] font-medium leading-5 tracking-[0.13px]"
                    style={{ color: v('text-primary') }}
                  >
                    Dollars
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </div>
                <div className="mb-3 flex gap-1">
                  <button
                    className={`kmp-sidebar-yes flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none font-sans font-medium transition-[opacity,background-color,transform] duration-75 hover:opacity-80 active:scale-90 ${config.selectedSide === 'Yes' ? 'active' : ''}`}
                    style={config.selectedSide === 'Yes' ? { background: '#265CFF', color: 'white' } : { background: '#EFF2FF', color: '#265CFF' }}
                    onClick={() => {
                      onSideSelect('Yes');
                      const outcome = config.outcomes.find(o => o.id === config.selectedOutcome);
                      if (outcome) onLimitPriceChange(outcome.yesPrice);
                    }}
                  >
                    <span className="text-[15px] leading-6">Yes</span>
                    <span className="text-lg leading-[30px]">{config.outcomes.find(o => o.id === config.selectedOutcome)?.yesPrice}¢</span>
                  </button>
                  <button
                    className={`kmp-sidebar-no flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none font-sans font-medium transition-[opacity,background-color,transform] duration-75 hover:opacity-80 active:scale-90 ${config.selectedSide === 'No' ? 'active' : ''}`}
                    style={config.selectedSide === 'No' ? { background: '#AA08FF', color: 'white' } : { background: '#F9EBFF', color: '#AA08FF' }}
                    onClick={() => {
                      onSideSelect('No');
                      const outcome = config.outcomes.find(o => o.id === config.selectedOutcome);
                      if (outcome) onLimitPriceChange(outcome.noPrice);
                    }}
                  >
                    <span className="text-[15px] leading-6">No</span>
                    <span className="text-lg leading-[30px]">{config.outcomes.find(o => o.id === config.selectedOutcome)?.noPrice}¢</span>
                  </button>
                </div>
                <div className="mb-3">
                  <div
                    className="kmp-sidebar-input-wrapper flex items-center justify-between rounded-lg border px-2 py-[13px] transition-[border-color] duration-150"
                    style={{ background: v('surface'), borderColor: v('border') }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <label className="block text-[13px] font-medium leading-5 tracking-[0.13px]" style={{ color: v('text-primary') }}>Dollars</label>
                      <span className="kmp-sidebar-input-sublabel cursor-pointer text-[13px] font-normal leading-5 tracking-[0.13px]" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Earn 3.25% Interest</span>
                    </div>
                    <input
                      type="text"
                      className="kmp-sidebar-input w-[145px] border-none bg-transparent pl-2 text-right font-sans text-[30px] font-semibold tracking-[-0.6px] outline-none"
                      style={{ color: v('text-primary') }}
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
                <div className="mb-3 flex flex-col gap-1.5">
                  <div className="kmp-sidebar-summary-row flex items-baseline justify-between px-0 py-1.5 text-[13px] leading-5 tracking-[0.13px]" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                    <span>Odds</span>
                    <span className="text-[15px] font-medium leading-6 tracking-[0.15px]" style={{ color: v('text-primary') }}>{config.limitPrice}% chance</span>
                  </div>
                  <div className="kmp-sidebar-summary-row flex items-start justify-between px-0 py-1.5 text-[13px] leading-5 tracking-[0.13px]" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                    <span>Payout if {config.selectedSide}</span>
                    <span className="text-[30px] font-semibold leading-10 tracking-[-0.6px] text-[#0AC285]!">
                      ${Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  className="kmp-sidebar-btn w-full cursor-pointer rounded-lg border-none bg-[#0AC285] px-2 py-3 font-sans text-[15px] font-medium leading-6 tracking-[0.15px] text-white transition-[opacity,background-color,transform] duration-75 hover:opacity-80 active:scale-90 active:bg-[#089968]"
                  onClick={() => {
                    if (config.showReviewPage) {
                      onSidebarStateChange('review');
                      return;
                    }
                    onSubmitOrder();
                    onSidebarStateChange('confirmation');
                  }}
                >
                  {config.showReviewPage ? 'Review' : 'Submit order'}
                </button>
              </>
            )}

            {sidebarState === 'review' && (
              <>
                <div className="mb-3 flex gap-3">
                  <div className="size-14 min-w-[56px] shrink-0 overflow-hidden rounded-lg">
                    {config.outcomes.find(o => o.id === config.selectedOutcome)?.image ? (
                      <img src={config.outcomes.find(o => o.id === config.selectedOutcome)?.image || ''} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="kmp-sidebar-trade-thumb-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                    <span className="text-[13px] font-normal leading-5 tracking-[0.13px]" style={{ color: v('text-primary') }}>{config.title}</span>
                    <span className="flex items-center gap-1 text-[15px] font-semibold leading-6">
                      <span className="font-semibold text-[#265CFF]">Buy {config.selectedSide}</span>
                      <span style={{ color: v('text-primary') }}>·</span>
                      <span style={{ color: v('text-primary') }}>{config.outcomes.find(o => o.id === config.selectedOutcome)?.name}</span>
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
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold" style={{ color: v('text-primary') }}>${config.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between border-b py-3" style={{ borderColor: v('border-light') }}>
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: v('text-secondary') }}>Odds</span>
                    <span className="text-sm font-semibold" style={{ color: v('brand') }}>{config.limitPrice}% chance</span>
                  </div>
                  <div className="flex items-center justify-between py-4" style={{ borderColor: v('border-light') }}>
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: v('text-secondary') }}>
                      Payout if {config.selectedSide}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: v('text-tertiary') }}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                    <span className="text-[28px] font-bold" style={{ color: v('brand') }}>${Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex size-12 cursor-pointer items-center justify-center rounded-lg border"
                    style={{ borderColor: v('border'), background: v('surface'), color: v('text-primary') }}
                    onClick={() => onSidebarStateChange('trading')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="kmp-sidebar-btn flex-1 cursor-pointer rounded-lg border-none bg-[#0AC285] px-2 py-3 font-sans text-[15px] font-medium leading-6 tracking-[0.15px] text-white transition-[opacity,background-color,transform] duration-75 hover:opacity-80 active:scale-90 active:bg-[#089968]"
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
                    {config.outcomes.find(o => o.id === config.selectedOutcome)?.image ? (
                      <img src={config.outcomes.find(o => o.id === config.selectedOutcome)?.image || ''} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="kmp-confirmation-thumb-placeholder size-full" style={{ background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                    )}
                  </div>
                  <KalshiLogo className="h-4" style={{ color: v('brand') }} />
                </div>
                <div className="mb-1 text-sm" style={{ color: v('text-secondary') }}>{config.title}</div>
                <div className="mb-6 text-xl font-bold" style={{ color: v('text-primary') }}>{config.outcomes.find(o => o.id === config.selectedOutcome)?.name}</div>
                <div className="mb-6">
                  <div className="flex items-center justify-between py-2">
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: v('text-secondary') }}>
                      Cost
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: v('brand'), width: 16, height: 16 }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                      </svg>
                    </span>
                    <span className="text-sm font-semibold" style={{ color: v('text-primary') }}>${config.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: v('text-secondary') }}>Odds</span>
                    <span className="text-sm font-semibold" style={{ color: v('brand') }}>{config.limitPrice}% chance</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: v('text-secondary') }}>Payout if {config.selectedSide}</span>
                    <span className="text-[28px] font-bold" style={{ color: v('brand') }}>${Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString()}</span>
                  </div>
                  <div className="-mt-1 text-right text-[13px]" style={{ color: v('text-tertiary') }}>{config.eventDate}</div>
                </div>
                <button
                  className="kmp-sidebar-btn w-full cursor-pointer rounded-lg border-none bg-[#0AC285] px-2 py-3 font-sans text-[15px] font-medium leading-6 tracking-[0.15px] text-white transition-[opacity,background-color,transform] duration-75 hover:opacity-80 active:scale-90 active:bg-[#089968]"
                  onClick={() => onSidebarStateChange('trading')}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-12 pb-6" style={{ background: v('bg') }}>
        <div className="mx-auto flex max-w-[1320px] flex-wrap gap-12 px-4">
          <div className="flex min-w-[150px] flex-col gap-2">
            <h3 className="mb-2 text-sm font-semibold" style={{ color: v('text-primary') }}>Hot markets</h3>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>Presidential Election</a>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>Fed Rate Decisions</a>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>Stock Markets</a>
          </div>
          <div className="flex min-w-[150px] flex-col gap-2">
            <h3 className="mb-2 text-sm font-semibold" style={{ color: v('text-primary') }}>Watchlist markets</h3>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>My Watchlist</a>
          </div>
          <div className="flex min-w-[150px] flex-col gap-2">
            <h3 className="mb-2 text-sm font-semibold" style={{ color: v('text-primary') }}>Product</h3>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>Mobile App</a>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>API</a>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>Help Center</a>
          </div>
          <div className="flex min-w-[150px] flex-col gap-2">
            <h3 className="mb-2 text-sm font-semibold" style={{ color: v('text-primary') }}>Related topics</h3>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>Elections</a>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>Economy</a>
            <a className="cursor-pointer text-sm no-underline" style={{ color: v('text-secondary') }}>Finance</a>
          </div>
        </div>
        <div className="kmp-footer-bottom mx-auto mt-12 flex max-w-[1320px] items-center gap-4 border-t px-4 pt-6" style={{ borderColor: v('border') }}>
          <KalshiLogo className="h-4" style={{ color: v('text-tertiary') }} />
          <span className="text-[13px]" style={{ color: v('text-tertiary') }}>© 2025 Kalshi Inc.</span>
        </div>
      </footer>
    </div>
  );
}

export { MARKET_PAGE_PREVIEW_ID };
