import { useMemo, useState } from 'react';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { GridRows } from '@visx/grid';
import { curveLinear } from '@visx/curve';
import { MarketPageConfig } from '../../types/market-page';
import './MarketPagePreview.css';

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
function KalshiLogo({ className }: { className?: string }) {
  return (
    <svg className={className} width="55" height="16" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <div id={MARKET_PAGE_PREVIEW_ID} className={`kmp ${config.darkMode ? 'kmp-dark' : ''}`}>
      {/* Navigation Bar */}
      <nav className="kmp-nav">
        <div className="kmp-nav-inner">
          <div className="kmp-nav-left">
            <button className="kmp-nav-logo-btn" onClick={onLogoClick}>
              <KalshiLogo className="kmp-nav-logo" />
            </button>
            <div className="kmp-nav-links">
              <a className="kmp-nav-link">Markets</a>
              <a className="kmp-nav-link kmp-nav-link-live">Live</a>
              <a className="kmp-nav-link">Ideas</a>
              <a className="kmp-nav-link">API</a>
            </div>
          </div>
          <div className="kmp-nav-right">
            <div className="kmp-nav-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search markets or profiles</span>
            </div>
            <button className="kmp-nav-icon-btn" title="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className="kmp-nav-balance">
              <span className="kmp-balance-label">Portfolio</span>
              <span className="kmp-balance-value">{config.portfolioBalance || '$1,250.00'}</span>
            </div>
            <button className="kmp-nav-btn kmp-nav-btn-primary">Deposit</button>
            <div className="kmp-nav-avatar">
              {config.profileImage ? (
                <img src={config.profileImage} alt="Profile" className="kmp-nav-avatar-img" />
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
      <div className="kmp-layout">
        {/* Main Content */}
        <div className="kmp-content">
          {/* Breadcrumb */}
          <div className="kmp-breadcrumb">
            <span className="kmp-breadcrumb-item">{config.category || 'Entertainment'}</span>
            <span className="kmp-breadcrumb-sep">·</span>
            <span className="kmp-breadcrumb-item">{config.subcategory || 'Movies'}</span>
          </div>

          {/* Market Header */}
          <header className="kmp-header">
            <div className="kmp-header-left">
              <div className="kmp-header-image">
                {config.image ? (
                  <img src={config.image} alt={config.title} />
                ) : (
                  <div className="kmp-header-image-placeholder" />
                )}
              </div>
              <div className="kmp-header-text">
                <h1 className="kmp-title">{config.title || 'Market Title'}</h1>
                <div className="kmp-subtitle">
                  {config.eventStatus === 'closed' ? (
                    <span>Closed · {config.eventDate || 'Resolved'}</span>
                  ) : config.eventStatus === 'live' ? (
                    <>
                      <span className="kmp-subtitle-live">
                        <span className="kmp-live-dot-small" />
                        Live
                      </span>
                      <span className="kmp-subtitle-sep">·</span>
                      <span>{config.eventDate || 'Mar 15, 7:00pm EDT'}</span>
                    </>
                  ) : (
                    <>
                      <span>Begins in {config.countdownText || '53 days'}</span>
                      <span className="kmp-subtitle-sep">·</span>
                      <span>{config.eventDate || 'Mar 15, 7:00pm EDT'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="kmp-header-actions">
              <button className="kmp-action-btn" title="Calendar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
              <button className="kmp-action-btn" title="Save">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <button className="kmp-action-btn" title="Share">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
              <button className="kmp-action-btn" title="Download">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
          </header>

          {/* Chart Legend */}
          <div className="kmp-legend-row">
            <div className="kmp-chart-legend">
              {topOutcomes.map((outcome, index) => (
                <div key={outcome.id} className="kmp-legend-item">
                  <span
                    className="kmp-legend-dot"
                    style={{ backgroundColor: getOutcomeColor(outcome.color || OUTCOME_COLORS[index % OUTCOME_COLORS.length], config.darkMode === true) }}
                  />
                  <span className="kmp-legend-name">{outcome.name}</span>
                  <span className="kmp-legend-value">{outcome.yesPrice}%</span>
                </div>
              ))}
            </div>
            <KalshiLogo className="kmp-legend-logo" />
          </div>

          {/* Chart */}
          <div className="kmp-chart-container">
            <svg className="kmp-chart-svg" viewBox="0 0 650 180" preserveAspectRatio="xMidYMid meet">
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
              <g className="kmp-y-labels">
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
              <g className="kmp-x-labels">
                {['8:00am', '8:45am', '9:32am', '10:19am', '11:05am'].map((label, i) => (
                  <text key={i} x={i * 140} y="175" className="kmp-axis-label">
                    {label}
                  </text>
                ))}
              </g>
            </svg>
          </div>

          {/* Chart Footer */}
          <div className="kmp-chart-footer">
            <span className="kmp-volume">{volume} vol</span>
            <div className="kmp-time-selector">
              {['1D', '1W', '1M', 'ALL'].map((range) => (
                <button
                  key={range}
                  className={`kmp-time-btn ${config.chartTimeRange === range ? 'active' : ''}`}
                >
                  {range}
                </button>
              ))}
              <button className="kmp-time-btn kmp-settings-btn">
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
          <div className="kmp-markets-header">
            <div className="kmp-markets-header-left" />
            <div className="kmp-markets-header-center">Chance</div>
            <div className="kmp-markets-header-right">
              <button className="kmp-sort-btn" title="Sort">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Markets List */}
          <div className="kmp-markets-list">
            {config.outcomes.map((outcome, index) => (
              <div
                key={outcome.id}
                className={`kmp-market-row ${config.selectedOutcome === outcome.id ? 'selected' : ''}`}
                onClick={() => onOutcomeSelect(outcome.id)}
              >
                <div className="kmp-market-thumb">
                  {outcome.image ? (
                    <img src={outcome.image} alt={outcome.name} />
                  ) : (
                    <div className="kmp-market-thumb-placeholder" />
                  )}
                </div>
                <div className="kmp-market-info">
                  <span className="kmp-market-name">{outcome.name}</span>
                </div>
                <div className="kmp-market-chance">
                  <span className="kmp-chance-value">{outcome.yesPrice}%</span>
                  {outcome.change !== 0 && (
                    <span className={`kmp-chance-change ${outcome.change > 0 ? 'positive' : 'negative'}`}>
                      {outcome.change > 0 ? '▲' : '▼'}{Math.abs(outcome.change)}
                    </span>
                  )}
                </div>
                <div className="kmp-market-buttons">
                  <button
                    className={`kmp-btn kmp-btn-yes ${index === 0 ? 'filled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOutcomeSelect(outcome.id);
                      onSideSelect('Yes');
                    }}
                  >
                    Yes {outcome.yesPrice}¢
                  </button>
                  <button
                    className="kmp-btn kmp-btn-no"
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
              <button className="kmp-more-link">
                More markets
              </button>
            )}
          </div>

          {/* Rules Summary Section */}
          {config.showRules && (
            <section className="kmp-section">
              <button
                className="kmp-section-header"
                onClick={() => toggleSection('rules')}
              >
                <h2 className="kmp-section-title">Rules summary</h2>
                <svg
                  className={`kmp-chevron ${expandedSections.rules ? 'expanded' : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedSections.rules && (
                <div className="kmp-section-content">
                  {config.selectedOutcome && (
                    <div className="kmp-rules-selector">
                      <span className="kmp-selected-market">
                        {config.outcomes.find((o) => o.id === config.selectedOutcome)?.name}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </div>
                  )}
                  <p className="kmp-rules-text">
                    {config.rulesText || 'This market will resolve to "Yes" if the specified outcome occurs.'}
                  </p>
                  <a className="kmp-rules-link">View full rules</a>
                  <span className="kmp-rules-sep">·</span>
                  <a className="kmp-rules-link">Help center</a>
                </div>
              )}
            </section>
          )}

          {/* Timeline and payout Section */}
          <section className="kmp-section">
            <button
              className="kmp-section-header"
              onClick={() => toggleSection('timeline')}
            >
              <div className="kmp-section-title-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h2 className="kmp-section-title">Timeline and payout</h2>
              </div>
              <svg
                className={`kmp-chevron ${expandedSections.timeline ? 'expanded' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSections.timeline && (
              <div className="kmp-section-content">
                <p className="kmp-rules-text">Contracts pay out $1.00 if the outcome is correct.</p>
              </div>
            )}
          </section>

          {/* About Section */}
          <section className="kmp-section">
            <button
              className="kmp-section-header"
              onClick={() => toggleSection('about')}
            >
              <h2 className="kmp-section-title">About</h2>
              <svg
                className={`kmp-chevron ${expandedSections.about ? 'expanded' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSections.about && (
              <div className="kmp-section-content">
                <p className="kmp-rules-text">
                  This market tracks the outcome of the event described in the title. Trade based on your predictions.
                </p>
              </div>
            )}
          </section>

          {/* Related Markets */}
          {config.showRelatedMarkets && config.relatedMarkets.length > 0 && (
            <section className="kmp-section kmp-related-section">
              <h2 className="kmp-section-title">People are also buying</h2>
              <div className="kmp-related-list">
                {config.relatedMarkets.map((market) => (
                  <div key={market.id} className="kmp-related-item">
                    <div className="kmp-related-image">
                      {market.image ? (
                        <img src={market.image} alt={market.title} />
                      ) : (
                        <div className="kmp-related-image-placeholder" />
                      )}
                    </div>
                    <span className="kmp-related-name">{market.title}</span>
                  </div>
                ))}
              </div>
              <button className="kmp-show-more">Show more</button>
            </section>
          )}

          {/* Watermark */}
          {config.showWatermark && <div className="kmp-watermark">kalshi.tools</div>}
        </div>

        {/* Sidebar */}
        <div className="kmp-sidebar">
          <div className="kmp-sidebar-content">
            {sidebarState === 'trading' && (
              <>
                <div className="kmp-sidebar-trade-header">
                  <div className="kmp-sidebar-trade-thumb">
                    {config.outcomes.find(o => o.id === config.selectedOutcome)?.image ? (
                      <img src={config.outcomes.find(o => o.id === config.selectedOutcome)?.image || ''} alt="" />
                    ) : (
                      <div className="kmp-sidebar-trade-thumb-placeholder" />
                    )}
                  </div>
                  <div className="kmp-sidebar-trade-info">
                    <span className="kmp-sidebar-trade-title">{config.title}</span>
                    <span className="kmp-sidebar-trade-action">
                      <span className="kmp-sidebar-trade-action-text">Buy {config.selectedSide}</span>
                      <span className="kmp-sidebar-trade-sep">·</span>
                      <span>{config.outcomes.find(o => o.id === config.selectedOutcome)?.name}</span>
                    </span>
                  </div>
                </div>
                <div className="kmp-sidebar-toggle-row">
                  <button className="kmp-sidebar-toggle active">Buy</button>
                  <button className="kmp-sidebar-toggle">Sell</button>
                  <div className="kmp-sidebar-toggle-spacer" />
                  <button className="kmp-sidebar-dropdown">
                    Dollars
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </div>
                <div className="kmp-sidebar-buttons">
                  <button
                    className={`kmp-sidebar-yes ${config.selectedSide === 'Yes' ? 'active' : ''}`}
                    onClick={() => {
                      onSideSelect('Yes');
                      const outcome = config.outcomes.find(o => o.id === config.selectedOutcome);
                      if (outcome) onLimitPriceChange(outcome.yesPrice);
                    }}
                  >
                    <span className="kmp-btn-label">Yes</span>
                    <span className="kmp-btn-price">{config.outcomes.find(o => o.id === config.selectedOutcome)?.yesPrice}¢</span>
                  </button>
                  <button
                    className={`kmp-sidebar-no ${config.selectedSide === 'No' ? 'active' : ''}`}
                    onClick={() => {
                      onSideSelect('No');
                      const outcome = config.outcomes.find(o => o.id === config.selectedOutcome);
                      if (outcome) onLimitPriceChange(outcome.noPrice);
                    }}
                  >
                    <span className="kmp-btn-label">No</span>
                    <span className="kmp-btn-price">{config.outcomes.find(o => o.id === config.selectedOutcome)?.noPrice}¢</span>
                  </button>
                </div>
                <div className="kmp-sidebar-input-group">
                  <div className="kmp-sidebar-input-wrapper">
                    <div className="kmp-sidebar-input-left">
                      <label className="kmp-sidebar-input-label">Dollars</label>
                      <span className="kmp-sidebar-input-sublabel">Earn 3.25% Interest</span>
                    </div>
                    <input
                      type="text"
                      className="kmp-sidebar-input"
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
                <div className="kmp-sidebar-summary">
                  <div className="kmp-sidebar-summary-row">
                    <span>Odds</span>
                    <span>{config.limitPrice}% chance</span>
                  </div>
                  <div className="kmp-sidebar-summary-row kmp-sidebar-summary-payout">
                    <span>Payout if {config.selectedSide}</span>
                    <span className="kmp-payout-value">
                      ${Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  className="kmp-sidebar-btn"
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
                <div className="kmp-sidebar-trade-header">
                  <div className="kmp-sidebar-trade-thumb">
                    {config.outcomes.find(o => o.id === config.selectedOutcome)?.image ? (
                      <img src={config.outcomes.find(o => o.id === config.selectedOutcome)?.image || ''} alt="" />
                    ) : (
                      <div className="kmp-sidebar-trade-thumb-placeholder" />
                    )}
                  </div>
                  <div className="kmp-sidebar-trade-info">
                    <span className="kmp-sidebar-trade-title">{config.title}</span>
                    <span className="kmp-sidebar-trade-action">
                      <span className="kmp-sidebar-trade-action-text">Buy {config.selectedSide}</span>
                      <span className="kmp-sidebar-trade-sep">·</span>
                      <span>{config.outcomes.find(o => o.id === config.selectedOutcome)?.name}</span>
                    </span>
                  </div>
                </div>
                <div className="kmp-review-header">
                  <span className="kmp-review-title">Review order</span>
                  <KalshiLogo className="kmp-review-logo" />
                </div>
                <div className="kmp-review-rows">
                  <div className="kmp-review-row">
                    <span className="kmp-review-label">
                      Estimated cost
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                    <span className="kmp-review-value">${config.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="kmp-review-row">
                    <span className="kmp-review-label">Odds</span>
                    <span className="kmp-review-value kmp-review-odds">{config.limitPrice}% chance</span>
                  </div>
                  <div className="kmp-review-row kmp-review-payout-row">
                    <span className="kmp-review-label">
                      Payout if {config.selectedSide}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                    <span className="kmp-review-payout">${Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString()}</span>
                  </div>
                </div>
                <div className="kmp-review-actions">
                  <button className="kmp-review-back" onClick={() => onSidebarStateChange('trading')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="kmp-sidebar-btn" onClick={() => { onSubmitOrder(); onSidebarStateChange('confirmation'); }}>
                    Submit
                  </button>
                </div>
              </>
            )}

            {sidebarState === 'confirmation' && (
              <div className="kmp-confirmation">
                <div className="kmp-confirmation-header">
                  <div className="kmp-confirmation-thumb">
                    {config.outcomes.find(o => o.id === config.selectedOutcome)?.image ? (
                      <img src={config.outcomes.find(o => o.id === config.selectedOutcome)?.image || ''} alt="" />
                    ) : (
                      <div className="kmp-confirmation-thumb-placeholder" />
                    )}
                  </div>
                  <KalshiLogo className="kmp-confirmation-logo" />
                </div>
                <div className="kmp-confirmation-market">{config.title}</div>
                <div className="kmp-confirmation-outcome">{config.outcomes.find(o => o.id === config.selectedOutcome)?.name}</div>
                <div className="kmp-confirmation-rows">
                  <div className="kmp-confirmation-row">
                    <span className="kmp-confirmation-label">
                      Cost
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                      </svg>
                    </span>
                    <span className="kmp-confirmation-value">${config.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="kmp-confirmation-row">
                    <span className="kmp-confirmation-label">Odds</span>
                    <span className="kmp-confirmation-value kmp-confirmation-odds">{config.limitPrice}% chance</span>
                  </div>
                  <div className="kmp-confirmation-row">
                    <span className="kmp-confirmation-label">Payout if {config.selectedSide}</span>
                    <span className="kmp-confirmation-payout">${Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString()}</span>
                  </div>
                  <div className="kmp-confirmation-date">{config.eventDate}</div>
                </div>
                <button className="kmp-sidebar-btn" onClick={() => onSidebarStateChange('trading')}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="kmp-footer">
        <div className="kmp-footer-inner">
          <div className="kmp-footer-col">
            <h3 className="kmp-footer-title">Hot markets</h3>
            <a className="kmp-footer-link">Presidential Election</a>
            <a className="kmp-footer-link">Fed Rate Decisions</a>
            <a className="kmp-footer-link">Stock Markets</a>
          </div>
          <div className="kmp-footer-col">
            <h3 className="kmp-footer-title">Watchlist markets</h3>
            <a className="kmp-footer-link">My Watchlist</a>
          </div>
          <div className="kmp-footer-col">
            <h3 className="kmp-footer-title">Product</h3>
            <a className="kmp-footer-link">Mobile App</a>
            <a className="kmp-footer-link">API</a>
            <a className="kmp-footer-link">Help Center</a>
          </div>
          <div className="kmp-footer-col">
            <h3 className="kmp-footer-title">Related topics</h3>
            <a className="kmp-footer-link">Elections</a>
            <a className="kmp-footer-link">Economy</a>
            <a className="kmp-footer-link">Finance</a>
          </div>
        </div>
        <div className="kmp-footer-bottom">
          <KalshiLogo className="kmp-footer-logo" />
          <span className="kmp-footer-copy">© 2025 Kalshi Inc.</span>
        </div>
      </footer>
    </div>
  );
}

export { MARKET_PAGE_PREVIEW_ID };
