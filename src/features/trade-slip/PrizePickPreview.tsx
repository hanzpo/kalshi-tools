import { TradeSlipConfig } from '../../types';
import './PrizePickPreview.css';

interface PrizePickPreviewProps {
  config: TradeSlipConfig;
}

export function PrizePickPreview({ config }: PrizePickPreviewProps) {
  const prizePickType = config.prizePickType.trim() || '6-Pick Power Play';
  const wager = config.prizePickWager;
  const payout = config.prizePickPayout;

  return (
    <div className="flex min-h-full w-full items-center justify-center p-6 max-sm:p-4">
      <div id="trade-slip-preview" className="relative w-full max-w-[520px] overflow-hidden rounded-3xl border-2 border-pp-border bg-pp-bg font-sans max-sm:max-w-full">
        <div className="flex flex-col">
          {/* Header */}
          <div className="relative flex min-h-[100px] items-start justify-between overflow-hidden border-b-2 border-pp-border bg-pp-header px-6 pb-6 pt-5 max-sm:px-5 max-sm:pb-5 max-sm:pt-4">
            <div className="pointer-events-none absolute -top-[300%] -right-[30%] z-0 h-[450%] w-[120%] rotate-[12.9deg] opacity-70 mix-blend-screen">
              <img src="/spraypaint.png" alt="Spray paint background" className="spray-paint-image size-full object-cover" />
            </div>
            <div className="z-[1] flex flex-1 items-start gap-3.5">
              <img src="/prizepickslogo.svg" alt="PrizePicks" className="mt-0.5 w-[52px] shrink-0 max-sm:w-[46px]" />
              <div className="flex flex-col gap-1">
                <h1 className="m-0 text-[15px] font-normal leading-[1.3] text-pp-text max-sm:text-sm">{prizePickType}</h1>
                <p className="m-0 text-xl font-semibold leading-[1.3] text-white max-sm:text-lg">
                  <span className="text-white">${wager.toLocaleString()} paid</span>{' '}
                  <span className="text-pp">${payout.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <button className="z-[1] flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-none bg-pp px-3.5 py-1.5 text-sm font-bold leading-none text-pp-header hover:bg-[#7fff1a]">Win</button>
          </div>

          {/* Player Cards */}
          <div className="flex flex-col gap-3 p-3.5">
            {config.prizePickPlayers.map((player, index) => {
              const playerName = player.playerName.trim() || `Player ${index + 1}`;
              const team = player.team.trim() || 'TM';
              const position = player.position.trim() || 'POS';
              const number = player.number.trim() || '#0';
              const opponent = player.opponent.trim() || 'OPP';
              const homeScore = player.homeScore.trim() || '0';
              const awayScore = player.awayScore.trim() || '0';
              const statType = player.statType.trim() || 'Points';
              const statValue = player.statValue || 20;
              const league = player.league.trim() || 'NBA';
              const gameStatus = player.gameStatus.trim() || 'Final';
              const metaItems = [
                config.prizePickShowTeam ? team : '',
                config.prizePickShowPosition ? position : '',
                config.prizePickShowNumber ? number : '',
              ].filter((item): item is string => Boolean(item && item.trim()));
              const showScoreLine = config.prizePickShowScore;

              return (
                <div key={player.id} className="overflow-hidden rounded-[20px] border-2 border-pp-border bg-pp-card">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b-2 border-pp-border bg-pp-card-header px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="rounded-[10px] border-[1.5px] border-[#2d2c3a] bg-transparent px-2.5 py-[5px] text-[11px] font-medium leading-none text-pp-text">{league}</span>
                      {showScoreLine && (
                        <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.08em] text-pp-text">
                          <span className="flex items-center font-semibold leading-none tracking-normal normal-case text-[#9d9ab3]">{team} {homeScore}</span>
                          <span className="text-[10px] font-semibold tracking-[0.2em] text-[#7f7d92]">vs</span>
                          <span className="flex items-center font-semibold leading-none tracking-normal normal-case text-white">{opponent} {awayScore}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-normal text-pp-text">{gameStatus}</span>
                  </div>

                  {/* Player Info */}
                  <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="relative size-[54px] shrink-0">
                        {player.image ? (
                          <img src={player.image} alt={playerName} className="size-full rounded-full border-[2.5px] border-pp object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center rounded-full border-[2.5px] border-pp bg-gradient-to-br from-[#2a2a3a] to-[#1a1a2a] text-[22px] font-bold text-pp">
                            <span>{playerName.charAt(0)}</span>
                          </div>
                        )}
                        <img src="/checkmark.svg" alt="Pick selected" className="absolute -bottom-0.5 -right-0.5 z-[2] size-[17px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="m-0 mb-[3px] truncate text-[15px] font-semibold leading-[1.3] text-white">{playerName}</h3>
                        {metaItems.length > 0 && (
                          <p className="m-0 text-[15px] leading-[1.3] text-pp-text">{metaItems.join(' • ')}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex min-w-[68px] flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-pp-border bg-transparent px-3.5 py-2.5">
                      <div className="text-xs font-bold leading-none text-pp">↑</div>
                      <div className="text-[15px] font-bold leading-none text-white">{statValue}</div>
                      <div className="mt-0.5 text-[11px] font-normal leading-none text-pp-text">{statType}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 px-4 pb-3.5">
                    <div className="h-2.5 flex-1 rounded-[10px] bg-pp">
                      <div className="h-full w-full rounded-[10px] bg-pp"></div>
                    </div>
                    <div className="flex shrink-0 items-center justify-center rounded-[20px] border-[2.5px] border-pp bg-pp-card-header px-[11px] py-1 text-[15px] font-bold leading-none text-pp">{statValue}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t-2 border-pp-border bg-pp-bg px-5 py-3.5">
            <div className="flex items-center gap-3">
              <img src="/prizepickslogowithtext.svg" alt="PrizePicks" className="h-[15px] w-auto" />
              <img src="/kalshi-logo-grey.svg" alt="Kalshi" className="h-3 w-auto opacity-80" />
            </div>
            <span className="text-[15px] font-normal text-pp-text">Oct 31, 2025 @ 2:00 PM</span>
          </div>
        </div>

        {config.showWatermark && (
          <div className="absolute bottom-4 right-[22px] z-10 text-[8px] font-medium text-pp-text/25">
            kalshi.tools
          </div>
        )}
      </div>
    </div>
  );
}
