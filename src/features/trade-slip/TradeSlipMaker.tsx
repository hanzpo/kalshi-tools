import { ChangeEvent, useState, DragEvent } from 'react';
import { TradeSlipConfig, TradeSlipMode, ComboCategory, ComboEvent, ComboMarket, ComboLeg } from '../../types';
import {
  ImageIcon,
  UploadIcon,
  DownloadIcon,
  CopyIcon,
  ArrowLeftIcon
} from '../../components/ui/Icons';
import { trackEvent } from '../../lib/analytics';
import { calculateSinglePayout, calculateAmericanPayout } from '../../lib/payoutHelpers';
import { ctrl } from '../../styles/controls';

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

function createLeg(): ComboLeg {
  return {
    id: `leg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: '',
    answer: 'Yes',
    image: null,
  };
}



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
  const isComboMode = config.mode === 'combo';
  const isSingleOldMode = config.mode === 'single-old';
  const isComboOldMode = config.mode === 'combo-old';
  const isHorizontalMode = config.mode === 'horizontal';
  const isChampionshipMode = config.mode === 'championship';
  const payout = isSingleMode || isSingleOldMode || isHorizontalMode || isChampionshipMode
    ? calculateSinglePayout(config.wager, config.odds)
    : calculateAmericanPayout(config.wager, config.comboOdds);

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

  // Old combo leg handlers
  function handleLegChange(legId: string, updates: Partial<ComboLeg>) {
    const updatedLegs = config.comboLegs.map((leg) =>
      leg.id === legId ? { ...leg, ...updates } : leg
    );
    onConfigChange({ comboLegs: updatedLegs });
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
    onConfigChange({ comboLegs: [...config.comboLegs, createLeg()] });
  }

  function handleRemoveLeg(legId: string) {
    if (config.comboLegs.length <= 1) return;
    onConfigChange({
      comboLegs: config.comboLegs.filter((leg) => leg.id !== legId),
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
              target: 'combo-leg',
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
    if (!isSingleMode && !isSingleOldMode && !isHorizontalMode && !isChampionshipMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode && !isSingleOldMode && !isHorizontalMode && !isChampionshipMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode && !isSingleOldMode && !isHorizontalMode && !isChampionshipMode) return;
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

      {isSingleMode || isChampionshipMode ? (
        <>
          {/* Content Section */}
          <div className={ctrl.section}>
            <div className={ctrl.sectionTitle}>Content</div>

            <div className={ctrl.group}>
              <label htmlFor="bet-image">Image (Optional)</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-[5px] px-3 py-4 flex items-center justify-center min-h-12 border-[1.5px] border-dashed transition-[border-color,background-color] duration-150 cursor-pointer mb-1 ${isDragging ? 'border-brand bg-[#0d2e1f]' : 'border-[#444] bg-dark-surface'}`}
              >
                <input
                  id="bet-image"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className={`${ctrl.fileInput} hidden`}
                />
                <label
                  htmlFor="bet-image"
                  className={`cursor-pointer flex items-center justify-center gap-2 font-medium text-[13px] uppercase tracking-[0.02em] ${isDragging ? 'text-brand' : 'text-text-muted'}`}
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
              <p className={ctrl.helpText}>Supports JPG, PNG formats. Or press Ctrl+V to paste.</p>
            </div>

            <div className={ctrl.group}>
              <label htmlFor="bet-market-name">Market Name</label>
              <input
                id="bet-market-name"
                type="text"
                className={ctrl.input}
                placeholder="e.g., Bitcoin price today at 6pm EDT?"
                value={config.marketName}
                onChange={(e) => onConfigChange({ marketName: e.target.value })}
              />
            </div>

            <div className={ctrl.group}>
              <label htmlFor="bet-outcome">Outcome</label>
              <input
                id="bet-outcome"
                type="text"
                className={ctrl.input}
                placeholder="e.g., $111,000 or above"
                value={config.outcome}
                onChange={(e) => onConfigChange({ outcome: e.target.value })}
              />
            </div>

            <div className={ctrl.group}>
              <label>Trade Side</label>
              <div className={ctrl.colorToggle}>
                {(['Yes', 'No', 'Custom'] as const).map((side) => {
                  const isActive = config.tradeSide === side;
                  const color = side === 'Yes' ? '#0f9b6c' : side === 'No' ? '#d91616' : '#666';
                  return (
                    <button
                      key={side}
                      type="button"
                      className={`${ctrl.colorOption} ${isActive ? 'font-semibold' : 'font-medium'}`}
                      style={isActive ? { borderColor: color, backgroundColor: `${color}20`, color } : { color }}
                      onClick={() => onConfigChange({ tradeSide: side })}
                      aria-pressed={isActive}
                    >
                      {side}
                    </button>
                  );
                })}
              </div>
            </div>

            {config.tradeSide === 'Custom' && (
              <>
                <div className={ctrl.group}>
                  <label htmlFor="custom-side-color">Custom Side Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="custom-side-color"
                      type="color"
                      value={config.customSideColor || '#0f9b6c'}
                      onChange={(e) => onConfigChange({ customSideColor: e.target.value })}
                      className={`${ctrl.colorInput} w-12 h-9 cursor-pointer`}
                    />
                    <input
                      type="text"
                      className={`${ctrl.input} flex-1`}
                      value={config.customSideColor || '#0f9b6c'}
                      onChange={(e) => onConfigChange({ customSideColor: e.target.value })}
                      placeholder="#0f9b6c"
                    />
                  </div>
                </div>
                <div className={ctrl.group}>
                  <label htmlFor="custom-side-text">Custom Side Text</label>
                  <input
                    id="custom-side-text"
                    type="text"
                    className={ctrl.input}
                    placeholder="e.g., Maybe"
                    value={config.customSideText || ''}
                    onChange={(e) => onConfigChange({ customSideText: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </>
      ) : isComboMode ? (
        <>
          {/* Financials Section */}
          <div className={ctrl.section}>
            <div className={ctrl.sectionTitle}>Financials</div>

            <div className={ctrl.group}>
              <label htmlFor="combo-payout">Payout Amount ($)</label>
              <input
                id="combo-payout"
                type="number"
                className={ctrl.input}
                placeholder="e.g., 1920"
                value={config.comboPayout || ''}
                onChange={(e) => onConfigChange({ comboPayout: parseFloat(e.target.value) || 0 })}
                min="0"
                step="1"
              />
            </div>
            <div className={ctrl.group}>
              <label htmlFor="combo-cost">Cost ($)</label>
              <input
                id="combo-cost"
                type="number"
                className={ctrl.input}
                placeholder="e.g., 99.84"
                value={config.comboCost || ''}
                onChange={(e) => onConfigChange({ comboCost: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
            <div className={ctrl.group}>
              <label htmlFor="combo-timestamp">Purchase Date/Time (Optional)</label>
              <input
                id="combo-timestamp"
                type="datetime-local"
                className={ctrl.input}
                value={config.timestamp ?? ''}
                onChange={(e) => onConfigChange({ timestamp: e.target.value })}
              />
              <p className={ctrl.helpText}>Leave blank to use current date/time</p>
            </div>
          </div>
        </>
      ) : isSingleOldMode ? (
        <>
          {/* Content Section */}
          <div className={ctrl.section}>
            <div className={ctrl.sectionTitle}>Content</div>

            <div className={ctrl.group}>
              <label htmlFor="bet-market-name-old">Market Name</label>
              <input
                id="bet-market-name-old"
                type="text"
                className={ctrl.input}
                placeholder="e.g., Bitcoin price today at 6pm EDT?"
                value={config.marketName}
                onChange={(e) => onConfigChange({ marketName: e.target.value })}
              />
            </div>

            <div className={ctrl.group}>
              <label htmlFor="bet-outcome-old">Outcome</label>
              <input
                id="bet-outcome-old"
                type="text"
                className={ctrl.input}
                placeholder="e.g., $111,000 or above"
                value={config.outcome}
                onChange={(e) => onConfigChange({ outcome: e.target.value })}
              />
            </div>

            <div className={ctrl.group}>
              <label>Trade Side</label>
              <div className={ctrl.colorToggle}>
                {(['Yes', 'No'] as const).map((side) => {
                  const isActive = config.tradeSide === side;
                  const color = side === 'Yes' ? '#0f9b6c' : '#d91616';
                  return (
                    <button
                      key={side}
                      type="button"
                      className={`${ctrl.colorOption} ${isActive ? 'font-semibold' : 'font-medium'}`}
                      style={isActive ? { borderColor: color, backgroundColor: `${color}20`, color } : { color }}
                      onClick={() => onConfigChange({ tradeSide: side })}
                      aria-pressed={isActive}
                    >
                      {side}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={ctrl.group}>
              <label htmlFor="bet-image-old">Image (Optional)</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-[5px] px-3 py-4 flex items-center justify-center min-h-12 border-[1.5px] border-dashed transition-[border-color,background-color] duration-150 cursor-pointer mb-1 ${isDragging ? 'border-brand bg-[#0d2e1f]' : 'border-[#444] bg-dark-surface'}`}
              >
                <input
                  id="bet-image-old"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className={`${ctrl.fileInput} hidden`}
                />
                <label
                  htmlFor="bet-image-old"
                  className={`cursor-pointer flex items-center justify-center gap-2 font-medium text-[13px] uppercase tracking-[0.02em] ${isDragging ? 'text-brand' : 'text-text-muted'}`}
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
              <p className={ctrl.helpText}>Supports JPG, PNG formats. Or press Ctrl+V to paste.</p>
            </div>
          </div>
        </>
      ) : isComboOldMode ? (
        <div className={ctrl.section}>
          <div className={ctrl.sectionTitle}>Content</div>
          <div className={ctrl.group}>
            <label htmlFor="bet-title-old">Slip Title</label>
            <input
              id="bet-title-old"
              type="text"
              className={ctrl.input}
              placeholder="e.g., Sunday Night Combo"
              value={config.title}
              onChange={(e) => onConfigChange({ title: e.target.value })}
            />
          </div>
        </div>
      ) : isHorizontalMode ? (
        <>
          {/* Content Section for Horizontal */}
          <div className={ctrl.section}>
            <div className={ctrl.sectionTitle}>Content</div>

            <div className={ctrl.group}>
              <label htmlFor="bet-image-horizontal">Background Image</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-[5px] px-3 py-4 flex items-center justify-center min-h-12 border-[1.5px] border-dashed transition-[border-color,background-color] duration-150 cursor-pointer mb-1 ${isDragging ? 'border-brand bg-[#0d2e1f]' : 'border-[#444] bg-dark-surface'}`}
              >
                <input
                  id="bet-image-horizontal"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className={`${ctrl.fileInput} hidden`}
                />
                <label
                  htmlFor="bet-image-horizontal"
                  className={`cursor-pointer flex items-center justify-center gap-2 font-medium text-[13px] uppercase tracking-[0.02em] ${isDragging ? 'text-brand' : 'text-text-muted'}`}
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
              <p className={ctrl.helpText}>Supports JPG, PNG formats. Or press Ctrl+V to paste.</p>
            </div>

            <div className={ctrl.group}>
              <label htmlFor="bet-market-name-horizontal">Market Question</label>
              <input
                id="bet-market-name-horizontal"
                type="text"
                className={ctrl.input}
                placeholder="e.g., Will Donald Trump win the 2024 election?"
                value={config.marketName}
                onChange={(e) => onConfigChange({ marketName: e.target.value })}
              />
            </div>

            <div className={ctrl.group}>
              <label>Trade Side</label>
              <div className={ctrl.colorToggle}>
                {(['Yes', 'No'] as const).map((side) => {
                  const isActive = config.tradeSide === side;
                  const color = side === 'Yes' ? '#0f9b6c' : '#d91616';
                  return (
                    <button
                      key={side}
                      type="button"
                      className={`${ctrl.colorOption} ${isActive ? 'font-semibold' : 'font-medium'}`}
                      style={isActive ? { borderColor: color, backgroundColor: `${color}20`, color } : { color }}
                      onClick={() => onConfigChange({ tradeSide: side })}
                      aria-pressed={isActive}
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

      {isComboMode && (
        <div className={ctrl.group}>
          <label aria-hidden="true">Categories &amp; Markets</label>
          <div className={ctrl.comboLegs}>
            {config.comboCategories?.map((category, catIndex) => (
              <div key={category.id} className={`${ctrl.comboLeg} bg-dark-elevated`}>
                <div className={ctrl.comboLegHeader}>
                  <span className={ctrl.comboLegTitle}>Category {catIndex + 1}</span>
                  <button
                    type="button"
                    className={ctrl.comboLegRemove}
                    onClick={() => handleRemoveCategory(category.id)}
                    disabled={config.comboCategories.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className={ctrl.comboLegBody}>
                  <label className={ctrl.comboLegLabel} htmlFor={`category-name-${category.id}`}>
                    Category Name
                  </label>
                  <input
                    id={`category-name-${category.id}`}
                    type="text"
                    className={ctrl.input}
                    placeholder="e.g., Pro Football"
                    value={category.name}
                    onChange={(e) => handleCategoryChange(category.id, { name: e.target.value })}
                  />

                  {/* Events within category */}
                  <div className="mt-3 flex flex-col gap-3 border-l-2 border-dark-border-light pl-3">
                    {category.events.map((event, eventIndex) => (
                      <div key={event.id} className="flex flex-col gap-2 rounded-[6px] border border-dark-border-light bg-dark-surface p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-secondary">Event {eventIndex + 1}</span>
                          <button
                            type="button"
                            className={ctrl.comboLegRemove}
                            onClick={() => handleRemoveEvent(category.id, event.id)}
                            disabled={category.events.length <= 1}
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          className={ctrl.input}
                          placeholder="e.g., Kansas City @ Philadelphia"
                          value={event.name}
                          onChange={(e) => handleEventChange(category.id, event.id, { name: e.target.value })}
                        />

                        {/* Team colors */}
                        <div className="mt-2 flex gap-3">
                          <div className="flex items-center gap-1.5 [&_label]:mb-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:text-text-secondary">
                            <label>Color 1</label>
                            <input
                              type="color"
                              value={event.color1 || '#E31837'}
                              onChange={(e) => handleEventChange(category.id, event.id, { color1: e.target.value })}
                              className={ctrl.colorInput}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 [&_label]:mb-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:text-text-secondary">
                            <label>Color 2</label>
                            <input
                              type="color"
                              value={event.color2 || '#004C54'}
                              onChange={(e) => handleEventChange(category.id, event.id, { color2: e.target.value })}
                              className={ctrl.colorInput}
                            />
                          </div>
                        </div>

                        {/* Markets within event */}
                        <div className="mt-2 flex flex-col gap-2 border-l-2 border-dark-border pl-2.5">
                          {event.markets.map((market, marketIndex) => (
                            <div key={market.id} className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium uppercase tracking-[0.04em] text-text-secondary">Market {marketIndex + 1}</span>
                                <button
                                  type="button"
                                  className={ctrl.comboLegRemove}
                                  onClick={() => handleRemoveMarket(category.id, event.id, market.id)}
                                  disabled={event.markets.length <= 1}
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Prefix (e.g., No)"
                                  value={market.prefix || ''}
                                  onChange={(e) => handleMarketChange(category.id, event.id, market.id, { prefix: e.target.value || undefined })}
                                  className={`${ctrl.input} w-20 shrink-0`}
                                />
                                <input
                                  type="text"
                                  className={`${ctrl.input} flex-1`}
                                  placeholder="Market text (e.g., Philadelphia)"
                                  value={market.text}
                                  onChange={(e) => handleMarketChange(category.id, event.id, market.id, { text: e.target.value })}
                                />
                                <label
                                  title="Resolved"
                                  className="flex items-center cursor-pointer shrink-0"
                                >
                                  <input
                                    type="checkbox"
                                    checked={market.resolved || false}
                                    onChange={(e) => handleMarketChange(category.id, event.id, market.id, { resolved: e.target.checked })}
                                    className="size-4 cursor-pointer accent-[#09C285]"
                                  />
                                </label>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            className={ctrl.comboLegAdd}
                            onClick={() => handleAddMarket(category.id, event.id)}
                          >
                            + Add Market
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={ctrl.comboLegAdd}
                      onClick={() => handleAddEvent(category.id)}
                    >
                      + Add Event
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className={ctrl.comboLegAdd} onClick={handleAddCategory}>
              + Add Category
            </button>
          </div>
        </div>
      )}

      {isComboOldMode && (
        <div className={ctrl.group}>
          <label aria-hidden="true">Combo Legs</label>
          <div className={ctrl.comboLegs}>
            {config.comboLegs.map((leg, index) => (
              <div key={leg.id} className={ctrl.comboLeg}>
                <div className={ctrl.comboLegHeader}>
                  <span className={ctrl.comboLegTitle}>Leg {index + 1}</span>
                  <button
                    type="button"
                    className={ctrl.comboLegRemove}
                    onClick={() => handleRemoveLeg(leg.id)}
                    disabled={config.comboLegs.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className={ctrl.comboLegBody}>
                  <label className={ctrl.comboLegLabel} htmlFor={`combo-question-${leg.id}`}>
                    Question
                  </label>
                  <input
                    id={`combo-question-${leg.id}`}
                    type="text"
                    className={ctrl.input}
                    placeholder="e.g., New York Giants to win?"
                    value={leg.question}
                    onChange={(e) => handleLegChange(leg.id, { question: e.target.value })}
                  />
                  <div className={ctrl.comboLegControls}>
                    <div className={ctrl.comboLegControl}>
                      <span className={ctrl.comboLegLabel}>Answer</span>
                      <div className={`${ctrl.segmented} p-0.5`}>
                        {(['Yes', 'No'] as ComboLeg['answer'][]).map((answer) => (
                          <button
                            key={answer}
                            type="button"
                            className={`${ctrl.segmentedOption}${leg.answer === answer ? ` ${ctrl.segmentedOptionActive}` : ''}`}
                            onClick={() => handleLegChange(leg.id, { answer })}
                            aria-pressed={leg.answer === answer}
                          >
                            {answer}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={ctrl.comboLegControl}>
                      <span className={ctrl.comboLegLabel}>Image</span>
                      <div
                        onDragOver={(e) => handleLegDragOver(leg.id, e)}
                        onDragLeave={handleLegDragLeave}
                        onDrop={(e) => handleLegDrop(leg.id, e)}
                        className={`${ctrl.comboImageUpload} rounded-lg border-[1.5px] border-dashed transition-[border-color] duration-200 ${draggingLegId === leg.id ? 'border-brand' : 'border-[#444]'}`}
                      >
                        {leg.image ? (
                          <>
                            <img src={leg.image} alt="" className={ctrl.comboLegImage} />
                            <button
                              type="button"
                              className={ctrl.comboImageClear}
                              onClick={() => handleLegChange(leg.id, { image: null })}
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <label htmlFor={`combo-image-${leg.id}`} className={ctrl.comboImagePlaceholder}>
                              {draggingLegId === leg.id ? 'Drop image' : 'Upload or drop'}
                            </label>
                            <input
                              id={`combo-image-${leg.id}`}
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) => handleLegImageInput(leg.id, e)}
                              className={`${ctrl.fileInput} hidden`}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className={ctrl.comboLegAdd} onClick={handleAddLeg}>
              + Add Leg
            </button>
          </div>
        </div>
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
              <div className={ctrl.sliderWrapper}>
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
                <div className={ctrl.sliderValue}>{config.odds}% chance</div>
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
                <p className={ctrl.helpText}>Leave blank to use current date/time</p>
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
              <p className={ctrl.helpText}>
                Enter positive or negative odds (e.g., -110 or +250). Potential payout: ${payout.toLocaleString()}
              </p>
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
              <p className={ctrl.helpText}>Optional: Current cash out value</p>
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
            <p className={ctrl.helpText}>Display purchase date and time on trade slip</p>
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
          <p className={ctrl.helpText}>Display watermark on trade slip</p>
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
          <p className={ctrl.helpText}>Display cashed out badge in corner</p>
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
          <p className={ctrl.helpText}>Show as a paid out trade slip</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
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
