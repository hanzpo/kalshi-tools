import { Link } from "react-router-dom";
import { trackEvent } from "../../lib/analytics";
import { SeoContentBlock } from "../seo/SeoContentBlock";
import { seoPages } from "../../seo/routes";

export function LandingPage() {
  const handleToolClick = (tool: string) => {
    trackEvent("tool_select", { tool });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-dark font-sans text-text-primary">
      {/* Hero */}
      <div className="flex flex-col items-center px-6 pt-20 pb-14 text-center max-[960px]:px-5 max-[960px]:pt-14 max-[960px]:pb-10">
        <h1 className="flex items-center gap-2.5 text-[clamp(32px,4.5vw,44px)] font-semibold tracking-tight text-white">
          <span className="inline-flex items-center leading-none text-brand" aria-hidden="true">
            <svg
              className="h-[0.78em] w-auto"
              width="55"
              height="16"
              viewBox="0 0 772 226"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z"
                fill="currentColor"
              ></path>
            </svg>
          </span>
          <span>Tools</span>
        </h1>
        <p className="mt-3 text-[15px] text-text-secondary">
          Create realistic Kalshi charts, trade slips, and more.
        </p>
      </div>

      {/* Tool cards */}
      <div className="mx-auto flex w-full max-w-[800px] flex-col gap-3 px-6 pb-20 max-[960px]:px-5 max-[960px]:pb-16 max-[640px]:gap-2.5">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="group flex rounded-lg border border-dark-border bg-dark-surface text-left text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-brand/40 hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => handleToolClick(tool.id)}
          >
            <div className="flex w-full items-center gap-5 px-5 py-5 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3 max-[640px]:px-4 max-[640px]:py-4">
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand/8 text-brand max-[640px]:size-10 [&_svg]:size-5 max-[640px]:[&_svg]:size-4.5" aria-hidden="true">
                  {tool.icon}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-widest text-brand">Create a</span>
                  <span className="text-xl font-semibold tracking-tight text-white transition-colors duration-150 group-hover:text-brand max-[640px]:text-lg">{tool.name}</span>
                </div>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-text-secondary max-[640px]:text-[13px]">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="px-6 pb-16 max-[960px]:px-5 max-[960px]:pb-12">
        <SeoContentBlock content={seoPages['/'].content} />
      </div>
    </div>
  );
}

const tools = [
  {
    id: 'chart',
    name: 'Chart',
    path: '/chart',
    description: 'Create realistic Kalshi market charts with binary or multi-outcome options, custom trend drawing, volatility controls, and volume data.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16" /><path d="M6 16l3-4 4 3 5-7" /><path d="M5 11V4" /><path d="M9 13V4" /><path d="M13 15V4" /><path d="M18 9V4" />
      </svg>
    ),
  },
  {
    id: 'trade-slip',
    name: 'Trade Slip',
    path: '/trade-slip',
    description: 'Build realistic Kalshi trade slips with customizable questions, wager amounts, odds, and automatic payout calculations.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3v4a1 1 0 0 0 1 1h4" /><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M8 13h8" /><path d="M8 17h5" />
      </svg>
    ),
  },
  {
    id: 'search',
    name: 'Search',
    path: '/search',
    description: 'Create Kalshi-style search result cards and browse page visuals for market discovery and promotional graphics.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="6" /><path d="M20 20l-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'market-page',
    name: 'Market Page',
    path: '/market-page',
    description: 'Generate pixel-perfect Kalshi market pages with multi-outcome charts, Yes/No buttons, and rules sections.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /><path d="M13 13h4" /><path d="M13 17h4" />
      </svg>
    ),
  },
  {
    id: 'banner',
    name: 'Banner',
    path: '/banner',
    description: 'Create shareable market banners with a question, outcome image, position, and price movement indicator.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 10h4" /><path d="M6 14h3" /><path d="M14 10h4" /><path d="M14 14h2" />
      </svg>
    ),
  },
  {
    id: 'link-preview',
    name: 'Link Preview',
    path: '/link-preview',
    description: 'Build social preview cards that combine a market headline, chart, and image into a compact shareable graphic.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 14L21 3" /><path d="M16 3h5v5" /><path d="M5 7H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1" />
      </svg>
    ),
  },
  {
    id: 'overlay',
    name: 'Overlay',
    path: '/overlay?edit',
    description: 'Build live OBS overlays with drag-and-drop market widgets, text, logos, and presets.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 9l3 3-3 3" /><path d="M13 13h4" />
      </svg>
    ),
  },
  {
    id: 'bracket',
    name: 'Bracket',
    path: '/bracket',
    description: 'Create shareable bracket graphics with picks, randomization, export, and link sharing for tournament-style content.',
    icon: (
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 6h10" /><path d="M7 12h10" /><path d="M7 18h10" /><path d="M7 6a2 2 0 1 0 0 4" /><path d="M17 12a2 2 0 1 0 0 4" /><path d="M7 18a2 2 0 1 0 0-4" />
      </svg>
    ),
  },
];
