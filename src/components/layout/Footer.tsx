import { Link } from 'react-router-dom';

const toolLinks = [
  { label: 'Chart', to: '/chart' },
  { label: 'Trade Slip', to: '/trade-slip' },
  { label: 'Market Page', to: '/market-page' },
  { label: 'Banner', to: '/banner' },
  { label: 'Bracket', to: '/bracket' },
];

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-white/8 px-6 pt-6 pb-8 max-md:px-4 max-md:pt-5 max-md:pb-6">
      <div className="mx-auto flex max-w-[800px] flex-col gap-3 text-center">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-text-secondary">
          {toolLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-medium text-text-secondary no-underline transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-text-secondary [&_a]:font-medium [&_a]:text-brand [&_a]:no-underline [&_a:hover]:underline">
          Built by{' '}
          <a href="https://x.com/hanzpo" target="_blank" rel="noopener noreferrer">
            Hanz Po
          </a>{' '}
          &bull;{' '}
          <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">
            Visit Kalshi
          </a>{' '}
          &bull; © 2026
        </p>
        <p className="text-[11px] leading-relaxed text-text-muted max-md:text-[10px] [&_a]:text-text-secondary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-brand">
          Restrictions and eligibility requirements apply. Event contract trading involves significant risk and is not appropriate for everyone. Please carefully consider if it's appropriate for you in light of your personal financial circumstances. See{' '}
          <a href="https://kalshi.com/regulatory" target="_blank" rel="noopener noreferrer">
            kalshi.com/regulatory
          </a>{' '}
          for more information.
        </p>
      </div>
    </footer>
  );
}
