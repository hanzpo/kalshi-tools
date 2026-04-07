import { useMemo, useState } from 'react';
import { scaleLinear } from '@visx/scale';
import { MarketPageConfig } from '../../types/market-page';
import { MarketPageNav } from './MarketPageNav';
import { MarketPageChart } from './MarketPageChart';
import { MarketPageSidebar } from './MarketPageSidebar';
import { v } from './helpers';

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
      className={`kmp flex min-h-screen w-full flex-col bg-[var(--kmp-surface)] text-[var(--kmp-text-primary)] antialiased transition-[background-color,color] duration-200 ${isDark ? 'kmp-dark' : ''}`}
    >
      <MarketPageNav isDark={isDark} onLogoClick={onLogoClick} />

      {/* ═══ Main Layout ═══ */}
      <div className="mx-auto flex w-full max-w-[1320px] flex-1 gap-10 px-6 pt-6">
        {/* ─── Main Content ─── */}
        <div className="min-w-0 flex-1">
          {/* Market Header */}
          <header className="mb-6">
            <div className="flex items-start gap-4">
              {/* Market image */}
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-[var(--kmp-bg)]">
                {config.image ? (
                  <img src={config.image} alt={config.title} className="size-full object-cover" draggable={false} />
                ) : (
                  <div className="size-full" style={{ background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                )}
              </div>
              {/* Title column: breadcrumb + title sit next to the image */}
              <div className="mr-6 flex min-w-0 flex-1 flex-col gap-1">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-[15px] font-medium leading-[22px] text-[var(--kmp-text-primary)]">
                  <span className="cursor-pointer">{config.category || 'Politics'}</span>
                  <span className="text-[13px] font-normal leading-5 text-[var(--kmp-text-primary)]">·</span>
                  <span className="cursor-pointer">{config.subcategory || 'Congress'}</span>
                </div>
                <h1
                  className="m-0 text-[30px] font-medium leading-[36px] text-[var(--kmp-text-primary)]"
                  style={{ fontFamily: "'Barlow Condensed', 'Inter', sans-serif" }}
                >
                  {config.title || 'Market Title'}
                </h1>
              </div>
              {/* Action icons */}
              <div className="flex shrink-0 items-center gap-1">
              {/* Calendar */}
              <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[var(--kmp-text-secondary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
              {/* Comment */}
              <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[var(--kmp-text-secondary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              {/* Share */}
              <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[var(--kmp-text-secondary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
              {/* Download */}
              <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[var(--kmp-text-secondary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
            </div>
          </header>

          <MarketPageChart
            chartScales={chartScales}
            config={config}
            isDark={isDark}
            volume={volume}
            topOutcomes={topOutcomes}
          />

          {/* Markets Header */}
          <div className="flex items-center py-3">
            <div className="flex-1" />
            <div className="w-[100px] text-[13px] font-normal text-[var(--kmp-text-secondary)]">
              Chance
            </div>
            <div className="flex w-[288px] items-center justify-end gap-1">
              <button
                className="flex size-8 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-[var(--kmp-text-tertiary)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                </svg>
              </button>
              <button
                className="flex size-8 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-[var(--kmp-text-tertiary)]"
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
            {config.outcomes.map((outcome) => {
              const isResolvedNo = config.eventStatus === 'closed' && outcome.yesPrice <= 0;
              return (
                <div
                  key={outcome.id}
                  className="-mx-3 flex cursor-pointer items-center gap-3 px-3 py-4"
                  style={{
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                  onClick={() => onOutcomeSelect(outcome.id)}
                >
                  {/* Outcome image */}
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[var(--kmp-bg)]">
                    {outcome.image ? (
                      <img src={outcome.image} alt={outcome.name} className="size-full object-cover" draggable={false} />
                    ) : (
                      <div className="size-full" style={{ background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                    )}
                  </div>
                  {/* Outcome name */}
                  <div className="min-w-0 flex-1">
                    <span className="text-[15px] font-normal leading-[22px] text-[var(--kmp-text-primary)]">
                      {outcome.name}
                    </span>
                  </div>
                  {/* Chance percentage */}
                  <div className="flex w-[100px] items-baseline gap-1.5">
                    {isResolvedNo ? (
                      <span
                        className="text-[24px] font-medium leading-7 text-[var(--kmp-no)]"
                        style={{ fontFamily: "'Barlow Condensed', 'Inter', sans-serif" }}
                      >
                        No
                      </span>
                    ) : (
                      <>
                        <span
                          className="text-[24px] font-medium leading-7 text-[var(--kmp-text-primary)]"
                          style={{ fontFamily: "'Barlow Condensed', 'Inter', sans-serif" }}
                        >
                          {outcome.yesPrice}%
                        </span>
                        {outcome.change !== 0 && (
                          <span className={`text-[12px] font-medium leading-[18px] ${outcome.change > 0 ? 'text-[var(--kmp-yes)]' : 'text-[var(--kmp-no)]'}`}>
                            {outcome.change > 0 ? '▲' : '▼'}&thinsp;{Math.abs(outcome.change)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {/* Yes/No buttons */}
                  {!isResolvedNo && config.eventStatus !== 'closed' && (
                    <div className="flex w-[288px] justify-end gap-2">
                      <button
                        className="flex h-8 w-[136px] cursor-pointer items-center justify-center gap-1 rounded-full border px-3 text-[13px] font-normal"
                        style={{
                          background: config.selectedOutcome === outcome.id && config.selectedSide === 'Yes' ? v('yes-bg') : 'transparent',
                          color: v('yes'),
                          borderColor: config.selectedOutcome === outcome.id && config.selectedSide === 'Yes' ? v('yes') : v('border'),
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOutcomeSelect(outcome.id);
                          onSideSelect('Yes');
                        }}
                      >
                        Yes <span className="ml-1">{outcome.yesPrice}¢</span>
                      </button>
                      <button
                        className="flex h-8 w-[136px] cursor-pointer items-center justify-center gap-1 rounded-full border px-3 text-[13px] font-normal"
                        style={{
                          background: config.selectedOutcome === outcome.id && config.selectedSide === 'No' ? v('no-bg') : 'transparent',
                          color: v('no'),
                          borderColor: config.selectedOutcome === outcome.id && config.selectedSide === 'No' ? v('no') : v('border'),
                        }}
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
                className="cursor-pointer border-none bg-transparent py-3 text-left text-[15px] font-normal leading-[22px] text-[var(--kmp-text-primary)]"
              >
                More markets
              </button>
            )}
          </div>

          {/* Market Rules Section */}
          {config.showRules && (
            <section className="mb-6 mt-8 pb-4">
              <button
                className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent pb-3 pt-0 text-left"
                onClick={() => toggleSection('rules')}
              >
                <h2
                  className="m-0 text-[24px] font-medium leading-7 text-[var(--kmp-text-primary)]"
                  style={{ fontFamily: "'Barlow Condensed', 'Inter', sans-serif" }}
                >
                  Market Rules
                </h2>
                <svg
                  className={`text-[var(--kmp-text-tertiary)] transition-transform duration-200 ${expandedSections.rules ? 'rotate-180' : ''}`}
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {/* Thin divider below heading */}
              <div className="mb-4" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} />
              {expandedSections.rules && (
                <div className="pb-4">
                  {/* Outcome selector dropdown */}
                  {config.selectedOutcome && (
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex cursor-pointer items-center gap-1">
                        <span className="text-[15px] font-medium text-[var(--kmp-yes)]">
                          {selectedOutcome?.name}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--kmp-yes)]">
                          <path d="M7 10l5 5 5-5z" />
                        </svg>
                      </div>
                      {/* Info icon */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--kmp-text-tertiary)]">
                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </div>
                  )}
                  <p className="mb-4 text-[15px] leading-[1.6] text-[var(--kmp-text-primary)]">
                    {config.rulesText || 'This market will resolve to "Yes" if the specified outcome occurs.'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="cursor-pointer rounded-lg border border-[var(--kmp-border)] bg-transparent px-3 py-2 text-[13px] font-normal text-[var(--kmp-yes)]"
                    >
                      View full rules
                    </button>
                    <button
                      className="cursor-pointer rounded-lg border border-[var(--kmp-border)] bg-transparent px-3 py-2 text-[13px] font-normal text-[var(--kmp-yes)]"
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
              onClick={() => toggleSection('timeline')}
            >
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--kmp-text-secondary)]">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-[16px] font-normal text-[var(--kmp-text-primary)]">
                  Timeline and payout
                </span>
              </div>
              <svg
                className={`text-[var(--kmp-text-tertiary)] transition-transform duration-200 ${expandedSections.timeline ? 'rotate-180' : ''}`}
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSections.timeline && (
              <div className="pb-4">
                <p className="mb-3 text-[15px] leading-[1.6] text-[var(--kmp-text-primary)]">
                  Contracts pay out $1.00 if the outcome is correct.
                </p>
              </div>
            )}
          </section>

          {/* About Section */}
          <section style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            <button
              className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-4 text-left"
              onClick={() => toggleSection('about')}
            >
              <span className="text-[16px] font-normal text-[var(--kmp-text-primary)]">
                About
              </span>
              <svg
                className={`text-[var(--kmp-text-tertiary)] transition-transform duration-200 ${expandedSections.about ? 'rotate-180' : ''}`}
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSections.about && (
              <div className="pb-4">
                <p className="mb-3 text-[15px] leading-[1.6] text-[var(--kmp-text-primary)]">
                  This market tracks the outcome of the event described in the title. Trade based on your predictions.
                </p>
              </div>
            )}
          </section>

          {/* Related Markets */}
          {config.showRelatedMarkets && config.relatedMarkets.length > 0 && (
            <section
              className="pt-4"
              style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
            >
              <h2 className="mb-4 text-lg font-semibold text-[var(--kmp-text-primary)]">People are also buying</h2>
              <div className="flex flex-col gap-1">
                {config.relatedMarkets.map((market) => (
                  <div key={market.id} className="flex cursor-pointer items-center gap-3 py-2">
                    <div className="size-10 shrink-0 overflow-hidden rounded-full bg-[var(--kmp-bg)]">
                      {market.image ? (
                        <img src={market.image} alt={market.title} className="size-full object-cover" draggable={false} />
                      ) : (
                        <div className="size-full" style={{ background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                      )}
                    </div>
                    <span className="text-[15px] font-medium text-[var(--kmp-text-primary)]">{market.title}</span>
                  </div>
                ))}
              </div>
              <button
                className="mt-3 cursor-pointer border-none bg-transparent p-0 text-sm font-medium text-[var(--kmp-yes)] hover:underline"
              >
                Show more
              </button>
            </section>
          )}

          {/* Watermark */}
          {config.showWatermark && (
            <div className="py-6 text-center text-[11px]" style={{ color: isDark ? 'rgba(128,128,128,0.3)' : 'rgba(128,128,128,0.4)' }}>
              kalshi.tools
            </div>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <MarketPageSidebar
          config={config}
          isDark={isDark}
          sidebarState={sidebarState}
          onSideSelect={onSideSelect}
          onSubmitOrder={onSubmitOrder}
          onAmountChange={onAmountChange}
          onLimitPriceChange={onLimitPriceChange}
          onSidebarStateChange={onSidebarStateChange}
        />
      </div>
    </div>
  );
}

export { MARKET_PAGE_PREVIEW_ID };
