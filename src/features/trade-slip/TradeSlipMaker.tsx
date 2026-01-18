import { ChangeEvent, useState, DragEvent } from 'react';
import { TradeSlipConfig, TradeSlipMode, ComboCategory, ComboEvent, ComboMarket, ParlayLeg } from '../../types';
import {
  ImageIcon,
  UploadIcon,
  DownloadIcon,
  CopyIcon,
  ArrowLeftIcon
} from '../../components/ui/Icons';
import { trackEvent } from '../../lib/analytics';
import '../chart/ControlPanel.css';

interface TradeSlipMakerProps {
  config: TradeSlipConfig;
  onConfigChange: (config: Partial<TradeSlipConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onBack: () => void;
}

function createComboMarket(): ComboMarket {
  return {
    id: `market-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: '',
    prefix: undefined,
  };
}

function createComboEvent(): ComboEvent {
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    markets: [createComboMarket()],
  };
}

function createComboCategory(): ComboCategory {
  return {
    id: `category-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    events: [createComboEvent()],
  };
}

function createLeg(): ParlayLeg {
  return {
    id: `leg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: '',
    answer: 'Yes',
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
  const [draggingLegId, setDraggingLegId] = useState<string | null>(null);
  const isSingleMode = config.mode === 'single';
  const isParlayMode = config.mode === 'parlay';
  const isSingleOldMode = config.mode === 'single-old';
  const isParlayOldMode = config.mode === 'parlay-old';
  const isHorizontalMode = config.mode === 'horizontal';
  const payout = isSingleMode || isSingleOldMode || isHorizontalMode
    ? calculateSinglePayout(config.wager, config.odds)
    : calculateAmericanPayout(config.wager, config.parlayOdds);

  function handleModeChange(mode: TradeSlipMode) {
    if (mode === config.mode) return;

    if (mode === 'parlay' && (!config.comboCategories || config.comboCategories.length === 0)) {
      onConfigChange({
        mode,
        comboCategories: [createComboCategory()],
        comboPayout: config.comboPayout || 1920,
        comboCost: config.comboCost || 99.84,
      });
    } else if (mode === 'parlay-old' && config.parlayLegs.length === 0) {
      onConfigChange({ mode, parlayLegs: [createLeg(), createLeg()] });
    } else {
      onConfigChange({ mode });
    }
  }

  // Old parlay leg handlers
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

  function handleLegDragOver(legId: string, e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDraggingLegId(legId);
  }

  function handleLegDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDraggingLegId(null);
  }

  function handleLegDrop(legId: string, e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDraggingLegId(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result;
          if (typeof result === 'string') {
            handleLegChange(legId, { image: result });
            trackEvent('image_upload', {
              tool: 'trade-slip',
              mode: config.mode,
              method: 'drop',
              target: 'parlay-leg',
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Combo category handlers
  function handleCategoryChange(categoryId: string, updates: Partial<ComboCategory>) {
    const updatedCategories = config.comboCategories.map((cat) =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleAddCategory() {
    onConfigChange({ comboCategories: [...config.comboCategories, createComboCategory()] });
  }

  function handleRemoveCategory(categoryId: string) {
    if (config.comboCategories.length <= 1) return;
    onConfigChange({
      comboCategories: config.comboCategories.filter((cat) => cat.id !== categoryId),
    });
  }

  // Combo event handlers
  function handleEventChange(categoryId: string, eventId: string, updates: Partial<ComboEvent>) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: cat.events.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event
        ),
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleAddEvent(categoryId: string) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: [...cat.events, createComboEvent()],
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleRemoveEvent(categoryId: string, eventId: string) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      if (cat.events.length <= 1) return cat;
      return {
        ...cat,
        events: cat.events.filter((event) => event.id !== eventId),
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  // Combo market handlers
  function handleMarketChange(categoryId: string, eventId: string, marketId: string, updates: Partial<ComboMarket>) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: cat.events.map((event) => {
          if (event.id !== eventId) return event;
          return {
            ...event,
            markets: event.markets.map((market) =>
              market.id === marketId ? { ...market, ...updates } : market
            ),
          };
        }),
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleAddMarket(categoryId: string, eventId: string) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: cat.events.map((event) => {
          if (event.id !== eventId) return event;
          return {
            ...event,
            markets: [...event.markets, createComboMarket()],
          };
        }),
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleRemoveMarket(categoryId: string, eventId: string, marketId: string) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: cat.events.map((event) => {
          if (event.id !== eventId) return event;
          if (event.markets.length <= 1) return event;
          return {
            ...event,
            markets: event.markets.filter((market) => market.id !== marketId),
          };
        }),
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      trackEvent('image_upload', {
        tool: 'trade-slip',
        mode: config.mode,
        method: 'file_input',
        target: 'main',
      });
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode && !isSingleOldMode && !isHorizontalMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode && !isSingleOldMode && !isHorizontalMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode && !isSingleOldMode && !isHorizontalMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
        trackEvent('image_upload', {
          tool: 'trade-slip',
          mode: config.mode,
          method: 'drop',
          target: 'main',
        });
      }
    }
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
            className={`segmented-option${isSingleOldMode ? ' active' : ''}`}
            onClick={() => handleModeChange('single-old')}
            aria-pressed={isSingleOldMode}
          >
            Single (old)
          </button>
          <button
            type="button"
            className={`segmented-option${isParlayOldMode ? ' active' : ''}`}
            onClick={() => handleModeChange('parlay-old')}
            aria-pressed={isParlayOldMode}
          >
            Parlay (old)
          </button>
          <button
            type="button"
            className={`segmented-option${isHorizontalMode ? ' active' : ''}`}
            onClick={() => handleModeChange('horizontal')}
            aria-pressed={isHorizontalMode}
          >
            Horizontal
          </button>
        </div>
      </div>

      {isSingleMode ? (
        <>
          {/* Content Section */}
          <div className="control-section">
            <div className="control-section-title">Content</div>

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
                  backgroundColor: isDragging ? '#f0fdf4' : '#ffffff',
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
                {(['Yes', 'No', 'Custom'] as const).map((side) => {
                  const sideColor = side === 'Yes' ? '#0f9b6c' : side === 'No' ? '#d91616' : '#666666';
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

            {config.tradeSide === 'Custom' && (
              <>
                <div className="control-group">
                  <label htmlFor="custom-side-color">Custom Side Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      id="custom-side-color"
                      type="color"
                      value={config.customSideColor || '#0f9b6c'}
                      onChange={(e) => onConfigChange({ customSideColor: e.target.value })}
                      className="color-input"
                      style={{ width: '48px', height: '36px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="text-input"
                      value={config.customSideColor || '#0f9b6c'}
                      onChange={(e) => onConfigChange({ customSideColor: e.target.value })}
                      placeholder="#0f9b6c"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div className="control-group">
                  <label htmlFor="custom-side-text">Custom Side Text</label>
                  <input
                    id="custom-side-text"
                    type="text"
                    className="text-input"
                    placeholder="e.g., Maybe"
                    value={config.customSideText || ''}
                    onChange={(e) => onConfigChange({ customSideText: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </>
      ) : isParlayMode ? (
        <>
          {/* Financials Section */}
          <div className="control-section">
            <div className="control-section-title">Financials</div>

            <div className="control-group">
              <label htmlFor="combo-payout">Payout Amount ($)</label>
              <input
                id="combo-payout"
                type="number"
                className="text-input"
                placeholder="e.g., 1920"
                value={config.comboPayout || ''}
                onChange={(e) => onConfigChange({ comboPayout: parseFloat(e.target.value) || 0 })}
                min="0"
                step="1"
              />
            </div>
            <div className="control-group">
              <label htmlFor="combo-cost">Cost ($)</label>
              <input
                id="combo-cost"
                type="number"
                className="text-input"
                placeholder="e.g., 99.84"
                value={config.comboCost || ''}
                onChange={(e) => onConfigChange({ comboCost: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
            <div className="control-group">
              <label htmlFor="combo-timestamp">Purchase Date/Time (Optional)</label>
              <input
                id="combo-timestamp"
                type="datetime-local"
                className="text-input"
                value={config.timestamp ?? ''}
                onChange={(e) => onConfigChange({ timestamp: e.target.value })}
              />
              <p className="help-text">Leave blank to use current date/time</p>
            </div>
          </div>
        </>
      ) : isSingleOldMode ? (
        <>
          {/* Content Section */}
          <div className="control-section">
            <div className="control-section-title">Content</div>

            <div className="control-group">
              <label htmlFor="bet-market-name-old">Market Name</label>
              <input
                id="bet-market-name-old"
                type="text"
                className="text-input"
                placeholder="e.g., Bitcoin price today at 6pm EDT?"
                value={config.marketName}
                onChange={(e) => onConfigChange({ marketName: e.target.value })}
              />
            </div>

            <div className="control-group">
              <label htmlFor="bet-outcome-old">Outcome</label>
              <input
                id="bet-outcome-old"
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
              <label htmlFor="bet-image-old">Image (Optional)</label>
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
                  backgroundColor: isDragging ? '#f0fdf4' : '#ffffff',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  cursor: 'pointer',
                  marginBottom: '4px'
                }}
              >
                <input
                  id="bet-image-old"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="file-input"
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="bet-image-old"
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
          </div>
        </>
      ) : isParlayOldMode ? (
        <div className="control-section">
          <div className="control-section-title">Content</div>
          <div className="control-group">
            <label htmlFor="bet-title-old">Slip Title</label>
            <input
              id="bet-title-old"
              type="text"
              className="text-input"
              placeholder="e.g., Sunday Night Parlay"
              value={config.title}
              onChange={(e) => onConfigChange({ title: e.target.value })}
            />
          </div>
        </div>
      ) : isHorizontalMode ? (
        <>
          {/* Content Section for Horizontal */}
          <div className="control-section">
            <div className="control-section-title">Content</div>

            <div className="control-group">
              <label htmlFor="bet-image-horizontal">Background Image</label>
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
                  backgroundColor: isDragging ? '#f0fdf4' : '#ffffff',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  cursor: 'pointer',
                  marginBottom: '4px'
                }}
              >
                <input
                  id="bet-image-horizontal"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="file-input"
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="bet-image-horizontal"
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

            <div className="control-group">
              <label htmlFor="bet-market-name-horizontal">Market Question</label>
              <input
                id="bet-market-name-horizontal"
                type="text"
                className="text-input"
                placeholder="e.g., Will Donald Trump win the 2024 election?"
                value={config.marketName}
                onChange={(e) => onConfigChange({ marketName: e.target.value })}
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
          </div>
        </>
      ) : null}

      {isParlayMode && (
        <div className="control-group">
          <label aria-hidden="true">Categories &amp; Markets</label>
          <div className="parlay-legs">
            {config.comboCategories?.map((category, catIndex) => (
              <div key={category.id} className="parlay-leg combo-category-input">
                <div className="parlay-leg-header">
                  <span className="parlay-leg-title">Category {catIndex + 1}</span>
                  <button
                    type="button"
                    className="parlay-leg-remove"
                    onClick={() => handleRemoveCategory(category.id)}
                    disabled={config.comboCategories.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="parlay-leg-body">
                  <label className="parlay-leg-label" htmlFor={`category-name-${category.id}`}>
                    Category Name
                  </label>
                  <input
                    id={`category-name-${category.id}`}
                    type="text"
                    className="text-input"
                    placeholder="e.g., Pro Football"
                    value={category.name}
                    onChange={(e) => handleCategoryChange(category.id, { name: e.target.value })}
                  />

                  {/* Events within category */}
                  <div className="combo-events-container">
                    {category.events.map((event, eventIndex) => (
                      <div key={event.id} className="combo-event-input">
                        <div className="combo-event-header-input">
                          <span className="combo-event-title">Event {eventIndex + 1}</span>
                          <button
                            type="button"
                            className="parlay-leg-remove"
                            onClick={() => handleRemoveEvent(category.id, event.id)}
                            disabled={category.events.length <= 1}
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          className="text-input"
                          placeholder="e.g., Kansas City @ Philadelphia"
                          value={event.name}
                          onChange={(e) => handleEventChange(category.id, event.id, { name: e.target.value })}
                        />

                        {/* Team colors */}
                        <div className="combo-color-pickers">
                          <div className="combo-color-picker">
                            <label>Color 1</label>
                            <input
                              type="color"
                              value={event.color1 || '#E31837'}
                              onChange={(e) => handleEventChange(category.id, event.id, { color1: e.target.value })}
                              className="color-input"
                            />
                          </div>
                          <div className="combo-color-picker">
                            <label>Color 2</label>
                            <input
                              type="color"
                              value={event.color2 || '#004C54'}
                              onChange={(e) => handleEventChange(category.id, event.id, { color2: e.target.value })}
                              className="color-input"
                            />
                          </div>
                        </div>

                        {/* Markets within event */}
                        <div className="combo-markets-container">
                          {event.markets.map((market, marketIndex) => (
                            <div key={market.id} className="combo-market-input">
                              <div className="combo-market-header-input">
                                <span className="combo-market-title">Market {marketIndex + 1}</span>
                                <button
                                  type="button"
                                  className="parlay-leg-remove"
                                  onClick={() => handleRemoveMarket(category.id, event.id, market.id)}
                                  disabled={event.markets.length <= 1}
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="combo-market-inputs">
                                <input
                                  type="text"
                                  className="text-input combo-prefix-input"
                                  placeholder="Prefix (e.g., No)"
                                  value={market.prefix || ''}
                                  onChange={(e) => handleMarketChange(category.id, event.id, market.id, { prefix: e.target.value || undefined })}
                                  style={{ width: '80px', flexShrink: 0 }}
                                />
                                <input
                                  type="text"
                                  className="text-input"
                                  placeholder="Market text (e.g., Philadelphia)"
                                  value={market.text}
                                  onChange={(e) => handleMarketChange(category.id, event.id, market.id, { text: e.target.value })}
                                  style={{ flex: 1 }}
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="parlay-leg-add combo-add-market"
                            onClick={() => handleAddMarket(category.id, event.id)}
                          >
                            + Add Market
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="parlay-leg-add combo-add-event"
                      onClick={() => handleAddEvent(category.id)}
                    >
                      + Add Event
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="parlay-leg-add" onClick={handleAddCategory}>
              + Add Category
            </button>
          </div>
        </div>
      )}

      {isParlayOldMode && (
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
                      <div
                        className="parlay-image-upload"
                        onDragOver={(e) => handleLegDragOver(leg.id, e)}
                        onDragLeave={handleLegDragLeave}
                        onDrop={(e) => handleLegDrop(leg.id, e)}
                        style={{
                          border: `1.5px dashed ${draggingLegId === leg.id ? BRAND_GREEN : '#d1d5db'}`,
                          borderRadius: '8px',
                          transition: 'border-color 0.2s ease',
                        }}
                      >
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
                              {draggingLegId === leg.id ? 'Drop image' : 'Upload or drop'}
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

      {/* Financials Section */}
      <div className="control-section">
        <div className="control-section-title">Financials</div>

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

        {isSingleMode || isSingleOldMode || isHorizontalMode ? (
          <>
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

            {/* Timestamp only for new single mode */}
            {isSingleMode && (
              <div className="control-group">
                <label htmlFor="bet-timestamp">Purchase Date/Time (Optional)</label>
                <input
                  id="bet-timestamp"
                  type="datetime-local"
                  className="text-input"
                  value={config.timestamp ?? ''}
                  onChange={(e) => onConfigChange({ timestamp: e.target.value })}
                />
                <p className="help-text">Leave blank to use current date/time</p>
              </div>
            )}
          </>
        ) : isParlayOldMode ? (
          <>
            <div className="control-group">
              <label htmlFor="parlay-odds-old">American Odds</label>
              <input
                id="parlay-odds-old"
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
              <label htmlFor="parlay-cash-out-old">Cash Out Amount ($)</label>
              <input
                id="parlay-cash-out-old"
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
        ) : null}
      </div>

      {/* Display Options Section */}
      <div className="control-section">
        <div className="control-section-title">Display Options</div>

        {/* Background color picker - only for new modes */}
        {!isSingleOldMode && !isParlayOldMode && (
          <div className="control-group">
            <label htmlFor="background-color">Background Color</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                id="background-color"
                type="color"
                value={config.backgroundColor}
                onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                className="color-input"
                style={{ width: '48px', height: '36px', cursor: 'pointer' }}
              />
              <input
                type="text"
                className="text-input"
                value={config.backgroundColor}
                onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                placeholder="#28CC95"
                style={{ flex: 1 }}
              />
            </div>
          </div>
        )}

        <div className="control-group">
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

        {(isSingleMode || isParlayMode) && (
          <div className="control-group">
            <label
              htmlFor="show-timestamp-bet"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <input
                id="show-timestamp-bet"
                type="checkbox"
                checked={config.showTimestamp}
                onChange={(e) => onConfigChange({ showTimestamp: e.target.checked })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: BRAND_GREEN,
                }}
              />
              <span>Show Date/Time</span>
            </label>
            <p className="help-text">Display purchase date and time</p>
          </div>
        )}

        <div className="control-group" style={{ marginBottom: 0 }}>
          <label
            htmlFor="show-cashed-out"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <input
              id="show-cashed-out"
              type="checkbox"
              checked={config.showCashedOut}
              onChange={(e) => onConfigChange({ showCashedOut: e.target.checked })}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: BRAND_GREEN,
              }}
            />
            <span>Show "Cashed out" Badge</span>
          </label>
          <p className="help-text">Display cashed out badge in corner</p>
        </div>
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
