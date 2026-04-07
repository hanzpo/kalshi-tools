import { ChangeEvent, useState, DragEvent } from 'react';
import { BannerConfig, BannerVariant } from '../../types';
import { Image as ImageIcon, Upload as UploadIcon, Download as DownloadIcon, Copy as CopyIcon, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import { ctrl } from '../../styles/controls';


interface BannerMakerProps {
  config: BannerConfig;
  onConfigChange: (config: Partial<BannerConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onBack: () => void;
}

export function BannerMaker({
  config,
  onConfigChange,
  onImageUpload,
  onExport,
  onCopyToClipboard,
  onBack,
}: BannerMakerProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      trackEvent('image_upload', {
        tool: 'banner',
        method: 'file_input',
        target: 'main',
      });
    }
  }

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
          tool: 'banner',
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
      <h1 className={ctrl.title}>Banner Maker</h1>
      <p className={ctrl.subtitle}>
        Create Kalshi-style shareable banners
      </p>

      {/* Style Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Style</div>
        <div className={ctrl.group}>
          <label>Layout</label>
          <div className={ctrl.segmented}>
            {([
              { value: 'classic', label: 'Classic' },
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'horizontal-dark', label: 'Horizontal Dark' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${ctrl.segmentedOption} ${config.variant === value ? ctrl.segmentedOptionActive : ''}`}
                onClick={() => onConfigChange({ variant: value as BannerVariant })}
                aria-pressed={config.variant === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Content</div>

        <div className={ctrl.group}>
          <label htmlFor="banner-image">Image (Optional)</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mb-1 flex min-h-[48px] cursor-pointer items-center justify-center rounded-[5px] border-[1.5px] border-dashed px-3 py-4 transition-[border-color,background-color] duration-150 ${isDragging ? 'border-brand bg-[#0d2e1f]' : 'border-[#444] bg-dark-surface'}`}
          >
            <input
              id="banner-image"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="banner-image"
              className={`flex cursor-pointer items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-[0.02em] ${isDragging ? 'text-brand' : 'text-text-muted'}`}
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
          <label htmlFor="card-width">Card Width</label>
          <div className={ctrl.sliderWrapper}>
            <input
              id="card-width"
              type="range"
              className="slider-input"
              value={config.cardWidth}
              onChange={(e) => onConfigChange({ cardWidth: Number(e.target.value) })}
              min="300"
              max="800"
              step="1"
            />
            <div className={ctrl.sliderValue}>{config.cardWidth}px</div>
          </div>
        </div>

        <div className={ctrl.group}>
          <label htmlFor="card-height">Card Height (0 = auto)</label>
          <div className={ctrl.sliderWrapper}>
            <input
              id="card-height"
              type="range"
              className="slider-input"
              value={config.cardHeight}
              onChange={(e) => onConfigChange({ cardHeight: Number(e.target.value) })}
              min="0"
              max="400"
              step="1"
            />
            <div className={ctrl.sliderValue}>{config.cardHeight === 0 ? 'auto' : `${config.cardHeight}px`}</div>
          </div>
        </div>

        <div className={ctrl.group}>
          <label htmlFor="card-border-radius">Card Border Radius</label>
          <div className={ctrl.sliderWrapper}>
            <input
              id="card-border-radius"
              type="range"
              className="slider-input"
              value={config.cardBorderRadius}
              onChange={(e) => onConfigChange({ cardBorderRadius: Number(e.target.value) })}
              min="0"
              max="48"
              step="1"
            />
            <div className={ctrl.sliderValue}>{config.cardBorderRadius}px</div>
          </div>
        </div>

        <div className={ctrl.group}>
          <label htmlFor="banner-title">Question</label>
          <input
            id="banner-title"
            type="text"
            className={ctrl.input}
            placeholder="e.g., Will Rod Wave score 20+ points?"
            value={config.title}
            onChange={(e) => onConfigChange({ title: e.target.value })}
          />
        </div>

        <div className={ctrl.group}>
          <label htmlFor="banner-outcome">Outcome</label>
          <input
            id="banner-outcome"
            type="text"
            className={ctrl.input}
            placeholder="e.g., Over 20.5"
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
      </div>

      {/* Price Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Price</div>

        <div className={ctrl.group}>
          <label htmlFor="banner-odds">Odds (%)</label>
          <div className={ctrl.sliderWrapper}>
            <input
              id="banner-odds"
              type="range"
              className="slider-input"
              value={config.odds}
              onChange={(e) => onConfigChange({ odds: Number(e.target.value) })}
              min="1"
              max="99"
              step="1"
            />
            <div className={ctrl.sliderValue}>{config.odds}%</div>
          </div>
        </div>

        <div className={ctrl.group}>
          <label>Trend</label>
          <div className={ctrl.colorToggle}>
            {(['up', 'down'] as const).map((dir) => {
              const isActive = config.trendDirection === dir;
              const color = dir === 'up' ? '#0f9b6c' : '#d91616';
              return (
                <button
                  key={dir}
                  type="button"
                  className={`${ctrl.colorOption} ${isActive ? 'font-semibold' : 'font-medium'}`}
                  style={isActive ? { borderColor: color, backgroundColor: `${color}20`, color } : { color }}
                  onClick={() => onConfigChange({ trendDirection: dir })}
                  aria-pressed={isActive}
                >
                  {dir === 'up' ? 'Up' : 'Down'}
                </button>
              );
            })}
          </div>
        </div>

        <div className={ctrl.group}>
          <label htmlFor="banner-change">Change</label>
          <input
            id="banner-change"
            type="text"
            className={ctrl.input}
            placeholder="e.g., 1"
            value={config.change}
            onChange={(e) => onConfigChange({ change: e.target.value })}
          />
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
