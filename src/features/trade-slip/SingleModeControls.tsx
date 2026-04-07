import { ChangeEvent, useCallback } from 'react';
import { TradeSlipConfig } from '../../types';
import { Image as ImageIcon, Upload as UploadIcon } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import { useImageUpload } from '../../hooks/useImageUpload';
import { ctrl } from '../../styles/controls';

interface SingleModeControlsProps {
  config: TradeSlipConfig;
  onConfigChange: (config: Partial<TradeSlipConfig>) => void;
  onImageUpload: (file: File) => void;
}

export function SingleModeControls({ config, onConfigChange, onImageUpload }: SingleModeControlsProps) {
  const isSingleMode = config.mode === 'single';
  const isChampionshipMode = config.mode === 'championship';
  const isSingleOldMode = config.mode === 'single-old';
  const isHorizontalMode = config.mode === 'horizontal';

  const handleImageSelect = useCallback((file: File) => {
    onImageUpload(file);
    trackEvent('image_upload', {
      tool: 'trade-slip',
      mode: config.mode,
      method: 'drop',
      target: 'main',
    });
  }, [onImageUpload, config.mode]);

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useImageUpload({
    onImageSelect: handleImageSelect,
  });

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

  if (isSingleMode || isChampionshipMode) {
    return (
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
    );
  }

  if (isSingleOldMode) {
    return (
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


        </div>
      </div>
    );
  }

  if (isHorizontalMode) {
    return (
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
    );
  }

  return null;
}
