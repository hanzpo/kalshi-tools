import { Link } from 'react-router-dom';

const links = [
  { label: 'Chart generator', to: '/chart' },
  { label: 'Trade slip generator', to: '/trade-slip' },
  { label: 'Market page generator', to: '/market-page' },
  { label: 'Banner generator', to: '/banner' },
];

export function NotFoundPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-dark px-6 py-16 font-sans text-text-primary">
      <div className="w-full max-w-2xl rounded-3xl border border-dark-border bg-dark-card px-8 py-10 text-center max-md:px-6 max-md:py-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white max-md:text-2xl">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          The requested page does not exist, or the URL is no longer valid. Use one of the main tools below or return to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-black no-underline transition-opacity hover:opacity-90"
          >
            Go home
          </Link>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-text-primary no-underline transition-colors hover:border-brand/40 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
