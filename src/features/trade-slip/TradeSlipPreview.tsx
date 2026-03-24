import { TradeSlipConfig, ComboEvent, ComboMarket } from '../../types';
import { PrizePickPreview } from './PrizePickPreview';
import { CoinbasePreview } from './CoinbasePreview';
import './TradeSlipPreview.css';

interface TradeSlipPreviewProps {
  config: TradeSlipConfig;
}

// Kalshi logo SVG for the divider
const KalshiLogo = () => (
  <svg
    width="55"
    height="16"
    viewBox="0 0 772 226"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 text-white/16"
  >
    <path
      d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z"
      fill="currentColor"
    />
  </svg>
);

// Kalshi divider with logo in the center
const KalshiDivider = () => (
  <div className="flex w-full items-center gap-2">
    <div className="h-px flex-1 bg-white/12" />
    <KalshiLogo />
    <div className="h-px flex-1 bg-white/12" />
  </div>
);

// Combo stroke icon for COMBO badge (from Figma custom_combo_stroke)
const ComboStrokeIcon = () => (
  <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="combo-stroke-icon">
    <path d="M9 0C9.26667 0 9.52539 0.0503906 9.77539 0.150391C10.0251 0.250339 10.2416 0.39989 10.4248 0.599609L9 2L2.72865 8.29418C2.33984 8.68441 2.33984 9.31559 2.72865 9.70582L9 16L10.4248 17.4248C10.2416 17.608 10.0252 17.7496 9.77539 17.8496C9.52539 17.9496 9.26667 18 9 18C8.73333 18 8.47897 17.954 8.2373 17.8623C7.99574 17.7706 7.78288 17.6247 7.59961 17.4248L0.625 10.4248C0.441732 10.2249 0.291445 10.0043 0.174805 9.7627C0.058138 9.52103 0 9.26667 0 9C0 8.73333 0.058138 8.47897 0.174805 8.2373C0.291466 7.99567 0.441687 7.78292 0.625 7.59961L7.59961 0.599609C7.79957 0.39965 8.01672 0.250391 8.25 0.150391C8.48333 0.0503906 8.73333 0 9 0Z" fill="url(#paint0_combo)"/>
    <path d="M16 6V8H18V10H16V12H14V10H12V8H14V6H16Z" fill="url(#paint1_combo)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M15 0C15.2667 0 15.5254 0.0503906 15.7754 0.150391C16.0251 0.250339 16.2416 0.39989 16.4248 0.599609L23.375 7.59961C23.5583 7.79961 23.7085 8.01667 23.8252 8.25C23.9418 8.48331 24 8.73336 24 9C24 9.26667 23.9462 9.52103 23.8379 9.7627C23.7296 10.0043 23.5749 10.2248 23.375 10.4248L16.4248 17.4248C16.2416 17.608 16.0252 17.7496 15.7754 17.8496C15.5254 17.9496 15.2667 18 15 18C14.7333 18 14.479 17.954 14.2373 17.8623C13.9957 17.7706 13.7829 17.6247 13.5996 17.4248L6.625 10.4248C6.44173 10.2249 6.29145 10.0043 6.1748 9.7627C6.05814 9.52103 6 9.26667 6 9C6 8.73333 6.05814 8.47897 6.1748 8.2373C6.29147 7.99567 6.44169 7.78292 6.625 7.59961L13.5996 0.599609C13.7996 0.39965 14.0167 0.250391 14.25 0.150391C14.4833 0.0503906 14.7333 0 15 0ZM8.02539 9L15 16L21.9746 9L15 2L8.02539 9Z" fill="url(#paint2_combo)"/>
    <defs>
      <linearGradient id="paint0_combo" x1="0" y1="0" x2="17.28" y2="23.04" gradientUnits="userSpaceOnUse">
        <stop stopColor="#82D9D9"/><stop offset="0.1" stopColor="#8D8DD9"/><stop offset="0.2" stopColor="#D998D9"/><stop offset="0.4" stopColor="#D9D9B8"/><stop offset="0.5" stopColor="#98D9D9"/><stop offset="0.6" stopColor="#7C82BF"/><stop offset="0.75" stopColor="#8D8DD9"/><stop offset="0.9" stopColor="#D9D9B8"/><stop offset="1" stopColor="#82D982"/>
      </linearGradient>
      <linearGradient id="paint1_combo" x1="0" y1="0" x2="17.28" y2="23.04" gradientUnits="userSpaceOnUse">
        <stop stopColor="#82D9D9"/><stop offset="0.1" stopColor="#8D8DD9"/><stop offset="0.2" stopColor="#D998D9"/><stop offset="0.4" stopColor="#D9D9B8"/><stop offset="0.5" stopColor="#98D9D9"/><stop offset="0.6" stopColor="#7C82BF"/><stop offset="0.75" stopColor="#8D8DD9"/><stop offset="0.9" stopColor="#D9D9B8"/><stop offset="1" stopColor="#82D982"/>
      </linearGradient>
      <linearGradient id="paint2_combo" x1="0" y1="0" x2="17.28" y2="23.04" gradientUnits="userSpaceOnUse">
        <stop stopColor="#82D9D9"/><stop offset="0.1" stopColor="#8D8DD9"/><stop offset="0.2" stopColor="#D998D9"/><stop offset="0.4" stopColor="#D9D9B8"/><stop offset="0.5" stopColor="#98D9D9"/><stop offset="0.6" stopColor="#7C82BF"/><stop offset="0.75" stopColor="#8D8DD9"/><stop offset="0.9" stopColor="#D9D9B8"/><stop offset="1" stopColor="#82D982"/>
      </linearGradient>
    </defs>
  </svg>
);

