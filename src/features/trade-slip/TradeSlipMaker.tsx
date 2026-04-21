import { ArrowLeft as ArrowLeftIcon, Download as DownloadIcon, Copy as CopyIcon } from 'lucide-react';
import { TradeSlipConfig, TradeSlipMode } from '../../types';
import { calculateSinglePayout, calculateAmericanPayout } from '../../lib/payoutHelpers';
import { ctrl } from '../../styles/controls';
import { useComboState, createComboCategory, createLeg } from './useComboState';
import { SingleModeControls } from './SingleModeControls';
import { ComboModeControls } from './ComboModeControls';
import { ComboOldModeControls } from './ComboOldModeControls';

interface TradeSlipMakerProps {
  config: TradeSlipConfig;
  onConfigChange: (config: Partial<TradeSlipConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onBack: () => void;
}

export function TradeSlipMaker({
  config,
  onConfigChange,
  onImageUpload,
  onExport,
  onCopyToClipboard,
  onBack,
}: TradeSlipMakerProps) {
  const isSingleMode = config.mode === 'single';
  const isComboMode = config.mode === 'combo';
  const isSingleOldMode = config.mode === 'single-old';
  const isComboOldMode = config.mode === 'combo-old';
  const isHorizontalMode = config.mode === 'horizontal';
  const isChampionshipMode = config.mode === 'championship';
  const payout = isSingleMode || isSingleOldMode || isHorizontalMode || isChampionshipMode
    ? calculateSinglePayout(config.wager, config.odds)
    : calculateAmericanPayout(config.wager, config.comboOdds);

  const comboHandlers = useComboState({ config, onConfigChange });

  function handleModeChange(mode: TradeSlipMode) {
    if (mode === config.mode) return;

    if (mode === 'combo' && (!config.comboCategories || config.comboCategories.length === 0)) {
      onConfigChange({
        mode,
        comboCategories: [createComboCategory()],
        comboPayout: config.comboPayout || 1920,
        comboCost: config.comboCost || 99.84,
      });
    } else if (mode === 'combo-old' && config.comboLegs.length === 0) {
      onConfigChange({ mode, comboLegs: [createLeg(), createLeg()] });
    } else {
      onConfigChange({ mode });
    }
  }

  return (
    <div className={ctrl.panel}>
      <button onClick={onBack} className={ctrl.backBtn}>
        <ArrowLeftIcon size={14} />
        Back
      </button>
      <h1 className={ctrl.title}>Trade Slip Maker</h1>
      <p className={ctrl.subtitle}>
        Create Kalshi-style trade slips
      </p>

      <div className={ctrl.group}>
        <label htmlFor="trade-slip-type">Trade Slip Type</label>
        <select
          id="trade-slip-type"
          className={ctrl.input}
          value={config.mode}
          onChange={(e) => handleModeChange(e.target.value as TradeSlipMode)}
        >
          <option value="single">Single</option>
          <option value="combo">Combo</option>
          <option value="single-old">Single (old)</option>
          <option value="combo-old">Combo (old)</option>
          <option value="horizontal">Horizontal</option>
          <option value="championship">March Matchup Championship</option>
        </select>
      </div>

      {/* Mode-specific content sections */}
      {(isSingleMode || isChampionshipMode || isSingleOldMode || isHorizontalMode) && (
        <SingleModeControls
          config={config}
          onConfigChange={onConfigChange}
          onImageUpload={onImageUpload}
        />
      )}

      {isComboMode && (
        <ComboModeControls
          config={config}
          onConfigChange={onConfigChange}
          handlers={comboHandlers}
        />
      )}

      {isComboOldMode && (
        <ComboOldModeControls
          config={config}
          onConfigChange={onConfigChange}
          handlers={comboHandlers}
        />
      )}

      {/* Financials Section - hidden for combo which has its own */}
      {!isComboMode && (
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Financials</div>

        <div className={ctrl.group}>
          <label htmlFor="bet-wager">Wager Amount ($)</label>
          <input
            id="bet-wager"
            type="number"
            className={ctrl.input}
            placeholder="e.g., 1000"
            value={config.wager}
            onChange={(e) => onConfigChange({ wager: parseFloat(e.target.value) || 0 })}
            min="0"
            step="100"
          />
        </div>

        {isSingleMode || isSingleOldMode || isHorizontalMode || isChampionshipMode ? (
          <>
            <div className={ctrl.group}>
              <label htmlFor="bet-odds">Odds (%)</label>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    aria-label="Odds percent"
                    className={`${ctrl.inputInline} w-24 py-1 pl-2 pr-1`}
                    value={config.odds}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);
                      if (!Number.isFinite(raw)) return;
                      const clamped = Math.min(99.9, Math.max(0.1, raw));
                      onConfigChange({ odds: Math.round(clamped * 10) / 10 });
                    }}
                    min="0.1"
                    max="99.9"
                    step="0.1"
                  />
                  <span className="text-[13px] text-text-secondary">% chance</span>
                </div>
                <input
                  id="bet-odds"
                  type="range"
                  className="slider-input"
                  value={config.odds}
                  onChange={(e) => onConfigChange({ odds: Math.round(Number(e.target.value) * 10) / 10 })}
                  min="0.1"
                  max="99.9"
                  step="0.1"
                />
              </div>
              <p className={ctrl.helpText}>Expected payout: ${payout.toLocaleString()}</p>
            </div>

            <div className={ctrl.checkboxGroup}>
              <label className={ctrl.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={config.customPayout != null}
                  onChange={(e) => onConfigChange({ customPayout: e.target.checked ? payout : undefined })}
                  className={ctrl.checkboxInput}
                />
                Custom Payout
              </label>
              {config.customPayout != null && (
                <input
                  id="custom-payout"
                  type="number"
                  className={`${ctrl.input} mt-1.5`}
                  placeholder="e.g., 5000"
                  value={config.customPayout}
                  onChange={(e) => onConfigChange({ customPayout: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="100"
                />
              )}
            </div>

            {/* Timestamp only for new single mode */}
            {(isSingleMode || isChampionshipMode) && (
              <div className={ctrl.group}>
                <label htmlFor="bet-timestamp">Purchase Date/Time (Optional)</label>
                <input
                  id="bet-timestamp"
                  type="datetime-local"
                  className={ctrl.input}
                  value={config.timestamp ?? ''}
                  onChange={(e) => onConfigChange({ timestamp: e.target.value })}
                />
              </div>
            )}
          </>
        ) : isComboOldMode ? (
          <>
            <div className={ctrl.group}>
              <label htmlFor="combo-odds-old">American Odds</label>
              <input
                id="combo-odds-old"
                type="number"
                className={ctrl.input}
                value={config.comboOdds}
                onChange={(e) =>
                  onConfigChange({ comboOdds: Number(e.target.value) || 0 })
                }
                placeholder="+500"
                step="10"
              />
              <p className={ctrl.helpText}>Payout: ${payout.toLocaleString()}</p>
            </div>
            <div className={ctrl.checkboxGroup}>
              <label className={ctrl.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={config.customPayout != null}
                  onChange={(e) => onConfigChange({ customPayout: e.target.checked ? payout : undefined })}
                  className={ctrl.checkboxInput}
                />
                Custom Payout
              </label>
              {config.customPayout != null && (
                <input
                  id="custom-payout-old"
                  type="number"
                  className={`${ctrl.input} mt-1.5`}
                  placeholder="e.g., 5000"
                  value={config.customPayout}
                  onChange={(e) => onConfigChange({ customPayout: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="100"
                />
              )}
            </div>
            <div className={ctrl.group}>
              <label htmlFor="combo-cash-out-old">Cash Out Amount ($)</label>
              <input
                id="combo-cash-out-old"
                type="number"
                className={ctrl.input}
                placeholder="e.g., 947"
                value={config.comboCashOut || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  onConfigChange({ comboCashOut: value });
                }}
                min="0"
                step="1"
              />
            </div>
          </>
        ) : null}
      </div>
      )}

      {/* Display Options Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Display Options</div>

        {/* Background color picker - only for new modes */}
        {!isSingleOldMode && !isComboOldMode && (
          <div className={ctrl.group}>
            <label htmlFor="background-color">Background Color</label>
            <div className="flex gap-2 items-center">
              <input
                id="background-color"
                type="color"
                value={config.backgroundColor}
                onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                className={`${ctrl.colorInput} w-12 h-9 cursor-pointer`}
              />
              <input
                type="text"
                className={`${ctrl.input} flex-1`}
                value={config.backgroundColor}
                onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                placeholder="#28CC95"
              />
            </div>
          </div>
        )}

        {/* Championship title */}
        {isChampionshipMode && (
          <div className={ctrl.group}>
            <label htmlFor="championship-title">Championship Title</label>
            <input
              id="championship-title"
              type="text"
              className={ctrl.input}
              value={config.championshipTitle || 'CHAMPIONSHIP'}
              onChange={(e) => onConfigChange({ championshipTitle: e.target.value })}
              placeholder="CHAMPIONSHIP"
            />
          </div>
        )}

        {/* Secondary color picker - championship only */}
        {isChampionshipMode && (
          <div className={ctrl.group}>
            <label htmlFor="secondary-color">Secondary Color</label>
            <div className="flex gap-2 items-center">
              <input
                id="secondary-color"
                type="color"
                value={config.championshipSecondaryColor || '#0a3d2e'}
                onChange={(e) => onConfigChange({ championshipSecondaryColor: e.target.value })}
                className={`${ctrl.colorInput} w-12 h-9 cursor-pointer`}
              />
              <input
                type="text"
                className={`${ctrl.input} flex-1`}
                value={config.championshipSecondaryColor || '#0a3d2e'}
                onChange={(e) => onConfigChange({ championshipSecondaryColor: e.target.value })}
                placeholder="#0a3d2e"
              />
            </div>
          </div>
        )}

        {!isSingleOldMode && !isComboOldMode && !isHorizontalMode && (
          <div className={ctrl.checkboxGroup}>
            <label htmlFor="show-timestamp-bet" className={ctrl.checkboxLabel}>
              <input
                id="show-timestamp-bet"
                type="checkbox"
                checked={config.showTimestamp}
                onChange={(e) => onConfigChange({ showTimestamp: e.target.checked })}
                className={ctrl.checkboxInput}
              />
              Show Date/Time
            </label>
          </div>
        )}

        <div className={ctrl.checkboxGroup}>
          <label htmlFor="show-watermark-bet" className={ctrl.checkboxLabel}>
            <input
              id="show-watermark-bet"
              type="checkbox"
              checked={config.showWatermark}
              onChange={(e) => onConfigChange({ showWatermark: e.target.checked })}
              className={ctrl.checkboxInput}
            />
            Show Watermark
          </label>
        </div>

        <div className={ctrl.checkboxGroup}>
          <label htmlFor="show-cashed-out" className={ctrl.checkboxLabel}>
            <input
              id="show-cashed-out"
              type="checkbox"
              checked={config.showCashedOut}
              onChange={(e) => onConfigChange({ showCashedOut: e.target.checked })}
              className={ctrl.checkboxInput}
            />
            Show "Cashed out" Badge
          </label>
        </div>

        <div className={ctrl.checkboxGroup}>
          <label htmlFor="is-paid-out" className={ctrl.checkboxLabel}>
            <input
              id="is-paid-out"
              type="checkbox"
              checked={config.isPaidOut}
              onChange={(e) => onConfigChange({ isPaidOut: e.target.checked })}
              className={ctrl.checkboxInput}
            />
            Paid Out
          </label>
        </div>
      </div>

      <div className={ctrl.actions}>
        <button
          onClick={onExport}
          className={`${ctrl.btnExport} flex-1`}
        >
          <DownloadIcon size={16} />
          Export as PNG
        </button>
        <button
          onClick={onCopyToClipboard}
          className={`${ctrl.btnExport} flex-1`}
        >
          <CopyIcon size={16} />
          Copy
        </button>
      </div>
    </div>
  );
}
