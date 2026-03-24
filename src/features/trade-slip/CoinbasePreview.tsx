import { CoinbaseConfig } from '../../types';

interface CoinbasePreviewProps {
  config: CoinbaseConfig;
}

const statusStyles = {
  won: 'bg-cb-won/15 text-cb-won',
  lost: 'bg-cb-lost/15 text-cb-lost',
  pending: 'bg-cb-text/15 text-cb-text',
} as const;

const checkmarkStyles = {
  won: 'bg-cb-won text-white',
  lost: 'bg-cb-lost text-white',
  pending: 'bg-cb-text text-white',
} as const;

const progressFillStyles = {
  won: 'bg-cb-won',
  lost: 'bg-cb-lost',
  pending: 'bg-cb',
} as const;

export function CoinbasePreview({ config }: CoinbasePreviewProps) {
  const playType = config.coinbasePlayType.trim() || '';
  const wager = config.coinbaseWager;
  const payout = config.coinbasePayout;

  return (
    <div className="flex min-h-full w-full items-center justify-center p-6 max-sm:p-4">
      <div id="trade-slip-preview" className="relative w-full max-w-[520px] overflow-hidden rounded-3xl border-2 border-cb-border bg-cb-bg font-sans max-sm:max-w-full">
        <div className="flex flex-col">
          {/* Header */}
          <div className="relative flex min-h-[100px] items-start justify-between overflow-hidden border-b-2 border-cb-border bg-cb-header px-6 pb-6 pt-5 max-sm:px-5 max-sm:pb-5 max-sm:pt-4">
            <div className="z-[1] flex flex-1 items-start gap-3.5">
              <img src="/image.png" alt="Coinbase" className="mt-0.5 w-[120px] shrink-0 max-sm:w-[100px]" />
              <div className="flex flex-col gap-1">
                <h1 className="m-0 text-[15px] font-normal leading-[1.3] text-cb-text max-sm:text-sm">{playType}</h1>
                <p className="m-0 text-xl font-semibold leading-[1.3] text-white max-sm:text-lg">
                  <span className="text-white">${wager.toLocaleString()} paid</span>{' '}
                  <span className="text-cb">${payout.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <button className="z-[1] flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-none bg-cb px-3.5 py-1.5 text-sm font-bold leading-none text-white hover:bg-[#1a62ff]">Won</button>
          </div>

          {/* Prediction Cards */}
          <div className="flex flex-col gap-3 p-3.5">
            {config.coinbasePredictions.map((prediction, index) => {
              const assetName = prediction.assetName.trim() || `Asset ${index + 1}`;
              const ticker = prediction.ticker.trim() || 'BTC';
              const predictionType = prediction.predictionType.trim() || 'Price Above';
              const targetValue = prediction.targetValue;
              const currentValue = prediction.currentValue;
              const timeframe = prediction.timeframe.trim() || '24h';
              const status = prediction.status.trim() || 'Won';
              const percentChange = prediction.percentChange;
              const statusKey = status.toLowerCase() as 'won' | 'lost' | 'pending';

              return (
                <div key={prediction.id} className="overflow-hidden rounded-[20px] border-2 border-cb-border bg-cb-card">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b-2 border-cb-border bg-cb-card-header px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="rounded-[10px] bg-cb px-2.5 py-[5px] text-[11px] font-semibold leading-none text-white">{ticker}</span>
                      <span className="text-xs uppercase tracking-[0.08em] text-cb-text">{timeframe}</span>
                    </div>
                    <span className={`rounded-md px-2 py-1 text-[11px] font-medium ${statusStyles[statusKey] || statusStyles.pending}`}>
                      {status}
                    </span>
                  </div>

                  {/* Prediction Info */}
                  <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="relative size-[54px] shrink-0">
                        {prediction.image ? (
                          <img src={prediction.image} alt={assetName} className="size-full rounded-full border-[2.5px] border-cb object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center rounded-full border-[2.5px] border-cb bg-gradient-to-br from-cb-border to-cb-card text-[22px] font-bold text-cb">
                            <span>{ticker.charAt(0)}</span>
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 z-[2] flex size-[18px] items-center justify-center rounded-full text-[10px] font-bold ${checkmarkStyles[statusKey] || checkmarkStyles.pending}`}>
                          {status === 'Won' ? '✓' : status === 'Lost' ? '✗' : '•'}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="m-0 mb-[3px] truncate text-[15px] font-semibold leading-[1.3] text-white">{assetName}</h3>
                        <p className="m-0 text-[15px] leading-[1.3] text-cb-text">{predictionType}</p>
                      </div>
                    </div>

                    <div className="flex min-w-[90px] flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-cb-border bg-transparent px-3.5 py-2.5">
                      <div className={`text-xs font-bold leading-none ${percentChange >= 0 ? 'text-cb-won' : 'text-cb-lost'}`}>
                        {percentChange >= 0 ? '↑' : '↓'}
                      </div>
                      <div className="text-[15px] font-bold leading-none text-white">${currentValue.toLocaleString()}</div>
                      <div className="mt-0.5 text-[11px] font-normal leading-none text-cb-text">Target: ${targetValue.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 px-4 pb-3.5">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-[10px] bg-cb-border">
                      <div
                        className={`h-full rounded-[10px] transition-[width] duration-300 ease-in-out ${progressFillStyles[statusKey] || progressFillStyles.pending}`}
                        style={{ width: `${Math.min(100, (currentValue / targetValue) * 100)}%` }}
                      ></div>
                    </div>
                    <div className={`flex shrink-0 items-center justify-center rounded-[20px] border-[2.5px] bg-cb-card-header px-[11px] py-1 text-[15px] font-bold leading-none ${percentChange >= 0 ? 'border-cb-won text-cb-won' : 'border-cb-lost text-cb-lost'}`}>
                      {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t-2 border-cb-border bg-cb-bg px-5 py-3.5">
            <div className="flex items-center gap-3">
              <img src="/image.png" alt="Coinbase" className="h-[15px] w-auto" />
              <img src="/kalshi-logo-grey.svg" alt="Kalshi" className="h-3 w-auto opacity-80" />
            </div>
            <span className="text-[15px] font-normal text-cb-text">Dec 17, 2025 @ 2:00 PM</span>
          </div>
        </div>

        {config.showWatermark && (
          <div className="absolute bottom-4 right-[22px] z-10 text-[8px] font-medium text-cb-text/25">
            kalshi.tools
          </div>
        )}
      </div>
    </div>
  );
}
