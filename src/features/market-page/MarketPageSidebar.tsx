import { useState } from 'react';
import { MarketPageConfig } from '../../types/market-page';
import { KalshiLogo } from '../../components/ui/KalshiLogo';
import { v } from './helpers';

interface MarketPageSidebarProps {
  config: MarketPageConfig;
  isDark: boolean;
  sidebarState: 'trading' | 'review' | 'confirmation';
  onSideSelect: (side: 'Yes' | 'No') => void;
  onSubmitOrder: () => void;
  onAmountChange: (amount: number) => void;
  onLimitPriceChange: (price: number) => void;
  onSidebarStateChange: (state: 'trading' | 'review' | 'confirmation') => void;
}

export function MarketPageSidebar({
  config,
  isDark,
  sidebarState,
  onSideSelect,
  onSubmitOrder,
  onAmountChange,
  onLimitPriceChange,
  onSidebarStateChange,
}: MarketPageSidebarProps) {
  const [amountInput, setAmountInput] = useState('');
  const selectedOutcome = config.outcomes.find(o => o.id === config.selectedOutcome);

  return (
    <div className="w-[352px] shrink-0">
      <div
        className="sticky top-[107px]"
        style={{
          background: v('sidebar-bg'),
          boxShadow: isDark
            ? 'rgba(0, 0, 0, 0.3) 0px 0px 4px 0px, rgba(0, 0, 0, 0.15) 0px 4px 8px 0px'
            : 'rgba(0, 0, 0, 0.1) 0px 0px 4px 0px, rgba(0, 0, 0, 0.05) 0px 4px 8px 0px',
          borderRadius: 16,
          padding: 16,
        }}
      >
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
                  <div className="size-full" style={{ background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[16px] font-normal leading-5 text-[var(--kmp-text-primary)]">
                  {config.title}
                </span>
                <span className="flex items-center gap-1 text-[15px] font-semibold leading-[22px]">
                  <span style={{ color: config.selectedSide === 'Yes' ? v('yes') : v('no') }}>
                    Buy {config.selectedSide}
                  </span>
                  <span className="text-[var(--kmp-text-primary)]">·</span>
                  <span className="text-[var(--kmp-text-primary)]">
                    {selectedOutcome?.name}
                  </span>
                </span>
              </div>
            </div>
            {/* Buy / Sell toggle + Dollars */}
            <div className="mb-2 flex items-center gap-1">
              <button
                className="h-8 cursor-pointer rounded-full border px-3 py-0 text-[13px] font-normal leading-[30px]"
                style={{
                  background: isDark ? 'rgba(40,204,149,0.16)' : 'rgba(10,194,133,0.12)',
                  color: v('yes'),
                  borderColor: isDark ? 'rgba(40,204,149,0.32)' : 'rgba(10,194,133,0.16)',
                }}
              >
                Buy
              </button>
              <button
                className="h-8 cursor-pointer rounded-full border px-3 py-0 text-[13px] font-normal leading-[30px] text-[var(--kmp-text-primary)]"
                style={{ borderColor: v('border') }}
              >
                Sell
              </button>
              <div className="flex-1" />
              <button
                className="flex cursor-pointer items-center gap-0.5 border-none bg-transparent p-0 text-[13px] font-normal text-[var(--kmp-text-primary)]"
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
                className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border text-[13px] font-normal text-[var(--kmp-yes)]"
                style={{
                  background: config.selectedSide === 'Yes' ? 'var(--kmp-yes-bg)' : 'transparent',
                  borderColor: config.selectedSide === 'Yes' ? 'var(--kmp-yes)' : 'var(--kmp-border)',
                }}
                onClick={() => {
                  onSideSelect('Yes');
                  const outcome = config.outcomes.find(o => o.id === config.selectedOutcome);
                  if (outcome) onLimitPriceChange(outcome.yesPrice);
                }}
              >
                Yes <span className="ml-1">{selectedOutcome?.yesPrice}¢</span>
              </button>
              <button
                className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border text-[13px] font-normal text-[var(--kmp-no)]"
                style={{
                  background: config.selectedSide === 'No' ? v('no-bg') : 'transparent',
                  borderColor: config.selectedSide === 'No' ? 'var(--kmp-no)' : 'var(--kmp-border)',
                }}
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
              <div
                className="flex items-center justify-between rounded-lg px-4 py-[13px]"
                style={{
                  background: v('amount-bg'),
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)'}`,
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <label className="block text-[13px] font-medium leading-5 text-[var(--kmp-text-primary)]">Amount</label>
                  <span className="cursor-pointer text-[12px] font-medium leading-[18px]" style={{ color: v('yes') }}>Earn 3.25% Interest</span>
                </div>
                <input
                  type="text"
                  className="w-[120px] appearance-none border-none bg-transparent pl-2 text-right text-[30px] font-semibold tracking-[-0.6px] text-[var(--kmp-text-primary)] outline-none"
                  placeholder="$0"
                  style={{ MozAppearance: 'textfield' } as React.CSSProperties}
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
              className="h-12 w-full cursor-pointer rounded-full border-none px-4 py-3 text-[13px] font-normal transition-[opacity,transform] duration-75 hover:opacity-80 active:scale-[0.97]"
              style={{ background: '#28CC95', color: isDark ? 'rgba(0,0,0,0.9)' : '#fff' }}
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
                  <div className="size-full" style={{ background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px] font-normal leading-5 text-[var(--kmp-text-primary)]">{config.title}</span>
                <span className="flex items-center gap-1 text-[15px] font-semibold leading-[22px]">
                  <span style={{ color: config.selectedSide === 'Yes' ? v('yes') : v('no') }}>Buy {config.selectedSide}</span>
                  <span className="text-[var(--kmp-text-primary)]">·</span>
                  <span className="text-[var(--kmp-text-primary)]">{selectedOutcome?.name}</span>
                </span>
              </div>
            </div>
            <div className="mb-4 flex items-center justify-between border-b border-b-[var(--kmp-border)] py-4">
              <span className="text-base font-semibold text-[var(--kmp-text-primary)]">Review order</span>
              <KalshiLogo className="h-4" style={{ color: v('brand') }} />
            </div>
            <div className="mb-5">
              <div className="flex items-center justify-between border-b border-b-[var(--kmp-border-light)] py-3">
                <span className="flex items-center gap-1.5 text-sm text-[var(--kmp-text-secondary)]">
                  Estimated cost
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--kmp-text-tertiary)]">
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-[var(--kmp-text-primary)]">${config.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between border-b border-b-[var(--kmp-border-light)] py-3">
                <span className="flex items-center gap-1.5 text-sm text-[var(--kmp-text-secondary)]">Odds</span>
                <span className="text-sm font-semibold text-[var(--kmp-yes)]">{config.limitPrice}% chance</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="flex items-center gap-1.5 text-sm text-[var(--kmp-text-secondary)]">
                  Payout if {config.selectedSide}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--kmp-text-tertiary)]">
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                  </svg>
                </span>
                <span className="text-[28px] font-bold text-[var(--kmp-yes)]">
                  ${config.limitPrice > 0 ? Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString() : '0'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="flex size-12 cursor-pointer items-center justify-center rounded-lg border border-[var(--kmp-border)] bg-transparent text-[var(--kmp-text-primary)]"
                onClick={() => onSidebarStateChange('trading')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="flex-1 cursor-pointer rounded-full border-none px-4 py-3 text-[13px] font-normal transition-[opacity,transform] duration-75 hover:opacity-80 active:scale-[0.97]"
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
              <div className="size-14 overflow-hidden rounded-lg bg-[var(--kmp-bg)]">
                {selectedOutcome?.image ? (
                  <img src={selectedOutcome.image} alt="" className="size-full object-cover" draggable={false} />
                ) : config.image ? (
                  <img src={config.image} alt="" className="size-full object-cover" draggable={false} />
                ) : (
                  <div className="size-full" style={{ background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)' }} />
                )}
              </div>
              <KalshiLogo className="h-4" style={{ color: v('brand') }} />
            </div>
            <div className="mb-1 text-sm text-[var(--kmp-text-secondary)]">{config.title}</div>
            <div className="mb-6 text-xl font-bold text-[var(--kmp-text-primary)]">{selectedOutcome?.name}</div>
            <div className="mb-6">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--kmp-text-secondary)]">Cost</span>
                <span className="text-sm font-semibold text-[var(--kmp-text-primary)]">${config.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--kmp-text-secondary)]">Odds</span>
                <span className="text-sm font-semibold text-[var(--kmp-yes)]">{config.limitPrice}% chance</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--kmp-text-secondary)]">Payout if {config.selectedSide}</span>
                <span className="text-[28px] font-bold text-[var(--kmp-yes)]">
                  ${config.limitPrice > 0 ? Math.floor((config.orderAmount * 100) / config.limitPrice).toLocaleString() : '0'}
                </span>
              </div>
              <div className="-mt-1 text-right text-[13px] text-[var(--kmp-text-tertiary)]">{config.eventDate}</div>
            </div>
            <button
              className="h-12 w-full cursor-pointer rounded-full border-none px-4 py-3 text-[13px] font-normal transition-[opacity,transform] duration-75 hover:opacity-80 active:scale-[0.97]"
              style={{ background: '#28CC95', color: isDark ? 'rgba(0,0,0,0.9)' : '#fff' }}
              onClick={() => onSidebarStateChange('trading')}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
