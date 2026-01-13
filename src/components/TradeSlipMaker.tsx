import { ChangeEvent, useState, DragEvent } from 'react';
import { TradeSlipConfig, TradeSlipMode, ParlayLeg, PrizePickPlayer, CoinbasePrediction } from '../types';
import { 
  ImageIcon, 
  UploadIcon, 
  DownloadIcon, 
  CopyIcon,
  ArrowLeftIcon
} from './ui/Icons';
import '../components/ControlPanel.css';

interface TradeSlipMakerProps {
  config: TradeSlipConfig;
  onConfigChange: (config: Partial<TradeSlipConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onBack: () => void;
}

function createLeg(): ParlayLeg {
  return {
    id: `leg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: '',
    answer: 'Yes',
    image: null,
  };
}

function createPrizePickPlayer(): PrizePickPlayer {
  return {
    id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    playerName: '',
    team: '',
    position: '',
    number: '',
    opponent: '',
    homeScore: '',
    awayScore: '',
    statType: 'Points',
    statValue: 20,
    image: null,
    league: 'NBA',
    gameStatus: 'Final',
  };
}

function createCoinbasePrediction(): CoinbasePrediction {
  return {
    id: `prediction-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    assetName: '',
    ticker: 'BTC',
    predictionType: 'Price Above',
    targetValue: 100000,
    currentValue: 105000,
    timeframe: '24h',
    status: 'Won',
    percentChange: 5.2,
    image: null,
  };
}

function calculateSinglePayout(wager: number, odds: number): number {
  if (odds <= 0 || odds >= 100) return 0;
  return Math.round((wager / (odds / 100)) * 100) / 100;
}

function calculateAmericanPayout(wager: number, odds: number): number {
  if (!Number.isFinite(odds) || odds === 0) {
    return 0;
  }

  const fractionalReturn =
    odds > 0 ? odds / 100 : 100 / Math.abs(odds);

  return Math.round((wager * (1 + fractionalReturn)) * 100) / 100;
}

const BRAND_GREEN = '#09C285';

export function TradeSlipMaker({
  config,
  onConfigChange,
  onImageUpload,
  onExport,
  onCopyToClipboard,
  onBack,
}: TradeSlipMakerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isSingleMode = config.mode === 'single';
  const isParlayMode = config.mode === 'parlay';
  const isPrizePickMode = config.mode === 'prizepick';
  const isCoinbaseMode = config.mode === 'coinbase';
  const payout = isSingleMode
    ? calculateSinglePayout(config.wager, config.odds)
    : isParlayMode
    ? calculateAmericanPayout(config.wager, config.parlayOdds)
    : isPrizePickMode
    ? config.prizePickPayout
    : config.coinbasePayout;

  function handleModeChange(mode: TradeSlipMode) {
    if (mode === config.mode) return;

    if (mode === 'parlay' && config.parlayLegs.length === 0) {
      onConfigChange({ mode, parlayLegs: [createLeg(), createLeg()] });
    } else if (mode === 'prizepick' && config.prizePickPlayers.length === 0) {
      onConfigChange({ mode, prizePickPlayers: [createPrizePickPlayer()] });
    } else if (mode === 'coinbase' && config.coinbasePredictions.length === 0) {
      onConfigChange({ 
        mode, 
        coinbasePredictions: [createCoinbasePrediction()],
        coinbasePlayType: config.coinbasePlayType || '',
      });
    } else {
      onConfigChange({ mode });
    }
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  }

  function handleLegChange(legId: string, updates: Partial<ParlayLeg>) {
    const updatedLegs = config.parlayLegs.map((leg) =>
      leg.id === legId ? { ...leg, ...updates } : leg
    );
    onConfigChange({ parlayLegs: updatedLegs });
  }

  function handleLegImageInput(
    legId: string,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        handleLegChange(legId, { image: result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddLeg() {
    onConfigChange({ parlayLegs: [...config.parlayLegs, createLeg()] });
  }

  function handleRemoveLeg(legId: string) {
    if (config.parlayLegs.length <= 1) return;
    onConfigChange({
      parlayLegs: config.parlayLegs.filter((leg) => leg.id !== legId),
    });
  }

  function handlePlayerChange(playerId: string, updates: Partial<PrizePickPlayer>) {
    const updatedPlayers = config.prizePickPlayers.map((player) =>
      player.id === playerId ? { ...player, ...updates } : player
    );
    onConfigChange({ prizePickPlayers: updatedPlayers });
  }

  function handlePlayerImageInput(
    playerId: string,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        handlePlayerChange(playerId, { image: result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddPlayer() {
    onConfigChange({ prizePickPlayers: [...config.prizePickPlayers, createPrizePickPlayer()] });
  }

  function handleRemovePlayer(playerId: string) {
    if (config.prizePickPlayers.length <= 1) return;
    onConfigChange({
      prizePickPlayers: config.prizePickPlayers.filter((player) => player.id !== playerId),
    });
  }

  function handlePredictionChange(predictionId: string, updates: Partial<CoinbasePrediction>) {
    const updatedPredictions = config.coinbasePredictions.map((p) =>
      p.id === predictionId ? { ...p, ...updates } : p
    );
    onConfigChange({ coinbasePredictions: updatedPredictions });
  }

  function handlePredictionImageInput(
    predictionId: string,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        handlePredictionChange(predictionId, { image: result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddPrediction() {
    onConfigChange({ coinbasePredictions: [...config.coinbasePredictions, createCoinbasePrediction()] });
  }

  function handleRemovePrediction(predictionId: string) {
    if (config.coinbasePredictions.length <= 1) return;
    onConfigChange({
      coinbasePredictions: config.coinbasePredictions.filter((p) => p.id !== predictionId),
    });
  }

  return (
    <div className="control-panel">
      <button onClick={onBack} className="back-button-control-panel">
        <ArrowLeftIcon size={14} />
        Back
      </button>
      <h1 className="panel-title">Trade Slip Maker</h1>
      <p className="panel-subtitle">
        Create Kalshi-style trade slips
      </p>

      <div className="control-group">
        <label>Trade Slip Type</label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-option${isSingleMode ? ' active' : ''}`}
            onClick={() => handleModeChange('single')}
            aria-pressed={isSingleMode}
          >
            Single
          </button>
          <button
            type="button"
            className={`segmented-option${isParlayMode ? ' active' : ''}`}
            onClick={() => handleModeChange('parlay')}
            aria-pressed={isParlayMode}
          >
            Combo
          </button>
          <button
            type="button"
            className={`segmented-option${isPrizePickMode ? ' active' : ''}`}
            onClick={() => handleModeChange('prizepick')}
            aria-pressed={isPrizePickMode}
          >
            Prize Pick
          </button>
          <button
            type="button"
            className={`segmented-option${isCoinbaseMode ? ' active' : ''}`}
            onClick={() => handleModeChange('coinbase')}
            aria-pressed={isCoinbaseMode}
          >
            Coinbase
          </button>
        </div>
      </div>

      {isSingleMode ? (
        <>
          <div className="control-group">
            <label htmlFor="bet-market-name">Market Name</label>
            <input
              id="bet-market-name"
              type="text"
              className="text-input"
              placeholder="e.g., Bitcoin price today at 6pm EDT?"
              value={config.marketName}
              onChange={(e) => onConfigChange({ marketName: e.target.value })}
            />
          </div>

          <div className="control-group">
            <label htmlFor="bet-outcome">Outcome</label>
            <input
              id="bet-outcome"
              type="text"
              className="text-input"
              placeholder="e.g., $111,000 or above"
              value={config.outcome}
              onChange={(e) => onConfigChange({ outcome: e.target.value })}
            />
          </div>

          <div className="control-group">
            <label>Trade Side</label>
            <div className="segmented-control">
              {(['Yes', 'No'] as const).map((side) => {
                const sideColor = side === 'Yes' ? '#0f9b6c' : '#d91616';
                return (
                  <button
                    key={side}
                    type="button"
                    className={`segmented-option${config.tradeSide === side ? ' active' : ''}`}
                    onClick={() => onConfigChange({ tradeSide: side })}
                    aria-pressed={config.tradeSide === side}
                    style={{
                      color: sideColor,
                      fontWeight: config.tradeSide === side ? 600 : 500,
                    }}
                  >
                    {side}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="bet-image">Image (Optional)</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `1.5px dashed ${isDragging ? BRAND_GREEN : '#d1d5db'}`,
                borderRadius: '5px',
                padding: '16px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '48px',
                backgroundColor: isDragging ? '#f0fdf4' : '#fafafa',
                transition: 'border-color 0.15s, background-color 0.15s',
                cursor: 'pointer',
                marginBottom: '4px'
              }}
            >
              <input
                id="bet-image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageChange}
                className="file-input"
                style={{ display: 'none' }}
              />
              <label
                htmlFor="bet-image"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: isDragging ? BRAND_GREEN : '#6b7280',
                  fontWeight: 500,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}
              >
                {isDragging ? (
                  <>
                    <UploadIcon size={14} />
                    <span>Drop image here</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={14} />
                    <span>Click to upload or drag & drop</span>
                  </>
                )}
              </label>
            </div>
            <p className="help-text">Supports JPG, PNG formats. Or press Ctrl+V to paste.</p>
          </div>
        </>
      ) : isParlayMode ? (
        <div className="control-group">
          <label htmlFor="bet-title">Slip Title</label>
          <input
            id="bet-title"
            type="text"
            className="text-input"
            placeholder="e.g., Sunday Night Parlay"
            value={config.title}
            onChange={(e) => onConfigChange({ title: e.target.value })}
          />
        </div>
      ) : isPrizePickMode ? (
        <div className="control-group">
          <label htmlFor="prizepick-type">Power Play Type</label>
          <input
            id="prizepick-type"
            type="text"
            className="text-input"
            placeholder="e.g., 6-Pick Power Play"
            value={config.prizePickType}
            onChange={(e) => onConfigChange({ prizePickType: e.target.value })}
          />
        </div>
      ) : (
        <div className="control-group">
          <label htmlFor="coinbase-type">Slip Type</label>
          <input
            id="coinbase-type"
            type="text"
            className="text-input"
            placeholder="Title"
            value={config.coinbasePlayType}
            onChange={(e) => onConfigChange({ coinbasePlayType: e.target.value })}
          />
        </div>
      )}

      {isParlayMode && (
        <div className="control-group">
          <label aria-hidden="true">Parlay Legs</label>
          <div className="parlay-legs">
            {config.parlayLegs.map((leg, index) => (
              <div key={leg.id} className="parlay-leg">
                <div className="parlay-leg-header">
                  <span className="parlay-leg-title">Leg {index + 1}</span>
                  <button
                    type="button"
                    className="parlay-leg-remove"
                    onClick={() => handleRemoveLeg(leg.id)}
                    disabled={config.parlayLegs.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="parlay-leg-body">
                  <label className="parlay-leg-label" htmlFor={`parlay-question-${leg.id}`}>
                    Question
                  </label>
                  <input
                    id={`parlay-question-${leg.id}`}
                    type="text"
                    className="text-input"
                    placeholder="e.g., New York Giants to win?"
                    value={leg.question}
                    onChange={(e) => handleLegChange(leg.id, { question: e.target.value })}
                  />
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Answer</span>
                      <div className="segmented-control parlay-answer-toggle">
                        {(['Yes', 'No'] as ParlayLeg['answer'][]).map((answer) => (
                          <button
                            key={answer}
                            type="button"
                            className={`segmented-option${leg.answer === answer ? ' active' : ''}`}
                            onClick={() => handleLegChange(leg.id, { answer })}
                            aria-pressed={leg.answer === answer}
                          >
                            {answer}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Image</span>
                      <div className="parlay-image-upload">
                        {leg.image ? (
                          <>
                            <img src={leg.image} alt="" className="parlay-leg-image" />
                            <button
                              type="button"
                              className="parlay-image-clear"
                              onClick={() => handleLegChange(leg.id, { image: null })}
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <label htmlFor={`parlay-image-${leg.id}`} className="parlay-image-placeholder">
                              Upload
                            </label>
                            <input
                              id={`parlay-image-${leg.id}`}
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) => handleLegImageInput(leg.id, e)}
                              className="file-input"
                              style={{ display: 'none' }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="parlay-leg-add" onClick={handleAddLeg}>
              + Add Leg
            </button>
          </div>
        </div>
      )}

      {isPrizePickMode && (
        <div className="control-group">
          <label aria-hidden="true">Player Picks</label>
          <div className="parlay-legs">
            {config.prizePickPlayers.map((player, index) => (
              <div key={player.id} className="parlay-leg">
                <div className="parlay-leg-header">
                  <span className="parlay-leg-title">Pick {index + 1}</span>
                  <button
                    type="button"
                    className="parlay-leg-remove"
                    onClick={() => handleRemovePlayer(player.id)}
                    disabled={config.prizePickPlayers.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="parlay-leg-body">
                  <label className="parlay-leg-label" htmlFor={`player-name-${player.id}`}>
                    Player Name
                  </label>
                  <input
                    id={`player-name-${player.id}`}
                    type="text"
                    className="text-input"
                    placeholder="e.g., Giannis Antetokounmpo"
                    value={player.playerName}
                    onChange={(e) => handlePlayerChange(player.id, { playerName: e.target.value })}
                  />
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Team</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="MIL"
                        value={player.team}
                        onChange={(e) => handlePlayerChange(player.id, { team: e.target.value })}
                      />
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Opponent</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="e.g., CHI"
                        value={player.opponent}
                        onChange={(e) => handlePlayerChange(player.id, { opponent: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Home Score</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="111"
                        value={player.homeScore}
                        onChange={(e) => handlePlayerChange(player.id, { homeScore: e.target.value })}
                      />
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Away Score</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="113"
                        value={player.awayScore}
                        onChange={(e) => handlePlayerChange(player.id, { awayScore: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">League</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="NBA"
                        value={player.league}
                        onChange={(e) => handlePlayerChange(player.id, { league: e.target.value })}
                      />
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Game Status</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Final"
                        value={player.gameStatus}
                        onChange={(e) => handlePlayerChange(player.id, { gameStatus: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Position</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="PF"
                        value={player.position}
                        onChange={(e) => handlePlayerChange(player.id, { position: e.target.value })}
                      />
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Number</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="#34"
                        value={player.number}
                        onChange={(e) => handlePlayerChange(player.id, { number: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Stat Type</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Points"
                        value={player.statType}
                        onChange={(e) => handlePlayerChange(player.id, { statType: e.target.value })}
                      />
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Stat Value</span>
                      <input
                        type="number"
                        className="text-input"
                        placeholder="20"
                        value={player.statValue}
                        onChange={(e) => handlePlayerChange(player.id, { statValue: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Image</span>
                      <div className="parlay-image-upload">
                        {player.image ? (
                          <>
                            <img src={player.image} alt="" className="parlay-leg-image" />
                            <button
                              type="button"
                              className="parlay-image-clear"
                              onClick={() => handlePlayerChange(player.id, { image: null })}
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <label htmlFor={`player-image-${player.id}`} className="parlay-image-placeholder">
                              Upload
                            </label>
                            <input
                              id={`player-image-${player.id}`}
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) => handlePlayerImageInput(player.id, e)}
                              className="file-input"
                              style={{ display: 'none' }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="parlay-leg-add" onClick={handleAddPlayer}>
              + Add Player
            </button>
          </div>
        </div>
      )}

      {isPrizePickMode && (
        <div className="control-group">
          <label>Player Display Options</label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={config.prizePickShowTeam}
                  onChange={(e) => onConfigChange({ prizePickShowTeam: e.target.checked })}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: BRAND_GREEN,
                  }}
                />
                <span>Team chip</span>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={config.prizePickShowPosition}
                  onChange={(e) => onConfigChange({ prizePickShowPosition: e.target.checked })}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: BRAND_GREEN,
                  }}
                />
                <span>Position chip</span>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={config.prizePickShowNumber}
                  onChange={(e) => onConfigChange({ prizePickShowNumber: e.target.checked })}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: BRAND_GREEN,
                  }}
                />
                <span>Number chip</span>
              </label>
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={config.prizePickShowScore}
                onChange={(e) => onConfigChange({ prizePickShowScore: e.target.checked })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: BRAND_GREEN,
                }}
              />
              <span>Show score line</span>
            </label>
          </div>
          <p className="help-text">Choose which badges and score row appear on each pick.</p>
        </div>
      )}

      {isCoinbaseMode && (
        <div className="control-group">
          <label aria-hidden="true">Predictions</label>
          <div className="parlay-legs">
            {config.coinbasePredictions.map((prediction, index) => (
              <div key={prediction.id} className="parlay-leg">
                <div className="parlay-leg-header">
                  <span className="parlay-leg-title">Prediction {index + 1}</span>
                  <button
                    type="button"
                    className="parlay-leg-remove"
                    onClick={() => handleRemovePrediction(prediction.id)}
                    disabled={config.coinbasePredictions.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="parlay-leg-body">
                  <label className="parlay-leg-label" htmlFor={`asset-name-${prediction.id}`}>
                    Asset Name
                  </label>
                  <input
                    id={`asset-name-${prediction.id}`}
                    type="text"
                    className="text-input"
                    placeholder="e.g., Bitcoin"
                    value={prediction.assetName}
                    onChange={(e) => handlePredictionChange(prediction.id, { assetName: e.target.value })}
                  />
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Ticker</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="BTC"
                        value={prediction.ticker}
                        onChange={(e) => handlePredictionChange(prediction.id, { ticker: e.target.value })}
                      />
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Timeframe</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="24h"
                        value={prediction.timeframe}
                        onChange={(e) => handlePredictionChange(prediction.id, { timeframe: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Prediction Type</span>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Price Above"
                        value={prediction.predictionType}
                        onChange={(e) => handlePredictionChange(prediction.id, { predictionType: e.target.value })}
                      />
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Status</span>
                      <select
                        className="text-input"
                        value={prediction.status}
                        onChange={(e) => handlePredictionChange(prediction.id, { status: e.target.value })}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '5px',
                          backgroundColor: 'white',
                          fontSize: '14px',
                          color: '#374151',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Target Value ($)</span>
                      <input
                        type="number"
                        className="text-input"
                        placeholder="100000"
                        value={prediction.targetValue}
                        onChange={(e) => handlePredictionChange(prediction.id, { targetValue: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Current Value ($)</span>
                      <input
                        type="number"
                        className="text-input"
                        placeholder="105000"
                        value={prediction.currentValue}
                        onChange={(e) => handlePredictionChange(prediction.id, { currentValue: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">% Change</span>
                      <input
                        type="number"
                        className="text-input"
                        placeholder="5.2"
                        step="0.1"
                        value={prediction.percentChange}
                        onChange={(e) => handlePredictionChange(prediction.id, { percentChange: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Image</span>
                      <div className="parlay-image-upload">
                        {prediction.image ? (
                          <>
                            <img src={prediction.image} alt="" className="parlay-leg-image" />
                            <button
                              type="button"
                              className="parlay-image-clear"
                              onClick={() => handlePredictionChange(prediction.id, { image: null })}
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <label htmlFor={`prediction-image-${prediction.id}`} className="parlay-image-placeholder">
                              <ImageIcon size={14} />
                              Upload
                            </label>
                            <input
                              id={`prediction-image-${prediction.id}`}
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) => handlePredictionImageInput(prediction.id, e)}
                              className="file-input"
                              style={{ display: 'none' }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="parlay-leg-add" onClick={handleAddPrediction}>
              + Add Prediction
            </button>
          </div>
        </div>
      )}

      {!isPrizePickMode && !isCoinbaseMode && (
        <div className="control-group">
          <label htmlFor="bet-wager">Wager Amount ($)</label>
          <input
            id="bet-wager"
            type="number"
            className="text-input"
            placeholder="e.g., 1000"
            value={config.wager}
            onChange={(e) => onConfigChange({ wager: parseFloat(e.target.value) || 0 })}
            min="0"
            step="100"
          />
        </div>
      )}

      {isSingleMode ? (
        <div className="control-group">
          <label htmlFor="bet-odds">Odds (%)</label>
          <div className="slider-wrapper">
            <input
              id="bet-odds"
              type="range"
              className="slider-input"
              value={config.odds}
              onChange={(e) => onConfigChange({ odds: Number(e.target.value) })}
              min="1"
              max="99"
              step="1"
            />
            <div className="slider-value">{config.odds}% chance</div>
          </div>
          <p className="help-text">Expected payout: ${payout.toLocaleString()}</p>
        </div>
      ) : isParlayMode ? (
        <>
          <div className="control-group">
            <label htmlFor="parlay-odds">American Odds</label>
            <input
              id="parlay-odds"
              type="number"
              className="text-input"
              value={config.parlayOdds}
              onChange={(e) =>
                onConfigChange({ parlayOdds: Number(e.target.value) || 0 })
              }
              placeholder="+500"
              step="10"
            />
            <p className="help-text">
              Enter positive or negative odds (e.g., -110 or +250). Potential payout: ${payout.toLocaleString()}
            </p>
          </div>
          <div className="control-group">
            <label htmlFor="parlay-cash-out">Cash Out Amount ($)</label>
            <input
              id="parlay-cash-out"
              type="number"
              className="text-input"
              placeholder="e.g., 947"
              value={config.parlayCashOut || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                onConfigChange({ parlayCashOut: value });
              }}
              min="0"
              step="1"
            />
            <p className="help-text">Optional: Current cash out value</p>
          </div>
        </>
      ) : isPrizePickMode ? (
        <>
          <div className="control-group">
            <label htmlFor="prizepick-wager">Wager Amount ($)</label>
            <input
              id="prizepick-wager"
              type="number"
              className="text-input"
              placeholder="e.g., 1000"
              value={config.prizePickWager}
              onChange={(e) => onConfigChange({ prizePickWager: parseFloat(e.target.value) || 0 })}
              min="0"
              step="100"
            />
          </div>
          <div className="control-group">
            <label htmlFor="prizepick-payout">Payout Amount ($)</label>
            <input
              id="prizepick-payout"
              type="number"
              className="text-input"
              placeholder="e.g., 25000"
              value={config.prizePickPayout}
              onChange={(e) => onConfigChange({ prizePickPayout: parseFloat(e.target.value) || 0 })}
              min="0"
              step="1000"
            />
            <p className="help-text">Potential payout: ${payout.toLocaleString()}</p>
          </div>
        </>
      ) : (
        <>
          <div className="control-group">
            <label htmlFor="coinbase-wager">Wager Amount ($)</label>
            <input
              id="coinbase-wager"
              type="number"
              className="text-input"
              placeholder="e.g., 1000"
              value={config.coinbaseWager}
              onChange={(e) => onConfigChange({ coinbaseWager: parseFloat(e.target.value) || 0 })}
              min="0"
              step="100"
            />
          </div>
          <div className="control-group">
            <label htmlFor="coinbase-payout">Payout Amount ($)</label>
            <input
              id="coinbase-payout"
              type="number"
              className="text-input"
              placeholder="e.g., 25000"
              value={config.coinbasePayout}
              onChange={(e) => onConfigChange({ coinbasePayout: parseFloat(e.target.value) || 0 })}
              min="0"
              step="1000"
            />
            <p className="help-text">Potential payout: ${payout.toLocaleString()}</p>
          </div>
        </>
      )}

      <div className="control-group" style={{ marginBottom: 0 }}>
        <label
          htmlFor="show-watermark-bet"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <input
            id="show-watermark-bet"
            type="checkbox"
            checked={config.showWatermark}
            onChange={(e) => onConfigChange({ showWatermark: e.target.checked })}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: BRAND_GREEN,
            }}
          />
          <span>Show Watermark</span>
        </label>
        <p className="help-text">Display watermark on trade slip</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        <button
          onClick={onExport}
          className="button-export"
          style={{ flex: 1 }}
        >
          <DownloadIcon size={16} />
          Export as PNG
        </button>
        <button
          onClick={onCopyToClipboard}
          className="button-export"
          style={{ flex: 1 }}
        >
          <CopyIcon size={16} />
          Copy
        </button>
      </div>
    </div>
  );
}

