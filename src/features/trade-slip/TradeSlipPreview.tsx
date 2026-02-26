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
    width="62"
    height="16"
    viewBox="0 0 78 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="kalshi-divider-logo"
  >
    <path
      d="M40.1043 0H36.0332V19.9986H40.1043V0Z"
      fill="currentColor"
      fillOpacity="0.9"
    />
    <path
      d="M0.416887 0.0221237H4.73849V8.99348L12.818 0.0221237H18.0582L10.6468 8.24586L18.5384 20H13.3608L7.59868 11.5686L4.73849 14.7459V20H0.416887V0.0221237Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M34.4675 19.8117H32.4007C30.5426 19.8117 29.624 19.0017 29.6658 17.4027C29.1229 18.2334 28.4549 18.8771 27.6824 19.3132C26.8891 19.7494 25.9496 19.9778 24.8222 19.9778C23.1729 19.9778 21.8368 19.604 20.8138 18.8564C19.8117 18.088 19.3106 17.0289 19.3106 15.6582C19.3106 14.1007 19.8952 12.8962 21.0434 12.0656C22.2126 11.2141 23.9036 10.778 26.1166 10.778H29.0603V10.0719C29.0603 9.40737 28.8098 8.8882 28.3087 8.49362C27.8077 8.09905 27.1396 7.89138 26.2836 7.89138C25.532 7.89138 24.9266 8.05752 24.4464 8.36902C23.9662 8.70129 23.674 9.1374 23.5905 9.67734H19.6446C19.7699 8.18212 20.4589 7.01916 21.6697 6.18848C22.8806 5.3578 24.4882 4.92169 26.4924 4.92169C28.5801 4.92169 30.2086 5.37857 31.3359 6.29232C32.4842 7.20607 33.0688 8.53516 33.0688 10.2588V15.4298C33.0688 15.7828 33.1523 16.0321 33.2984 16.1774C33.4445 16.302 33.6951 16.3851 34.0291 16.3851H34.4675V19.8117ZM26.0749 13.4569C25.2398 13.4569 24.5717 13.6231 24.0915 13.9761C23.6322 14.3084 23.4026 14.7653 23.4026 15.3675C23.4026 15.8867 23.5905 16.2813 23.9871 16.5928C24.3838 16.9043 24.9266 17.0496 25.5947 17.0496C26.6594 17.0496 27.4945 16.7589 28.1 16.1567C28.7054 15.5544 29.0394 14.7445 29.0603 13.7269V13.4569H26.0749Z"
      fill="currentColor"
    />
    <path
      d="M45.5115 14.9314C45.5741 15.5752 45.8873 16.0944 46.4718 16.5097C47.0564 16.9043 47.7871 17.112 48.6848 17.112C49.5408 17.112 50.2297 16.9874 50.7308 16.7174C51.2318 16.4266 51.4824 16.0321 51.4824 15.5129C51.4824 15.1391 51.3571 14.8483 51.1275 14.6614C50.8978 14.4745 50.5638 14.3292 50.1462 14.2669C49.7287 14.163 49.0397 14.0592 48.0794 13.9554C46.7641 13.7892 45.6785 13.5608 44.8225 13.2908C43.9665 13.0208 43.2567 12.6055 42.7557 12.024C42.2337 11.4426 41.9832 10.6949 41.9832 9.73966C41.9832 8.78438 42.2337 7.9537 42.7557 7.22685C43.2985 6.47924 44.0501 5.91853 45.0104 5.50319C45.9708 5.10861 47.0773 4.90094 48.3299 4.90094C50.355 4.92171 51.9625 5.35782 53.1943 6.1885C54.4469 7.01918 55.115 8.18213 55.2194 9.67736H51.3571C51.2945 9.11665 51.0022 8.68054 50.4594 8.3275C49.9374 7.97446 49.2694 7.78756 48.4343 7.78756C47.6618 7.78756 47.0355 7.93293 46.5553 8.22367C46.096 8.5144 45.8664 8.88821 45.8664 9.36585C45.8664 9.71889 45.9916 9.9681 46.2422 10.1342C46.4927 10.3004 46.8267 10.425 47.2234 10.508C47.6201 10.5911 48.309 10.6742 49.2485 10.7572C51.2527 10.9857 52.7768 11.4218 53.8206 12.0448C54.9062 12.647 55.4282 13.7062 55.4282 15.2222C55.4282 16.1774 55.1359 17.0081 54.5722 17.735C54.0085 18.4618 53.2361 19.0225 52.2131 19.4171C51.211 19.7909 50.0418 19.9986 48.7266 19.9986C46.6806 19.9986 44.9895 19.5417 43.716 18.6487C42.4216 17.735 41.7535 16.4889 41.67 14.9314H45.5115Z"
      fill="currentColor"
    />
    <path
      d="M69.7503 6.72852C68.623 5.6694 67.2033 5.12946 65.4496 5.12946C63.6333 5.12946 62.1719 5.794 61.0654 7.12309V0H56.9943V19.9986H61.0654V12.4602C61.0654 11.1934 61.3368 10.2174 61.9213 9.5113C62.5059 8.80522 63.3201 8.45218 64.364 8.45218C65.3661 8.45218 66.1177 8.78445 66.6187 9.42823C67.1198 10.0512 67.3703 10.965 67.3703 12.1902V19.9986H71.4414V12.0241C71.4414 9.55283 70.8777 7.78763 69.7503 6.72852Z"
      fill="currentColor"
    />
    <path
      d="M73.0068 5.29551H77.0779V19.9778H73.0068V5.29551Z"
      fill="currentColor"
      fillOpacity="0.9"
    />
    <path
      d="M76.473 0.581477C76.0972 0.20767 75.617 0 75.0324 0C74.4688 0 73.9677 0.20767 73.571 0.581477C73.1952 0.955283 72.9865 1.41216 72.9865 1.97287C72.9865 2.53358 73.1952 3.01122 73.571 3.38503C73.9677 3.75883 74.4688 3.9665 75.0324 3.9665C75.5961 3.9665 76.0972 3.7796 76.473 3.38503C76.8488 2.99045 77.0575 2.53358 77.0575 1.97287C77.0575 1.41216 76.8488 0.934516 76.473 0.581477Z"
      fill="currentColor"
    />
  </svg>
);

