import { useMemo, useState } from 'react';
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
    <svg className={className} width="63" height="16" viewBox="0 0 78 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40.1043 0H36.0332V19.9986H40.1043V0Z" fill="currentColor" fillOpacity="0.9" />
      <path d="M0.416887 0.0221237H4.73849V8.99348L12.818 0.0221237H18.0582L10.6468 8.24586L18.5384 20H13.3608L7.59868 11.5686L4.73849 14.7459V20H0.416887V0.0221237Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M34.4675 19.8117H32.4007C30.5426 19.8117 29.624 19.0017 29.6658 17.4027C29.1229 18.2334 28.4549 18.8771 27.6824 19.3132C26.8891 19.7494 25.9496 19.9778 24.8222 19.9778C23.1729 19.9778 21.8368 19.604 20.8138 18.8564C19.8117 18.088 19.3106 17.0289 19.3106 15.6582C19.3106 14.1007 19.8952 12.8962 21.0434 12.0656C22.2126 11.2141 23.9036 10.778 26.1166 10.778H29.0603V10.0719C29.0603 9.40737 28.8098 8.8882 28.3087 8.49362C27.8077 8.09905 27.1396 7.89138 26.2836 7.89138C25.532 7.89138 24.9266 8.05752 24.4464 8.36902C23.9662 8.70129 23.674 9.1374 23.5905 9.67734H19.6446C19.7699 8.18212 20.4589 7.01916 21.6697 6.18848C22.8806 5.3578 24.4882 4.92169 26.4924 4.92169C28.5801 4.92169 30.2086 5.37857 31.3359 6.29232C32.4842 7.20607 33.0688 8.53516 33.0688 10.2588V15.4298C33.0688 15.7828 33.1523 16.0321 33.2984 16.1774C33.4445 16.302 33.6951 16.3851 34.0291 16.3851H34.4675V19.8117ZM26.0749 13.4569C25.2398 13.4569 24.5717 13.6231 24.0915 13.9761C23.6322 14.3084 23.4026 14.7653 23.4026 15.3675C23.4026 15.8867 23.5905 16.2813 23.9871 16.5928C24.3838 16.9043 24.9266 17.0496 25.5947 17.0496C26.6594 17.0496 27.4945 16.7589 28.1 16.1567C28.7054 15.5544 29.0394 14.7445 29.0603 13.7269V13.4569H26.0749Z" fill="currentColor" />
      <path d="M45.5115 14.9314C45.5741 15.5752 45.8873 16.0944 46.4718 16.5097C47.0564 16.9043 47.7871 17.112 48.6848 17.112C49.5408 17.112 50.2297 16.9874 50.7308 16.7174C51.2318 16.4266 51.4824 16.0321 51.4824 15.5129C51.4824 15.1391 51.3571 14.8483 51.1275 14.6614C50.8978 14.4745 50.5638 14.3292 50.1462 14.2669C49.7287 14.163 49.0397 14.0592 48.0794 13.9554C46.7641 13.7892 45.6785 13.5608 44.8225 13.2908C43.9665 13.0208 43.2567 12.6055 42.7557 12.024C42.2337 11.4426 41.9832 10.6949 41.9832 9.73966C41.9832 8.78438 42.2337 7.9537 42.7557 7.22685C43.2985 6.47924 44.0501 5.91853 45.0104 5.50319C45.9708 5.10861 47.0773 4.90094 48.3299 4.90094C50.355 4.92171 51.9625 5.35782 53.1943 6.1885C54.4469 7.01918 55.115 8.18213 55.2194 9.67736H51.3571C51.2945 9.11665 51.0022 8.68054 50.4594 8.3275C49.9374 7.97446 49.2694 7.78756 48.4343 7.78756C47.6618 7.78756 47.0355 7.93293 46.5553 8.22367C46.096 8.5144 45.8664 8.88821 45.8664 9.36585C45.8664 9.71889 45.9916 9.9681 46.2422 10.1342C46.4927 10.3004 46.8267 10.425 47.2234 10.508C47.6201 10.5911 48.309 10.6742 49.2485 10.7572C51.2527 10.9857 52.7768 11.4218 53.8206 12.0448C54.9062 12.647 55.4282 13.7062 55.4282 15.2222C55.4282 16.1774 55.1359 17.0081 54.5722 17.735C54.0085 18.4618 53.2361 19.0225 52.2131 19.4171C51.211 19.7909 50.0418 19.9986 48.7266 19.9986C46.6806 19.9986 44.9895 19.5417 43.716 18.6487C42.4216 17.735 41.7535 16.4889 41.67 14.9314H45.5115Z" fill="currentColor" />
      <path d="M69.7503 6.72852C68.623 5.6694 67.2033 5.12946 65.4496 5.12946C63.6333 5.12946 62.1719 5.794 61.0654 7.12309V0H56.9943V19.9986H61.0654V12.4602C61.0654 11.1934 61.3368 10.2174 61.9213 9.5113C62.5059 8.80522 63.3201 8.45218 64.364 8.45218C65.3661 8.45218 66.1177 8.78445 66.6187 9.42823C67.1198 10.0512 67.3703 10.965 67.3703 12.1902V19.9986H71.4414V12.0241C71.4414 9.55283 70.8777 7.78763 69.7503 6.72852Z" fill="currentColor" />
      <path d="M73.0068 5.29551H77.0779V19.9778H73.0068V5.29551Z" fill="currentColor" fillOpacity="0.9" />
      <path d="M76.473 0.581477C76.0972 0.20767 75.617 0 75.0324 0C74.4688 0 73.9677 0.20767 73.571 0.581477C73.1952 0.955283 72.9865 1.41216 72.9865 1.97287C72.9865 2.53358 73.1952 3.01122 73.571 3.38503C73.9677 3.75883 74.4688 3.9665 75.0324 3.9665C75.5961 3.9665 76.0972 3.7796 76.473 3.38503C76.8488 2.99045 77.0575 2.53358 77.0575 1.97287C77.0575 1.41216 76.8488 0.934516 76.473 0.581477Z" fill="currentColor" />
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

  // Generate SVG path for chart
  const chartPaths = useMemo(() => {
    if (config.chartData.length === 0) return [];

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
    const paddedRange = paddedMax - paddedMin || 1;

    return config.outcomes.map((outcome) => {
      const points = config.chartData.map((d, i) => {
        const x = padding.left + (i / (config.chartData.length - 1)) * (width - padding.left - padding.right);
        const val = d[`value_${outcome.id}`] ?? d.value;
        const y = padding.top + (1 - (val - paddedMin) / paddedRange) * (height - padding.top - padding.bottom);
        return { x, y };
      });

      const path = `M${points.map((p) => `${p.x},${p.y}`).join(' L')}`;

      return {
        id: outcome.id,
        path,
        color: outcome.color,
      };
    });
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
              <g className="kmp-grid">
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={10 + i * 40}
                    x2="600"
                    y2={10 + i * 40}
                    stroke={config.darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}
              </g>

              {/* Y-axis labels */}
              <g className="kmp-y-labels">
                {['100%', '75%', '50%', '25%'].map((label, i) => (
                  <text key={i} x="615" y={15 + i * 40} className="kmp-axis-label">
                    {label}
                  </text>
                ))}
              </g>

              {/* Chart lines */}
              {chartPaths.map((chartPath) => (
                <path
                  key={chartPath.id}
                  d={chartPath.path}
                  stroke={getOutcomeColor(chartPath.color, config.darkMode === true)}
                  strokeWidth="2"
                  fill="none"
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