// Green check circle icon for combo market items (from Figma check_circle)
const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="check-circle-icon">
    <path d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="#28CC95"/>
  </svg>
);

// Combo market item with check circle connector
interface ComboMarketItemProps {
  market: ComboMarket;
  position: 'first' | 'middle' | 'last' | 'only';
}

const ComboMarketItem = ({ market, position }: ComboMarketItemProps) => (
  <div className="flex items-stretch gap-3 p-0">
    <div className="flex w-5 shrink-0 flex-col items-center">
      <div className={`min-h-px w-px flex-1 ${position === 'first' || position === 'only' ? 'bg-transparent' : 'bg-white/20'}`} />
      {market.resolved ? (
        <CheckCircleIcon />
      ) : (
        <div className="my-1.5 size-2 shrink-0 rounded-full bg-white/30" />
      )}
      <div className={`min-h-px w-px flex-1 ${position === 'last' || position === 'only' ? 'bg-transparent' : 'bg-white/20'}`} />
    </div>
    <div className="flex-1 py-1 font-sans text-[13px] font-normal leading-5 text-white/90">
      {market.prefix && (
        <span className="text-white/90">{market.prefix} · </span>
      )}
      <span>{market.text}</span>
    </div>
  </div>
);

// Combo event item
interface ComboEventItemProps {
  event: ComboEvent;
}

const ComboEventItem = ({ event }: ComboEventItemProps) => {
  const color1 = event.color1 || '#E31837';
  const color2 = event.color2 || '#004C54';

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-2 py-1">
        <div
          className="size-5 shrink-0 rounded-full"
          style={{ background: `linear-gradient(to right, ${color1} 50%, ${color2} 50%)` }}
        />
        <span className="flex-1 truncate font-sans text-[13px] font-medium leading-5 text-white/90">{event.name}</span>
      </div>
      <div className="flex flex-col gap-0">
        {event.markets.map((market, index) => {
          const position = event.markets.length === 1
            ? 'only'
            : index === 0
              ? 'first'
              : index === event.markets.length - 1
                ? 'last'
                : 'middle';
          return (
            <ComboMarketItem
              key={market.id}
              market={market}
              position={position}
            />
          );
        })}
      </div>
    </div>
  );
};

// Format timestamp for display
function formatTimestamp(customTimestamp?: string): string {
  const date = customTimestamp ? new Date(customTimestamp) : new Date();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  return `Bought on ${month} ${day}, ${year} @ ${hours}:${minutes}${ampm}`;
}

function calculateSinglePayout(wager: number, odds: number): number {
  if (odds <= 0 || odds >= 100) return 0;
  return Math.round(wager / (odds / 100));
}

function calculateAmericanPayout(wager: number, odds: number): number {
  if (!Number.isFinite(odds) || odds === 0) return 0;
  const fractionalReturn = odds > 0 ? odds / 100 : 100 / Math.abs(odds);
  return Math.round(wager * (1 + fractionalReturn));
}