// Kalshi divider with logo in the center
const KalshiDivider = () => (
  <div className="kalshi-divider">
    <div className="kalshi-divider-line" />
    <KalshiLogo />
    <div className="kalshi-divider-line" />
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

// Green check circle icon for big game combo market items (from Figma check_circle)
const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="check-circle-icon">
    <path d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="#28CC95"/>
  </svg>
);

// Big game combo market item with check circle connector
interface BigGameComboMarketItemProps {
  market: ComboMarket;
  position: 'first' | 'middle' | 'last' | 'only';
}

const BigGameComboMarketItem = ({ market, position }: BigGameComboMarketItemProps) => (
  <div className="biggame-combo-market-item">
    <div className="biggame-combo-market-connector">
      <div className={`biggame-combo-connector-line ${position === 'first' || position === 'only' ? 'invisible' : ''}`} />
      {market.resolved ? (
        <CheckCircleIcon />
      ) : (
        <div className="biggame-combo-market-dot" />
      )}
      <div className={`biggame-combo-connector-line ${position === 'last' || position === 'only' ? 'invisible' : ''}`} />
    </div>
    <div className="biggame-combo-market-text">
      {market.prefix && (
        <span className="biggame-combo-market-prefix">{market.prefix} · </span>
      )}
      <span>{market.text}</span>
    </div>
  </div>
);

// Big game combo event item
interface BigGameComboEventItemProps {
  event: ComboEvent;
}

