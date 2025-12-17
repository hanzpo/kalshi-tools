import { CoinbaseConfig } from '../types';
import './CoinbasePreview.css';

interface CoinbasePreviewProps {
  config: CoinbaseConfig;
}

export function CoinbasePreview({ config }: CoinbasePreviewProps) {
  const playType = config.coinbasePlayType.trim() || '';
  const wager = config.coinbaseWager;
  const payout = config.coinbasePayout;

  return (
    <div className="coinbase-container">
      <div id="trade-slip-preview" className="coinbase-preview">
        <div className="coinbase-content">
          {/* Header */}
          <div className="coinbase-header">
            <div className="coinbase-header-left">
              <img src="/image.png" alt="Coinbase" className="coinbase-logo" />
              <div className="coinbase-header-text">
                <h1 className="coinbase-title">{playType}</h1>
                <p className="coinbase-subtitle">
                  <span className="coinbase-wager">${wager.toLocaleString()} paid</span>{' '}
                  <span className="coinbase-payout-header">${payout.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <button className="coinbase-win-button">Won</button>
          </div>

          {/* Prediction Cards */}
          <div className="coinbase-predictions">
            {config.coinbasePredictions.map((prediction, index) => {
              const assetName = prediction.assetName.trim() || `Asset ${index + 1}`;
              const ticker = prediction.ticker.trim() || 'BTC';
              const predictionType = prediction.predictionType.trim() || 'Price Above';
              const targetValue = prediction.targetValue;
              const currentValue = prediction.currentValue;
              const timeframe = prediction.timeframe.trim() || '24h';
              const status = prediction.status.trim() || 'Won';
              const percentChange = prediction.percentChange;
              
              return (
                <div key={prediction.id} className="coinbase-prediction-card">
                  {/* Card Header */}
                  <div className="prediction-card-header">
                    <div className="prediction-card-asset">
                      <span className="ticker-badge">{ticker}</span>
                      <span className="prediction-timeframe">{timeframe}</span>
                    </div>
                    <span className={`prediction-card-status prediction-card-status--${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>

                  {/* Prediction Info */}
                  <div className="prediction-card-body">
                    <div className="prediction-info-left">
                      <div className="prediction-avatar">
                        {prediction.image ? (
                          <img src={prediction.image} alt={assetName} className="prediction-image" />
                        ) : (
                          <div className="prediction-placeholder">
                            <span>{ticker.charAt(0)}</span>
                          </div>
                        )}
                        <div className={`prediction-checkmark prediction-checkmark--${status.toLowerCase()}`}>
                          {status === 'Won' ? '✓' : status === 'Lost' ? '✗' : '•'}
                        </div>
                      </div>
                      <div className="prediction-details">
                        <h3 className="prediction-name">{assetName}</h3>
                        <p className="prediction-meta">{predictionType}</p>
                      </div>
                    </div>

                    <div className="prediction-stat-box">
                      <div className={`prediction-stat-arrow ${percentChange >= 0 ? 'up' : 'down'}`}>
                        {percentChange >= 0 ? '↑' : '↓'}
                      </div>
                      <div className="prediction-stat-value">${currentValue.toLocaleString()}</div>
                      <div className="prediction-stat-type">Target: ${targetValue.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="prediction-progress-container">
                    <div className="prediction-progress-bar">
                      <div 
                        className={`prediction-progress-fill prediction-progress-fill--${status.toLowerCase()}`}
                        style={{ width: `${Math.min(100, (currentValue / targetValue) * 100)}%` }}
                      ></div>
                    </div>
                    <div className={`prediction-progress-value prediction-progress-value--${percentChange >= 0 ? 'up' : 'down'}`}>
                      {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="coinbase-footer">
            <div className="coinbase-footer-brand">
              <img src="/image.png" alt="Coinbase" className="coinbase-footer-logo" />
              <img src="/kalshi-logo-grey.svg" alt="Kalshi" className="coinbase-footer-logo coinbase-footer-logo--kalshi" />
            </div>
            <span className="coinbase-footer-date">Dec 17, 2025 @ 2:00 PM</span>
          </div>
        </div>

        {config.showWatermark && (
          <div className="coinbase-watermark">
            kalshi.tools
          </div>
        )}
      </div>
    </div>
  );
}
