import { ChangeEvent, useState, DragEvent } from 'react';
import { MarketPageConfig, MarketOutcome } from '../../types/market-page';
import {
  UploadIcon,
  DownloadIcon,
  CopyIcon,
  ArrowLeftIcon
} from '../../components/ui/Icons';
import { trackEvent } from '../../lib/analytics';
import '../chart/ControlPanel.css';

interface MarketPageMakerProps {
  config: MarketPageConfig;
  onConfigChange: (config: Partial<MarketPageConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onBack: () => void;
  onDrawChart: () => void;
}

function createOutcome(): MarketOutcome {
  return {
    id: `outcome-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    yesPrice: 50,
    noPrice: 50,
    volume: 10000,
  };
}

export function MarketPageMaker({
  config,
  onConfigChange,
  onImageUpload,
  onExport,
  onCopyToClipboard,
  onBack,
  onDrawChart,
}: MarketPageMakerProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
        trackEvent('image_upload', {
          tool: 'market-page',
          method: 'drop',
          target: 'main',
        });
      }
    }
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageUpload(file);
    trackEvent('image_upload', {
      tool: 'market-page',
      method: 'input',
      target: 'main',
    });
  }

  function handleOutcomeChange(outcomeId: string, updates: Partial<MarketOutcome>) {
    const updatedOutcomes = config.outcomes.map((outcome) =>
      outcome.id === outcomeId ? { ...outcome, ...updates } : outcome
    );
    onConfigChange({ outcomes: updatedOutcomes });
  }

  function handleAddOutcome() {
    onConfigChange({ outcomes: [...config.outcomes, createOutcome()] });
  }

  function handleRemoveOutcome(outcomeId: string) {
    if (config.outcomes.length <= 1) return;
    onConfigChange({
      outcomes: config.outcomes.filter((outcome) => outcome.id !== outcomeId),
    });
  }

  function handleYesPriceChange(outcomeId: string, yesPrice: number) {
    const noPrice = 100 - yesPrice;
    handleOutcomeChange(outcomeId, { yesPrice, noPrice });
  }

  return (
    <div className="control-panel">
      <button className="back-button-control-panel" onClick={onBack}>
        <ArrowLeftIcon />
        Back
      </button>
      <h2 className="panel-title">Market Page</h2>
      <p className="panel-subtitle">
        Create a realistic Kalshi market page with customizable outcomes, odds, and chart data.
      </p>

      {/* Market Info Section */}
      <div className="control-section">
        <div className="control-section-title">Market Info</div>

        <div className="control-group">
          <label>Category</label>
          <input
            type="text"
            className="text-input"
            placeholder="e.g., Politics, Sports, Economy"
            value={config.category}
            onChange={(e) => onConfigChange({ category: e.target.value })}
          />
        </div>

        <div className="control-group">
          <label>Title</label>
          <input
            type="text"
            className="text-input"
            placeholder="e.g., Will Bitcoin hit $100k in 2025?"
            value={config.title}
            onChange={(e) => onConfigChange({ title: e.target.value })}
          />
        </div>

        <div className="control-group">
          <label>Subtitle (optional)</label>
          <input
            type="text"
            className="text-input"
            placeholder="Additional context..."
            value={config.subtitle}
            onChange={(e) => onConfigChange({ subtitle: e.target.value })}
          />
        </div>

        <div className="control-group">
          <label>Image</label>
          <div
            className={`parlay-image-placeholder ${isDragging ? 'dragging' : ''}`}
            style={{
              borderColor: isDragging ? '#09C285' : undefined,
              width: '100%',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('market-image-input')?.click()}
          >
            {config.image ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={config.image}
                  alt="Market"
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <button
                  className="parlay-image-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigChange({ image: null });
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <UploadIcon />
                <span>Drop image or click to upload</span>
              </>
            )}
          </div>
          <input
            id="market-image-input"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Outcomes Section */}
      <div className="control-section">
        <div className="control-section-title">Outcomes</div>

        <div className="parlay-legs">
          {config.outcomes.map((outcome, index) => (
            <div key={outcome.id} className="parlay-leg">
              <div className="parlay-leg-header">
                <span className="parlay-leg-title">Outcome {index + 1}</span>
                <button
                  className="parlay-leg-remove"
                  onClick={() => handleRemoveOutcome(outcome.id)}
                  disabled={config.outcomes.length <= 1}
                >
                  Remove
                </button>
              </div>
              <div className="parlay-leg-body">
                <div className="parlay-leg-control" style={{ flex: '1 1 100%' }}>
                  <label className="parlay-leg-label">Name</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="e.g., Yes, Bitcoin above $100k"
                    value={outcome.name}
                    onChange={(e) => handleOutcomeChange(outcome.id, { name: e.target.value })}
                  />
                </div>
                <div className="parlay-leg-controls">
                  <div className="parlay-leg-control">
                    <label className="parlay-leg-label">Yes Price (¢)</label>
                    <input
                      type="number"
                      className="text-input"
                      value={outcome.yesPrice}
                      min={1}
                      max={99}
                      onChange={(e) => handleYesPriceChange(outcome.id, Number(e.target.value))}
                    />
                  </div>
                  <div className="parlay-leg-control">
                    <label className="parlay-leg-label">No Price (¢)</label>
                    <input
                      type="number"
                      className="text-input"
                      value={outcome.noPrice}
                      disabled
                      style={{ backgroundColor: '#f3f4f6' }}
                    />
                  </div>
                  <div className="parlay-leg-control">
                    <label className="parlay-leg-label">Volume ($)</label>
                    <input
                      type="number"
                      className="text-input"
                      value={outcome.volume}
                      min={0}
                      onChange={(e) => handleOutcomeChange(outcome.id, { volume: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button className="parlay-leg-add" onClick={handleAddOutcome}>
            + Add Outcome
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="control-section">
        <div className="control-section-title">Chart</div>

        <div className="control-group">
          <label>Time Range</label>
          <div className="segmented-control">
            {(['1H', '6H', '1D', '1W', '1M', 'ALL'] as const).map((range) => (
              <button
                key={range}
                className={`segmented-option ${config.chartTimeRange === range ? 'active' : ''}`}
                onClick={() => onConfigChange({ chartTimeRange: range })}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <button className="button-draw" onClick={onDrawChart}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
          </svg>
          Draw Chart
        </button>
        <p className="help-text">
          Draw a custom trend line for the chart. The chart will display the probability over time.
        </p>
      </div>

      {/* Display Options */}
      <div className="control-section">
        <div className="control-section-title">Display Options</div>

        <div className="control-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', color: '#374151' }}>
            <input
              type="checkbox"
              checked={config.showWatermark}
              onChange={(e) => onConfigChange({ showWatermark: e.target.checked })}
            />
            Show watermark
          </label>
        </div>

        <div className="control-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', color: '#374151' }}>
            <input
              type="checkbox"
              checked={config.showRules}
              onChange={(e) => onConfigChange({ showRules: e.target.checked })}
            />
            Show rules section
          </label>
        </div>

        {config.showRules && (
          <div className="control-group">
            <label>Rules Text</label>
            <textarea
              className="text-input"
              placeholder="Enter market rules..."
              value={config.rulesText}
              onChange={(e) => onConfigChange({ rulesText: e.target.value })}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="panel-footer">
        <button className="button-export" onClick={onExport}>
          <DownloadIcon />
          Export as PNG
        </button>
        <button className="button-regenerate" onClick={onCopyToClipboard}>
          <CopyIcon />
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