const BigGameComboEventItem = ({ event }: BigGameComboEventItemProps) => {
  const color1 = event.color1 || '#E31837';
  const color2 = event.color2 || '#004C54';

  return (
    <div className="biggame-combo-event">
      <div className="biggame-combo-event-header">
        <div
          className="biggame-combo-event-semicircle"
          style={{ background: `linear-gradient(to right, ${color1} 50%, ${color2} 50%)` }}
        />
        <span className="biggame-combo-event-name">{event.name}</span>
      </div>
      <div className="biggame-combo-event-markets">
        {event.markets.map((market, index) => {
          const position = event.markets.length === 1
            ? 'only'
            : index === 0
              ? 'first'
              : index === event.markets.length - 1
                ? 'last'
                : 'middle';
          return (
            <BigGameComboMarketItem
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
  const isBigGame = config.mode === 'biggame';
  const isBigGameCombo = config.mode === 'biggame-combo';

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

  if (isBigGameCombo) {
    const team1Color = config.bigGameColor1 || '#408FFF';
    const team2Color = config.bigGameColor2 || '#FF4D6A';
    const headerImage = '/biggame-header.png';
    const totalMarkets = config.comboCategories?.reduce(
      (sum, cat) => sum + cat.events.reduce(
        (eventSum, event) => eventSum + event.markets.length,
        0
      ),
      0
    ) || 0;
    const payout = config.comboPayout || 0;
    const cost = config.comboCost || 0;
    const allEvents = config.comboCategories?.flatMap(cat => cat.events) || [];

    return (
      <div className="trade-slip-container">
        <div
          id="trade-slip-preview"
          className="trade-slip-preview biggame-mode biggame-combo-mode"
          style={{
            '--team1-color': team1Color,
            '--team2-color': team2Color,
            background: `
              radial-gradient(ellipse at 0% 0%, ${team1Color}99 0%, transparent 55%),
              radial-gradient(ellipse at 100% 0%, ${team2Color}82 0%, transparent 55%),
              radial-gradient(ellipse at 50% 10%, transparent 0%, rgb(17, 19, 22) 70%),
              rgb(17, 19, 21)
            `,
          } as React.CSSProperties}
        >
          {/* Header image (contains team names + title) */}
          <div className="biggame-header-image">
            <img src={headerImage} alt="" className="biggame-header-img" />
          </div>

          {/* Combo trade slip card */}
          <div className="biggame-card">
            <div className="biggame-combo-card">
              {/* Combo badge and header info */}
              <div className="biggame-combo-header-section">
                <div className="biggame-combo-badge">
                  <ComboStrokeIcon />
                  <span className="biggame-combo-badge-text">COMBO</span>
                </div>
                <div className="biggame-combo-title">
                  {totalMarkets} market{totalMarkets !== 1 ? 's' : ''} pay{' '}
                  <span className="biggame-combo-title-payout">
                    ${payout.toLocaleString()}
                  </span>
                </div>
                <div className="biggame-combo-cost">
                  {config.isPaidOut ? 'Original cost' : 'Cost'}: ${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Kalshi Divider */}
              <KalshiDivider />

              {/* Events and markets */}
              <div className="biggame-combo-events">
                {allEvents.map((event) => (
                  <BigGameComboEventItem key={event.id} event={event} />
                ))}
              </div>

              {/* Timestamp */}
              {config.showTimestamp && (
                <div className="combo-timestamp">
                  {formatTimestamp(config.timestamp)}
                </div>
              )}
            </div>
            {/* Scalloped edge */}
            <div className="trade-slip-scalloped-edge" />
          </div>

          {config.showWatermark && (
            <div className="trade-slip-watermark biggame-watermark">
              kalshi.tools
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isBigGame) {
    const bigGamePayout = calculateSinglePayout(config.wager, config.odds);
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
    const team1Color = config.bigGameColor1 || '#408FFF';
    const team2Color = config.bigGameColor2 || '#FF4D6A';
    const headerImage = '/biggame-header.png';

    return (
      <div className="trade-slip-container">
        <div
          id="trade-slip-preview"
          className="trade-slip-preview biggame-mode"
          style={{
            '--team1-color': team1Color,
            '--team2-color': team2Color,
            background: `
              radial-gradient(ellipse at 0% 0%, ${team1Color}99 0%, transparent 55%),
              radial-gradient(ellipse at 100% 0%, ${team2Color}82 0%, transparent 55%),
              radial-gradient(ellipse at 50% 10%, transparent 0%, rgb(17, 19, 22) 70%),
              rgb(17, 19, 21)
            `,
          } as React.CSSProperties}
        >
          {/* Header image (contains team names + title) */}
          <div className="biggame-header-image">
            <img src={headerImage} alt="" className="biggame-header-img" />
          </div>

          {/* Trade slip card */}
          <div className="biggame-card">
            <div className="trade-slip-content trade-slip-dark">
              {/* Question and Answer Section */}
              <div className="trade-slip-question">
                <div className="trade-slip-question-copy">
                  <div className="trade-slip-market-name">{marketName}</div>
                  <div className="trade-slip-answer" style={{ color: tradeColor }}>
                    <span className="trade-slip-answer-side">{tradeSideText}</span>
                    {outcomeText && (
                      <span className="trade-slip-answer-outcome">{outcomeText}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Kalshi Divider */}
              <KalshiDivider />

              {/* Details Section */}
              <div className="trade-slip-details">
                <div className="trade-slip-row">
                  <span className="trade-slip-label">Odds</span>
                  <span className="trade-slip-value">{config.odds}% chance</span>
                </div>
                <div className="trade-slip-row">
                  <span className="trade-slip-label">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
                  <span className="trade-slip-value">
                    ${config.wager.toLocaleString()}
                  </span>
                </div>
                <div className="trade-slip-payout-section">
                  <div className="trade-slip-row trade-slip-payout-row">
                    <span className="trade-slip-label">{config.isPaidOut ? 'Paid out' : 'Max payout'}</span>
                    <span className="trade-slip-payout biggame-payout">
                      ${bigGamePayout.toLocaleString()}
                    </span>
                  </div>
                  {config.showTimestamp && (
                    <div className="trade-slip-timestamp">
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
            <div className="trade-slip-watermark biggame-watermark">
              kalshi.tools
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isHorizontal) {
    const horizontalPayout = calculateSinglePayout(config.wager, config.odds);
    const marketName = (config.marketName?.trim() || config.title.trim()) || 'Market name goes here';
    const isYes = config.tradeSide === 'Yes';
    const sideColor = isYes ? '#00C688' : '#ff4d6a';
    const bgColor = config.backgroundColor || '#28CC95';

    return (
      <div className="trade-slip-container horizontal-container">
        <div
          id="trade-slip-preview"
          className="trade-slip-preview horizontal-mode"
          style={{
            background: bgColor,
          }}
        >
          {/* Left side - Image with overlay */}
          <div className="horizontal-image-section">
            {config.image ? (
              <img src={config.image} alt={marketName} className="horizontal-bg-image" />
            ) : (
              <div className="horizontal-bg-placeholder" />
            )}
            <div className="horizontal-image-overlay">
              <div className="horizontal-brand-badge">
                <KalshiLogo />
              </div>
              <div className="horizontal-market-name">{marketName}</div>
              <div className="horizontal-side-buttons">
                <div
                  className={`horizontal-side-btn horizontal-side-yes${isYes ? ' active' : ''}`}
                >
                  Yes
                </div>
                <div
                  className={`horizontal-side-btn horizontal-side-no${!isYes ? ' active' : ''}`}
                >
                  No
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Stats panel */}
          <div className="horizontal-stats-section">
            <div
              className="horizontal-win-badge"
              style={{ backgroundColor: sideColor }}
            >
              {isYes ? 'YES' : 'NO'}
            </div>
            <div className="horizontal-stat-row">
              <span className="horizontal-stat-label">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
              <span className="horizontal-stat-value">${config.wager.toLocaleString()}</span>
            </div>
            <div className="horizontal-stat-row">
              <span className="horizontal-stat-label">{config.isPaidOut ? 'Paid out' : 'To win'}</span>
              <span className="horizontal-stat-value horizontal-payout">${horizontalPayout.toLocaleString()}</span>
            </div>
            <div className="horizontal-cta">
              <span className="horizontal-cta-text">Predict now on</span>
              <div className="horizontal-cta-brand">
                <KalshiLogo />
              </div>
            </div>
          </div>

          {config.showWatermark && (
            <div className="trade-slip-watermark horizontal-watermark">
              kalshi.tools
            </div>
          )}
        </div>
      </div>
    );
  }

  const payout = isComboOld
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
    <div className="trade-slip-container">
      <div
        id="trade-slip-preview"
        className={`trade-slip-preview${isCombo ? ' combo-mode' : ''}${isComboOld ? ' combo-old-mode' : ''}${isSingleOld ? ' single-old-mode' : ''}`}
        style={useOldStyle ? undefined : {
          background: `linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%), ${bgColor}`,
        }}
      >
        {config.showCashedOut && (
          <div className="trade-slip-cashed-out-badge">Cashed out</div>
        )}
        {isCombo ? (
          <>
            <div className="biggame-combo-card">
              {/* Combo badge and header info */}
              <div className="biggame-combo-header-section">
                <div className="biggame-combo-badge">
                  <ComboStrokeIcon />
                  <span className="biggame-combo-badge-text">COMBO</span>
                </div>
                <div className="biggame-combo-title">
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
                        <span className="biggame-combo-title-payout">
                          ${(config.comboPayout || 0).toLocaleString()}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <div className="biggame-combo-cost">
                  {config.isPaidOut ? 'Original cost' : 'Cost'}: ${(config.comboCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Kalshi Divider */}
              <KalshiDivider />

              {/* Events and markets */}
              <div className="biggame-combo-events">
                {config.comboCategories?.flatMap(cat => cat.events).map((event) => (
                  <BigGameComboEventItem key={event.id} event={event} />
                ))}
              </div>

              {/* Timestamp */}
              {config.showTimestamp && (
                <div className="combo-timestamp">
                  {formatTimestamp(config.timestamp)}
                </div>
              )}
            </div>
            {/* Scalloped edge */}
            <div className="trade-slip-scalloped-edge" />
          </>
        ) : isComboOld ? (
          <div className="combo-card trade-slip-content trade-slip-content-old">
            <div className="combo-header">
              <span className="combo-label">{comboOldTitle}</span>
              <div className="trade-slip-brand-container">
                <a
                  href="https://kalshi.com/?utm_source=kalshitools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="combo-brand"
                >
                  <KalshiLogo />
                </a>
              </div>
            </div>

            <div className="combo-body">
              <div className="combo-legs-preview">
                {config.comboLegs.map((leg, index) => {
                  const question = leg.question.trim()
                    ? leg.question
                    : `Leg ${index + 1} question`;
                  return (
                    <div className="combo-leg-preview" key={leg.id}>
                      {leg.image && (
                        <img src={leg.image} alt="" className="combo-leg-preview-image" />
                      )}
                      <div className="combo-leg-preview-text">
                        <span className="combo-leg-question">{question}</span>
                        <span className="combo-leg-answer">{leg.answer}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="combo-summary">
                <div className="combo-summary-row">
                  <span className="combo-summary-label">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
                  <span className="combo-summary-value">
                    ${config.wager.toLocaleString()}
                  </span>
                </div>
                <div className="combo-summary-row">
                  <span className="combo-summary-label">Odds</span>
                  <span className="combo-summary-value">
                    {formatAmericanOdds(config.comboOdds)}
                  </span>
                </div>
                {config.comboCashOut !== undefined && (
                  <div className="combo-summary-row">
                    <span className="combo-summary-label">Cash out</span>
                    <span className="combo-summary-value">
                      ${config.comboCashOut.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="combo-summary-row combo-payout-row">
                  <span className="combo-summary-label">{config.isPaidOut ? 'Paid out' : 'Payout if right'}</span>
                  <span className="combo-payout">
                    ${payout.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : isSingleOld ? (
          <div className="trade-slip-content trade-slip-content-old">
            <div className="trade-slip-top-section">
              <div className="trade-slip-image-container">
                {config.image && (
                  <img
                    src={config.image}
                    alt="Trade slip"
                    className="trade-slip-image trade-slip-image-old"
                  />
                )}
              </div>
              <div className="trade-slip-brand-container">
                <a
                  href="https://kalshi.com/?utm_source=kalshitools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trade-slip-brand"
                >
                  <KalshiLogo />
                </a>
              </div>
            </div>

            <div className="trade-slip-question">
              <div className="trade-slip-question-copy">
                <div
                  className={`trade-slip-market-name trade-slip-market-name-old${!outcomeText ? ' trade-slip-market-name-large' : ''}`}
                >
                  {marketName}
                </div>
                {outcomeText && <div className="trade-slip-outcome">{outcomeText}</div>}
                <div
                  className="trade-slip-answer trade-slip-answer-old"
                  style={{ color: oldTradeColor }}
                >
                  I traded {config.tradeSide}
                </div>
              </div>
            </div>

            <div className="trade-slip-details trade-slip-details-old">
              <div className="trade-slip-row">
                <span className="trade-slip-label">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
                <span className="trade-slip-value">
                  ${config.wager.toLocaleString()}
                </span>
              </div>
              <div className="trade-slip-row">
                <span className="trade-slip-label">Odds</span>
                <span className="trade-slip-value">
                  {config.odds}% chance
                </span>
              </div>
              <div className="trade-slip-row trade-slip-payout-row">
                <span className="trade-slip-label">{config.isPaidOut ? 'Paid out' : 'Payout if win'}</span>
                <span className="trade-slip-payout trade-slip-payout-old">
                  ${payout.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="trade-slip-content trade-slip-dark">
              {/* Question and Answer Section */}
              <div className={`trade-slip-question${config.image ? ' has-image' : ''}`}>
                {config.image && (
                  <div className="trade-slip-image-container">
                    <img src={config.image} alt={marketImageAlt} className="trade-slip-image" />
                  </div>
                )}
                <div className="trade-slip-question-copy">
                  <div className="trade-slip-market-name">
                    {marketName}
                  </div>
                  <div
                    className="trade-slip-answer"
                    style={{ color: tradeColor }}
                  >
                    <span className="trade-slip-answer-side">{tradeSideText}</span>
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
              <div className="trade-slip-details">
                <div className="trade-slip-row">
                  <span className="trade-slip-label">Odds</span>
                  <span className="trade-slip-value">
                    {config.odds}% chance
                  </span>
                </div>
                <div className="trade-slip-row">
                  <span className="trade-slip-label">{config.isPaidOut ? 'Original cost' : 'Cost'}</span>
                  <span className="trade-slip-value">
                    ${config.wager.toLocaleString()}
                  </span>
                </div>
                <div className="trade-slip-payout-section">
                  <div className="trade-slip-row trade-slip-payout-row">
                    <span className="trade-slip-label">{config.isPaidOut ? 'Paid out' : 'Max payout'}</span>
                    <span className="trade-slip-payout">
                      ${payout.toLocaleString()}
                    </span>
                  </div>
                  {config.showTimestamp && (
                    <div className="trade-slip-timestamp">
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
          <div className="trade-slip-watermark">
            kalshi.tools
          </div>
        )}
      </div>
    </div>
  );
}