function formatAmericanOdds(odds: number): string {
  if (!Number.isFinite(odds) || odds === 0) {
    return 'EVEN';
  }
  return odds > 0 ? `+${odds}` : `${odds}`;
}


export function TradeSlipPreview({ config }: TradeSlipPreviewProps) {
  const isCombo = config.mode === 'combo';
  const isPrizePick = config.mode === 'prizepick';
  const isCoinbase = config.mode === 'coinbase';
  const isSingleOld = config.mode === 'single-old';
  const isComboOld = config.mode === 'combo-old';
  const isHorizontal = config.mode === 'horizontal';
  const isChampionship = config.mode === 'championship';
  if (isPrizePick) {
    return <PrizePickPreview config={config} />;
  }

  if (isCoinbase) {
    return <CoinbasePreview config={{
      coinbasePredictions: config.coinbasePredictions,
      coinbaseWager: config.coinbaseWager,
      coinbasePayout: config.coinbasePayout,
      coinbasePlayType: config.coinbasePlayType,
      showWatermark: config.showWatermark,
    }} />;
  }

  if (isHorizontal) {
    const horizontalPayout = config.customPayout != null ? config.customPayout : calculateSinglePayout(config.wager, config.odds);
    const marketName = (config.marketName?.trim() || config.title.trim()) || 'Market name goes here';
    const isYes = config.tradeSide === 'Yes';
    const sideColor = isYes ? '#00C688' : '#ff4d6a';
    const bgColor = config.backgroundColor || '#28CC95';

    return (
      <div className="flex min-h-full w-full items-center justify-center p-[clamp(12px,2vw,20px)]">
        <div
          id="trade-slip-preview"
          className="flex h-auto min-h-[180px] w-[clamp(480px,90vw,600px)] max-w-[600px] flex-row overflow-hidden rounded-xl p-0 font-sans shadow-[0_10px_40px_rgba(0,0,0,0.2)] max-[600px]:min-h-[160px] max-[600px]:w-[clamp(320px,95vw,500px)] max-[420px]:w-[clamp(280px,90vw,340px)] max-[420px]:flex-col"
          style={{
            background: bgColor,
          }}
        >
          {/* Left side - Image with overlay */}
          <div className="relative flex min-w-0 flex-[1.4] flex-col overflow-hidden bg-black/40 max-[420px]:min-h-[140px]">
            {config.image ? (
              <img src={config.image} alt={marketName} className="absolute inset-0 z-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
            )}
            <div className="relative z-[1] flex h-full flex-col justify-between bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.3)_40%,rgba(0,0,0,0.7)_100%)] px-4 py-3.5 max-[600px]:px-3.5 max-[600px]:py-3">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-[6px] bg-black/60 px-2.5 py-1.5">
                <svg width="55" height="16" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-[50px] shrink-0 text-white/90">
                  <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="currentColor" />
                </svg>
              </div>
              <div className="my-2 max-w-full break-words font-sans text-[clamp(18px,3.5vw,24px)] font-semibold leading-[1.3] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.5)] [hyphens:auto] [overflow-wrap:break-word] max-[600px]:text-base">{marketName}</div>
              <div className="mt-auto flex gap-2">
                <div
                  className={`flex-1 cursor-default rounded-lg bg-[#00C688] px-4 py-2.5 text-center font-sans text-sm font-semibold uppercase tracking-[0.02em] text-white transition-transform duration-150 max-[600px]:px-3 max-[600px]:py-2 max-[600px]:text-xs ${isYes ? 'opacity-100 shadow-[0_4px_12px_rgba(0,198,136,0.4)]' : 'opacity-40'}`}
                >
                  Yes
                </div>
                <div
                  className={`flex-1 cursor-default rounded-lg bg-[#d91616] px-4 py-2.5 text-center font-sans text-sm font-semibold uppercase tracking-[0.02em] text-white transition-transform duration-150 max-[600px]:px-3 max-[600px]:py-2 max-[600px]:text-xs ${!isYes ? 'opacity-100 shadow-[0_4px_12px_rgba(217,22,22,0.4)]' : 'opacity-40'}`}
                >
                  No
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Stats panel */}
          <div className="flex w-[clamp(140px,25vw,180px)] flex-shrink-0 flex-col gap-2 bg-black/85 px-4 py-3.5 max-[600px]:w-[120px] max-[600px]:p-3 max-[420px]:w-full max-[420px]:flex-row max-[420px]:flex-wrap max-[420px]:gap-3 max-[420px]:p-3.5">
            <div
              className="rounded-[6px] px-3 py-2 text-center font-sans text-[clamp(20px,4vw,28px)] font-bold tracking-[0.02em] text-white max-[600px]:text-lg max-[600px]:px-2.5 max-[600px]:py-1.5 max-[420px]:shrink-0 max-[420px]:grow-0"
              style={{ backgroundColor: sideColor }}
            >
              {isYes ? 'YES' : 'NO'}
            </div>
            <div className="flex items-baseline justify-between gap-2 max-[420px]:min-w-[80px] max-[420px]:flex-1">
              <span className="font-sans text-[13px] font-normal text-white/60">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
              <span className="font-sans text-[clamp(16px,3vw,20px)] font-semibold text-white">${config.wager.toLocaleString()}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2 max-[420px]:min-w-[80px] max-[420px]:flex-1">
              <span className="font-sans text-[13px] font-normal text-white/60">{config.isPaidOut ? 'Paid out' : 'To win'}</span>
              <span className="font-sans text-[clamp(16px,3vw,20px)] font-semibold text-white">${horizontalPayout.toLocaleString()}</span>
            </div>
            <div className="mt-auto flex flex-col items-start gap-1 max-[420px]:mt-1 max-[420px]:flex-1 max-[420px]:basis-full max-[420px]:flex-row max-[420px]:items-center max-[420px]:gap-2">
              <span className="font-sans text-[11px] font-normal text-white/50">Predict now on</span>
              <div className="flex items-center gap-1.5">
                <svg width="55" height="16" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-[60px] shrink-0 text-brand">
                  <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          {config.showWatermark && (
            <div className="absolute bottom-2 right-2 text-[9px] text-white/30">
              kalshi.tools
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isChampionship) {
    const championshipPayout = config.customPayout != null ? config.customPayout : calculateSinglePayout(config.wager, config.odds);
    const marketName = (config.marketName?.trim() || config.title.trim()) || 'Market name goes here';
    const tradeColor = config.tradeSide === 'No'
      ? '#ff4d6a'
      : config.tradeSide === 'Custom'
        ? (config.customSideColor || '#00C688')
        : '#00C688';
    const tradeSideText = config.tradeSide === 'Custom'
      ? (config.customSideText || 'Custom')
      : config.tradeSide;
    const outcomeText = config.outcome?.trim();
    const primaryColor = config.backgroundColor || '#28CC95';
    const secondaryColor = config.championshipSecondaryColor || '#0a3d2e';

    // Parse primary color to rgba variants
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };
    const pc = hexToRgb(primaryColor.startsWith('#') ? primaryColor : '#28CC95');
    const sc = hexToRgb(secondaryColor.startsWith('#') ? secondaryColor : '#0a3d2e');
    // Lighten the secondary color for the gradient glow
    const lighten = (c: { r: number; g: number; b: number }, amount: number) => ({
      r: Math.min(255, c.r + Math.round((255 - c.r) * amount)),
      g: Math.min(255, c.g + Math.round((255 - c.g) * amount)),
      b: Math.min(255, c.b + Math.round((255 - c.b) * amount)),
    });
    const scLight = lighten(sc, 0.35);

    return (
      <div className="flex min-h-full w-full items-center justify-center p-[clamp(16px,3vw,32px)]">
        <div
          id="trade-slip-preview"
          className="championship-preview"
          style={{
            '--champ-primary': primaryColor,
            '--champ-primary-25': `rgba(${pc.r},${pc.g},${pc.b},0.25)`,
            '--champ-primary-18': `rgba(${pc.r},${pc.g},${pc.b},0.18)`,
            '--champ-primary-035': `rgba(${pc.r},${pc.g},${pc.b},0.035)`,
            '--champ-secondary': secondaryColor,
            '--champ-secondary-25': `rgba(${scLight.r},${scLight.g},${scLight.b},0.25)`,
            '--champ-secondary-035': `rgba(${scLight.r},${scLight.g},${scLight.b},0.035)`,
          } as React.CSSProperties}
        >
          {config.showCashedOut && (
            <div className="self-start bg-black/75 text-white text-[clamp(11px,2vw,13px)] font-medium px-2 py-0.5 rounded-[10px] mb-[clamp(8px,1.5vw,12px)]">Cashed out</div>
          )}

          {/* Bracket decorations */}
          <div className="championship-bracket-left">
            <div className="championship-bracket-line" />
            <div className="championship-bracket-round1" />
            <div className="championship-bracket-round2">
              <div className="championship-bracket-slot" />
              <div className="championship-bracket-slot" />
            </div>
          </div>
          <div className="championship-bracket-right">
            <div className="championship-bracket-line" />
            <div className="championship-bracket-round1" />
            <div className="championship-bracket-round2">
              <div className="championship-bracket-slot" />
              <div className="championship-bracket-slot" />
            </div>
          </div>

          {/* Titles */}
          <div className="relative flex w-full shrink-0 flex-col items-start gap-0 text-center leading-[0]">
            <div className="w-full font-sans text-[11px] font-semibold uppercase tracking-[0.88px] leading-4 text-white/55">Men's College Basketball</div>
            <div className="championship-title">CHAMPIONSHIP</div>
          </div>

          {/* Basketball graphic — flows after header, behind trade slip */}
          <div className="h-[280px] w-[324px] shrink-0 opacity-[0.56] pointer-events-none">
            <div
              className="championship-graphic"
              style={{
                backgroundColor: primaryColor,
                maskImage: 'url(/championship-basketball.png)',
                WebkitMaskImage: 'url(/championship-basketball.png)',
              }}
            />
          </div>

          {/* Trade Slip Content */}
          <div className="absolute top-[71px] left-0 z-[2] box-border w-full p-4">
            <div className="flex flex-col gap-3 bg-[linear-gradient(180deg,rgba(0,0,0,0.48)_40.15%,rgba(0,0,0,1)_100%)] border border-transparent rounded-t-lg p-4">
              {/* Question and Answer Section */}
              <div className={`flex ${config.image ? 'flex-row items-center gap-3' : 'flex-col items-start gap-0'} pr-0 pb-2`}>
                {config.image && (
                  <div className="size-7 shrink-0 overflow-hidden rounded self-end">
                    <img src={config.image} alt={`${marketName} market image`} className="block size-7 object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="m-0 text-base font-normal leading-6 text-white/90">
                    {marketName}
                  </div>
                  <div
                    className="m-0 text-lg font-medium leading-[26px]"
                    style={{ color: tradeColor }}
                  >
                    <span>{tradeSideText}</span>
                    {outcomeText && (
                      <span className="trade-slip-answer-outcome">
                        {outcomeText}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Kalshi Divider — green for championship */}
              <div className="flex w-full items-center gap-2">
                <div className="h-px flex-1 bg-white/12" />
                <svg width="55" height="16" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="#09C285" />
                </svg>
                <div className="h-px flex-1 bg-white/12" />
              </div>

              {/* Details Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-normal leading-5 text-white/50">Odds</span>
                  <span className="text-base font-normal leading-6 text-white/90">
                    {config.odds}% chance
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-normal leading-5 text-white/50">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
                  <span className="text-base font-normal leading-6 text-white/90">
                    ${config.wager.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-0 mt-0 mb-0">
                  <div className="flex items-start justify-between gap-4 mt-0 pt-0">
                    <span className="flex-[1_0_0] flex items-start p-0 text-sm font-normal leading-5 text-white/50">{config.isPaidOut ? 'Paid out' : 'Max payout'}</span>
                    <span className="trade-slip-payout">
                      ${championshipPayout.toLocaleString()}
                    </span>
                  </div>
                  {config.showTimestamp && (
                    <div className="mt-2 pb-0 text-[10px] font-normal leading-[14px] text-white/30">
                      {formatTimestamp(config.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Scalloped edge */}
            <div className="trade-slip-scalloped-edge" />
          </div>

          {config.showWatermark && (
            <div className="absolute bottom-[clamp(12px,3vw,18px)] right-[clamp(16px,3vw,24px)] z-10 text-[clamp(8px,1.5vw,10px)] font-medium text-[rgba(128,128,128,0.5)]">
              kalshi.tools
            </div>
          )}
        </div>
      </div>
    );
  }

  const payout = config.customPayout != null
    ? config.customPayout
    : isComboOld
      ? calculateAmericanPayout(config.wager, config.comboOdds)
      : calculateSinglePayout(config.wager, config.odds);

  const marketName = (config.marketName?.trim() || config.title.trim())
    || 'Market name goes here';
  const marketImageAlt = marketName ? `${marketName} market image` : 'Market image';
  const tradeColor = config.tradeSide === 'No'
    ? '#ff4d6a'
    : config.tradeSide === 'Custom'
      ? (config.customSideColor || '#00C688')
      : '#00C688';
  const tradeSideText = config.tradeSide === 'Custom'
    ? (config.customSideText || 'Custom')
    : config.tradeSide;
  const outcomeText = config.outcome?.trim();

  const bgColor = config.backgroundColor || '#28CC95';

  // Old combo title
  const comboOldTitle = config.title.trim()
    ? config.title
    : 'Combo';

  // Old single trade color
  const oldTradeColor = config.tradeSide === 'No' ? '#d91616' : '#00C688';

  // For old modes, use the static CSS background; for new modes, use inline style
  const useOldStyle = isSingleOld || isComboOld;

  return (
    <div className="flex min-h-full w-full items-center justify-center p-[clamp(16px,3vw,32px)]">
      <div
        id="trade-slip-preview"
        className={
          isCombo
            ? 'relative flex flex-col w-[clamp(300px,80vw,380px)] max-w-[380px] rounded-[16px] p-3 pb-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-visible font-sans'
            : isComboOld
              ? 'relative flex flex-col w-[clamp(320px,90vw,500px)] max-w-[500px] rounded-[clamp(8px,2vw,12px)] p-0 pb-[clamp(2px,0.5vw,4px)] shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-visible font-sans bg-[rgb(34,34,34)]'
              : isSingleOld
                ? 'relative flex flex-col w-[clamp(320px,90vw,500px)] max-w-[500px] rounded-[clamp(16px,3vw,20px)] px-0 py-[clamp(18px,3vw,24px)] pb-[clamp(18px,3vw,28px)] shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-visible font-sans bg-gradient-to-b from-[#00D395] to-[#00C688]'
                : 'relative flex flex-col w-[clamp(300px,75vw,360px)] max-w-[360px] rounded-[clamp(12px,3vw,16px)] p-3.5 pb-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-visible font-sans'
        }
        style={
          useOldStyle
            ? { '--d': 'clamp(8px, 1.5vw, 10px)' } as React.CSSProperties
            : {
                background: `linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%), ${bgColor}`,
                '--d': '7px',
              } as React.CSSProperties
        }
      >
        {config.showCashedOut && (
          <div className="self-start bg-black/75 text-white text-[clamp(11px,2vw,13px)] font-medium px-2 py-0.5 rounded-[10px] mb-[clamp(8px,1.5vw,12px)]">Cashed out</div>
        )}
        {isCombo ? (
          <>
            <div className="flex flex-col gap-3 rounded-t-lg bg-black/75 p-4 max-[480px]:p-3.5">
              {/* Combo badge and header info */}
              <div className="flex flex-col gap-1">
                <div className="flex h-5 items-center gap-1.5 text-white/90">
                  <ComboStrokeIcon />
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.88px] leading-[18px] text-white/90">COMBO</span>
                </div>
                <div className="font-[Barlow_Condensed,Inter,-apple-system,BlinkMacSystemFont,sans-serif] text-2xl font-medium leading-7 text-white/90">
                  {(() => {
                    const totalMarkets = config.comboCategories?.reduce(
                      (sum, cat) => sum + cat.events.reduce(
                        (eventSum, event) => eventSum + event.markets.length,
                        0
                      ),
                      0
                    ) || 0;
                    return (
                      <>
                        {totalMarkets} market{totalMarkets !== 1 ? 's' : ''} pay{' '}
                        <span className="font-[Graphik_Condensed_App,Barlow_Condensed,Inter,-apple-system,BlinkMacSystemFont,sans-serif] text-[#28CC95]">
                          ${(config.comboPayout || 0).toLocaleString()}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <div className="font-sans text-[15px] font-normal leading-6 text-white/50">
                  {config.isPaidOut ? 'Original cost' : 'Cost'}: ${(config.comboCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Kalshi Divider */}
              <KalshiDivider />

              {/* Events and markets */}
              <div className="flex flex-col gap-0">
                {config.comboCategories?.flatMap(cat => cat.events).map((event) => (
                  <ComboEventItem key={event.id} event={event} />
                ))}
              </div>

              {/* Timestamp */}
              {config.showTimestamp && (
                <div className="mt-2 pb-0 font-sans text-[10px] font-normal leading-[14px] text-white/30">
                  {formatTimestamp(config.timestamp)}
                </div>
              )}
            </div>
            {/* Scalloped edge */}
            <div className="trade-slip-scalloped-edge" />
          </>
        ) : isComboOld ? (
          <div className="trade-slip-content-old flex flex-col gap-[clamp(16px,3vw,22px)] rounded-t-[clamp(8px,2vw,12px)] bg-white p-[clamp(24px,4vw,32px)] m-0 relative">
            <div className="flex flex-row items-start justify-between mb-0 min-h-[clamp(15px,3vw,20px)]">
              <span className="text-[clamp(16px,3vw,18px)] font-medium text-black leading-[1.3]">{comboOldTitle}</span>
              <div className="flex items-start justify-end shrink-0">
                <a
                  href="https://kalshi.com/?utm_source=kalshitools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-[#09C285] no-underline transition-[transform,opacity] duration-200 hover:opacity-85 hover:-translate-y-px"
                >
                  <KalshiLogo />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-[clamp(20px,3vw,28px)]">
              <div className="flex flex-col gap-[clamp(16px,2vw,20px)]">
                {config.comboLegs.map((leg, index) => {
                  const question = leg.question.trim()
                    ? leg.question
                    : `Leg ${index + 1} question`;
                  return (
                    <div className="flex items-center gap-[clamp(12px,2vw,16px)] max-[540px]:items-start" key={leg.id}>
                      {leg.image && (
                        <img src={leg.image} alt="" className="size-[clamp(60px,10vw,75px)] rounded-[clamp(8px,2vw,12px)] overflow-hidden shrink-0 object-cover border-none" />
                      )}
                      <div className="flex flex-col gap-[clamp(4px,1vw,6px)] flex-1 min-w-0 max-[540px]:gap-1.5">
                        <span className="text-[clamp(15px,3vw,18px)] font-normal leading-[1.4] text-[#6b7280]">{question}</span>
                        <span className="text-[clamp(18px,3.5vw,22px)] font-semibold text-[#111827] leading-[1.3]">{leg.answer}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-[clamp(14px,2vw,20px)] mt-[clamp(4px,1vw,8px)]">
                <div className="flex items-center justify-between">
                  <span className="text-[clamp(16px,3vw,20px)] text-[#666] font-normal leading-[1.3]">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
                  <span className="text-[clamp(18px,3.5vw,22px)] text-[#1a1a1a] font-medium leading-[1.3]">
                    ${config.wager.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[clamp(16px,3vw,20px)] text-[#666] font-normal leading-[1.3]">Odds</span>
                  <span className="text-[clamp(18px,3.5vw,22px)] text-[#1a1a1a] font-medium leading-[1.3]">
                    {formatAmericanOdds(config.comboOdds)}
                  </span>
                </div>
                {config.comboCashOut !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-[clamp(16px,3vw,20px)] text-[#666] font-normal leading-[1.3]">Cash out</span>
                    <span className="text-[clamp(18px,3.5vw,22px)] text-[#1a1a1a] font-medium leading-[1.3]">
                      ${config.comboCashOut.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-0 pt-0">
                  <span className="text-[clamp(16px,3vw,20px)] text-[#666] font-normal leading-[1.3]">{config.isPaidOut ? 'Paid out' : 'Payout if right'}</span>
                  <span className="text-[clamp(32px,7vw,48px)] text-[#00C688] font-bold leading-none">
                    ${payout.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : isSingleOld ? (
          <div className="trade-slip-content-old bg-white rounded-t-[clamp(8px,2vw,12px)] mx-[clamp(8px,2vw,16px)] p-[clamp(16px,3vw,22px)] relative">
            <div className="flex items-start justify-between mb-[clamp(12px,2vw,18px)] min-h-[clamp(15px,3vw,20px)]">
              <div className="mb-[clamp(8px,1.5vw,12px)] self-start">
                {config.image && (
                  <img
                    src={config.image}
                    alt="Trade slip"
                    className="size-[clamp(60px,12vw,80px)] rounded-[clamp(8px,2vw,12px)] object-cover border-none"
                  />
                )}
              </div>
              <div className="flex items-start justify-end shrink-0">
                <a
                  href="https://kalshi.com/?utm_source=kalshitools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-[#09C285] no-underline transition-[transform,opacity] duration-200 hover:opacity-85 hover:-translate-y-px"
                >
                  <KalshiLogo />
                </a>
              </div>
            </div>

            <div className="flex flex-col items-start gap-[clamp(8px,1.5vw,12px)] pr-0">
              <div className="w-full">
                <div
                  className={`m-0 mb-[clamp(4px,1vw,8px)] text-[clamp(16px,4vw,20px)] font-medium text-[#4b5563] leading-[1.35]${!outcomeText ? ' text-[clamp(20px,5vw,28px)] font-semibold mb-[clamp(8px,2vw,14px)]' : ''}`}
                >
                  {marketName}
                </div>
                {outcomeText && <div className="m-0 mb-[clamp(8px,2vw,14px)] text-[clamp(26px,6vw,38px)] font-bold text-[#111827] leading-[1.15] break-words">{outcomeText}</div>}
                <div
                  className="m-0 mb-[clamp(16px,3vw,24px)] text-[clamp(16px,3.5vw,20px)] font-medium leading-[1.3]"
                  style={{ color: oldTradeColor }}
                >
                  I traded {config.tradeSide}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[clamp(12px,2vw,18px)]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[clamp(16px,3vw,20px)] text-[#666] font-normal leading-[1.3]">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
                <span className="text-[clamp(18px,3.5vw,22px)] text-[#1a1a1a] font-medium leading-[1.3]">
                  ${config.wager.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[clamp(16px,3vw,20px)] text-[#666] font-normal leading-[1.3]">Odds</span>
                <span className="text-[clamp(18px,3.5vw,22px)] text-[#1a1a1a] font-medium leading-[1.3]">
                  {config.odds}% chance
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 mt-0 pt-0">
                <span className="text-[clamp(16px,3vw,20px)] text-[#666] font-normal leading-[1.3]">{config.isPaidOut ? 'Paid out' : 'Payout if win'}</span>
                <span className="text-[clamp(24px,6vw,36px)] text-[#00C688] font-bold font-sans leading-[1.1]">
                  ${payout.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-[clamp(20px,4vw,24px)] rounded-t-lg bg-black/75 p-[clamp(22px,4.5vw,28px)]">
              {/* Question and Answer Section */}
              <div className={`flex ${config.image ? 'flex-row items-center gap-3' : 'flex-col items-start gap-0'} pr-0`}>
                {config.image && (
                  <div className="shrink-0 self-center">
                    <img src={config.image} alt={marketImageAlt} className="size-[50px] rounded-full object-cover border-none" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="m-0 text-base font-normal leading-6 text-white/90">
                    {marketName}
                  </div>
                  <div
                    className="m-0 text-lg font-medium leading-[26px]"
                    style={{ color: tradeColor }}
                  >
                    <span>{tradeSideText}</span>
                    {outcomeText && (
                      <span className="trade-slip-answer-outcome">
                        {outcomeText}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Kalshi Divider */}
              <KalshiDivider />

              {/* Details Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-normal leading-5 text-white/50">Odds</span>
                  <span className="text-base font-normal leading-6 text-white/90">
                    {config.odds}% chance
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-normal leading-5 text-white/50">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
                  <span className="text-base font-normal leading-6 text-white/90">
                    ${config.wager.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-0 mt-0 -mb-4">
                  <div className="flex items-start justify-between gap-4 mt-0 pt-0">
                    <span className="flex-[1_0_0] flex items-start p-0 text-sm font-normal leading-5 text-white/50">{config.isPaidOut ? 'Paid out' : 'Max payout'}</span>
                    <span className="trade-slip-payout">
                      ${payout.toLocaleString()}
                    </span>
                  </div>
                  {config.showTimestamp && (
                    <div className="mt-2 pb-0 text-[10px] font-normal leading-[14px] text-white/30">
                      {formatTimestamp(config.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Scalloped edge */}
            <div className="trade-slip-scalloped-edge" />
          </>
        )}

        {config.showWatermark && (
          <div className="absolute bottom-[clamp(12px,3vw,18px)] right-[clamp(16px,3vw,24px)] z-10 text-[clamp(8px,1.5vw,10px)] font-medium text-[rgba(128,128,128,0.5)]">
            kalshi.tools
          </div>
        )}
      </div>
    </div>
  );
}
