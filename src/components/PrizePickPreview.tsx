import { TradeSlipConfig } from '../types';
import './PrizePickPreview.css';

interface PrizePickPreviewProps {
  config: TradeSlipConfig;
}

export function PrizePickPreview({ config }: PrizePickPreviewProps) {
  const prizePickType = config.prizePickType.trim() || '6-Pick Power Play';
  const wager = config.prizePickWager;
  const payout = config.prizePickPayout;

  return (
    <div className="prizepick-container">
      <div id="trade-slip-preview" className="prizepick-preview">
        <div className="prizepick-content">
          {/* Header */}
          <div className="prizepick-header">
            <div className="prizepick-spray-paint">
              <img src="/spraypaint.png" alt="" className="spray-paint-image" />
            </div>
            <div className="prizepick-header-left">
              <img src="/prizepickslogo.svg" alt="PrizePicks" className="prizepick-logo" />
              <div className="prizepick-header-text">
                <h1 className="prizepick-title">{prizePickType}</h1>
                <p className="prizepick-subtitle">
                  <span className="prizepick-wager">${wager.toLocaleString()} paid</span>{' '}
                  <span className="prizepick-payout-header">${payout.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <button className="prizepick-win-button">Win</button>
          </div>

          {/* Player Cards */}
          <div className="prizepick-players">
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
              
              return (
                <div key={player.id} className="prizepick-player-card">
                  {/* Card Header */}
                  <div className="player-card-header">
                    <div className="player-card-league">
                      <span className="league-badge">{league}</span>
                    </div>
                    <span className="player-card-status">{gameStatus}</span>
                  </div>

                  {/* Score */}
                  <div className="player-card-score">
                    <span className="score-item">{team} {homeScore}</span>
                    <span className="score-vs">vs</span>
                    <span className="score-item">{opponent} {awayScore}</span>
                  </div>

                  {/* Player Info */}
                  <div className="player-card-body">
                    <div className="player-info-left">
                      <div className="player-avatar">
                        {player.image ? (
                          <img src={player.image} alt={playerName} className="player-image" />
                        ) : (
                          <div className="player-placeholder">
                            <span>{playerName.charAt(0)}</span>
                          </div>
                        )}
                        <img src="/checkmark.svg" alt="" className="player-checkmark" />
                      </div>
                      <div className="player-details">
                        <h3 className="player-name">{playerName}</h3>
                        <p className="player-meta">{team} • {position} • {number}</p>
                      </div>
                    </div>

                    <div className="player-stat-box">
                      <div className="player-stat-arrow">↑</div>
                      <div className="player-stat-value">{statValue}</div>
                      <div className="player-stat-type">{statType}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="player-progress-container">
                    <div className="player-progress-bar">
                      <div className="player-progress-fill"></div>
                    </div>
                    <div className="player-progress-value">{statValue}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="prizepick-footer">
            <div className="prizepick-footer-brand">
              <img src="/prizepickslogowithtext.svg" alt="PrizePicks" className="prizepick-footer-logo" />
            </div>
            <span className="prizepick-footer-date">Oct 31, 2025 @ 2:00 PM</span>
          </div>
        </div>

        {config.showWatermark && (
          <div className="prizepick-watermark">
            kalshi.tools
          </div>
        )}
      </div>
    </div>
  );
}

