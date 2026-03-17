import { Link } from "react-router-dom";
import { trackEvent } from "../../lib/analytics";

export function LandingPage() {
  const handleToolClick = (tool: string) => {
    trackEvent("tool_select", { tool });
  };

  return (
    <div className="flex flex-1 justify-center overflow-y-auto overflow-x-hidden bg-dark px-6 pt-16 pb-20 font-sans text-text-primary max-[960px]:px-5 max-[960px]:pt-12 max-[960px]:pb-16">
      <div className="flex w-full max-w-[800px] flex-col gap-10 max-[960px]:gap-8">
        <header className="flex flex-col items-start gap-2 max-[960px]:items-center max-[960px]:text-center">
          <h1 className="flex items-center gap-2.5 text-[clamp(32px,4.5vw,44px)] font-semibold tracking-tight text-gray-100">
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
          <p className="text-base leading-normal text-text-secondary">Make fake Kalshi charts and trade slips.</p>
        </header>

        <div className="flex flex-col gap-4 max-[640px]:gap-3">
          <Link
            to="/chart"
            className="group flex rounded-lg border border-dark-border bg-dark-surface text-left text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-brand hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => handleToolClick("chart")}
          >
            <div className="flex w-full items-center gap-5 px-5 py-6 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3.5 max-[640px]:px-4 max-[640px]:py-5">
              <div className="flex items-center gap-4">
                <span className="flex size-13 shrink-0 items-center justify-center rounded-lg bg-[#0d2e1f] text-brand max-[640px]:size-11 [&_svg]:size-6 max-[640px]:[&_svg]:size-5" aria-hidden="true">
                  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h16" /><path d="M6 16l3-4 4 3 5-7" /><path d="M5 11V4" /><path d="M9 13V4" /><path d="M13 15V4" /><path d="M18 9V4" />
                  </svg>
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-widest text-brand">Create a</span>
                  <span className="text-xl font-semibold tracking-tight text-gray-100 max-[640px]:text-lg">Chart</span>
                </div>
              </div>
              <p className="flex-1 text-sm leading-normal text-text-secondary max-[640px]:text-[13px]">
                Create realistic Kalshi market charts with binary or multi-outcome options, custom trend drawing, volatility controls, volume data, and save as PNG.
              </p>
            </div>
          </Link>

          <Link
            to="/trade-slip"
            className="group flex rounded-lg border border-dark-border bg-dark-surface text-left text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-brand hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => handleToolClick("trade-slip")}
          >
            <div className="flex w-full items-center gap-5 px-5 py-6 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3.5 max-[640px]:px-4 max-[640px]:py-5">
              <div className="flex items-center gap-4">
                <span className="flex size-13 shrink-0 items-center justify-center rounded-lg bg-[#0d2e1f] text-brand max-[640px]:size-11 [&_svg]:size-6 max-[640px]:[&_svg]:size-5" aria-hidden="true">
                  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3v4a1 1 0 0 0 1 1h4" /><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M8 13h8" /><path d="M8 17h5" />
                  </svg>
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-widest text-brand">Create a</span>
                  <span className="text-xl font-semibold tracking-tight text-gray-100 max-[640px]:text-lg">Trade Slip</span>
                </div>
              </div>
              <p className="flex-1 text-sm leading-normal text-text-secondary max-[640px]:text-[13px]">
                Build realistic Kalshi trade slips with customizable questions, answers, wager amounts, odds, automatic payout calculations, and optional images.
              </p>
            </div>
          </Link>

          <Link
            to="/market-page"
            className="group flex rounded-lg border border-dark-border bg-dark-surface text-left text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-brand hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => handleToolClick("market-page")}
          >
            <div className="flex w-full items-center gap-5 px-5 py-6 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3.5 max-[640px]:px-4 max-[640px]:py-5">
              <div className="flex items-center gap-4">
                <span className="flex size-13 shrink-0 items-center justify-center rounded-lg bg-[#0d2e1f] text-brand max-[640px]:size-11 [&_svg]:size-6 max-[640px]:[&_svg]:size-5" aria-hidden="true">
                  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /><path d="M13 13h4" /><path d="M13 17h4" />
                  </svg>
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-widest text-brand">Create a</span>
                  <span className="text-xl font-semibold tracking-tight text-gray-100 max-[640px]:text-lg">Market Page</span>
                </div>
              </div>
              <p className="flex-1 text-sm leading-normal text-text-secondary max-[640px]:text-[13px]">
                Generate pixel-perfect Kalshi market pages with multi-outcome charts, Yes/No buttons, and rules sections.
              </p>
            </div>
          </Link>

          <Link
            to="/banner"
            className="group flex rounded-lg border border-dark-border bg-dark-surface text-left text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-brand hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => handleToolClick('banner')}
          >
            <div className="flex w-full items-center gap-5 px-5 py-6 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3.5 max-[640px]:px-4 max-[640px]:py-5">
              <div className="flex items-center gap-4">
                <span className="flex size-13 shrink-0 items-center justify-center rounded-lg bg-[#0d2e1f] text-brand max-[640px]:size-11 [&_svg]:size-6 max-[640px]:[&_svg]:size-5" aria-hidden="true">
                  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 10h4" /><path d="M6 14h3" /><path d="M14 10h4" /><path d="M14 14h2" />
                  </svg>
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-widest text-brand">Create a</span>
                  <span className="text-xl font-semibold tracking-tight text-gray-100 max-[640px]:text-lg">Banner</span>
                </div>
              </div>
              <p className="flex-1 text-sm leading-normal text-text-secondary max-[640px]:text-[13px]">
                Create shareable market banners with a question, outcome image, position, and price movement indicator.
              </p>
            </div>
          </Link>

          <Link
            to="/bracket"
            className="group flex rounded-lg border border-dark-border bg-dark-surface text-left text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-brand hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => handleToolClick('bracket')}
          >
            <div className="flex w-full items-center gap-5 px-5 py-6 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3.5 max-[640px]:px-4 max-[640px]:py-5">
              <div className="flex items-center gap-4">
                <span className="flex size-13 shrink-0 items-center justify-center rounded-lg bg-[#0d2e1f] text-brand max-[640px]:size-11 [&_svg]:size-6 max-[640px]:[&_svg]:size-5" aria-hidden="true">
                  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 21h8m-4-4v4m-5-9a5 5 0 0 1-4-5V4h18v3a5 5 0 0 1-4 5" />
                    <path d="M7 4v3a5 5 0 0 0 10 0V4" />
                  </svg>
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-widest text-brand">Build a</span>
                  <span className="text-xl font-semibold tracking-tight text-gray-100 max-[640px]:text-lg">March Madness Bracket</span>
                </div>
              </div>
              <p className="flex-1 text-sm leading-normal text-text-secondary max-[640px]:text-[13px]">
                Fill out your March Madness bracket picks, share with friends via a link, and export as a PNG image.
              </p>
            </div>
          </Link>

          <Link
            to="/overlay?edit"
            className="group flex rounded-lg border border-dark-border bg-dark-surface text-left text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-brand hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => handleToolClick("overlay")}
          >
            <div className="flex w-full items-center gap-5 px-5 py-6 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3.5 max-[640px]:px-4 max-[640px]:py-5">
              <div className="flex items-center gap-4">
                <span className="flex size-13 shrink-0 items-center justify-center rounded-lg bg-[#0d2e1f] text-brand max-[640px]:size-11 [&_svg]:size-6 max-[640px]:[&_svg]:size-5" aria-hidden="true">
                  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 9l3 3-3 3" /><path d="M13 13h4" />
                  </svg>
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-widest text-brand">Build an</span>
                  <span className="text-xl font-semibold tracking-tight text-gray-100 max-[640px]:text-lg">Overlay</span>
                </div>
              </div>
              <p className="flex-1 text-sm leading-normal text-text-secondary max-[640px]:text-[13px]">
                Build live OBS overlays with drag-and-drop market widgets, text, logos, and presets. Paste the link into a browser source.
              </p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
