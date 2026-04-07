import { KalshiLogo } from '../../components/ui/KalshiLogo';

interface MarketPageNavProps {
  isDark: boolean;
  onLogoClick?: () => void;
}

const SUB_NAV_ITEMS = [
  'Trending', 'Politics', 'Sports', 'Culture', 'Crypto',
  'Climate', 'Economics', 'Mentions', 'Companies', 'Financials', 'Tech & Science',
];

export function MarketPageNav({ isDark, onLogoClick }: MarketPageNavProps) {
  return (
    <nav className="sticky top-0 z-[100] w-full bg-[var(--kmp-surface)]">
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
                className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold leading-5 tracking-[1.04px] text-[var(--kmp-text-primary)] no-underline"
              >
                {item.label}
                {item.badge && (
                  <span className="text-[12px] font-medium leading-[18px] text-[#D91616]">{item.badge}</span>
                )}
                {item.dropdown && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-50">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div
            className="flex h-[38px] w-[400px] cursor-pointer items-center rounded-full bg-[var(--kmp-bg)] px-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 shrink-0 text-[var(--kmp-text-tertiary)]">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-[16px] leading-6 text-[var(--kmp-text-tertiary)]">Trade on anything</span>
          </div>
          {/* Log in */}
          <button
            className="h-10 cursor-pointer rounded-full border border-[var(--kmp-border)] bg-transparent px-3 py-2 text-[13px] font-normal text-[var(--kmp-yes)]"
          >
            Log in
          </button>
          {/* Sign up */}
          <button
            className="h-10 cursor-pointer rounded-full border-none px-3 py-2 text-[13px] font-normal"
            style={{ background: '#28CC95', color: isDark ? 'rgba(0,0,0,0.9)' : '#fff' }}
          >
            Sign up
          </button>
        </div>
      </div>
      {/* Sub-nav row */}
      <div
        className="mx-auto flex max-w-[1320px] items-center gap-4 px-6 pb-2"
        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}` }}
      >
        {SUB_NAV_ITEMS.map((item) => (
          <a
            key={item}
            className="cursor-pointer whitespace-nowrap py-1 text-[15px] font-normal leading-[22px] text-[var(--kmp-text-secondary)] no-underline"
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}
