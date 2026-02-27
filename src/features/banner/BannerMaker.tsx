import { ChangeEvent, useState, DragEvent } from 'react';
import { BannerConfig } from '../../types';
import {
  ImageIcon,
  UploadIcon,
  DownloadIcon,
  CopyIcon,
  ArrowLeftIcon,
} from '../../components/ui/Icons';
import { trackEvent } from '../../lib/analytics';
import '../chart/ControlPanel.css';

const BRAND_GREEN = '#09C285';

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
    <div className="control-panel">
      <button onClick={onBack} className="back-button-control-panel">
        <ArrowLeftIcon size={14} />
        Back
      </button>
      <h1 className="panel-title">Banner Maker</h1>
      <p className="panel-subtitle">
        Create Kalshi-style shareable banners
      </p>

      {/* Content Section */}
      <div className="control-section">
        <div className="control-section-title">Content</div>

        <div className="control-group">
          <label htmlFor="banner-image">Image (Optional)</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `1.5px dashed ${isDragging ? BRAND_GREEN : '#444'}`,
              borderRadius: '5px',
              padding: '16px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '48px',
              backgroundColor: isDragging ? '#0d2e1f' : '#1e1e1e',
              transition: 'border-color 0.15s, background-color 0.15s',
              cursor: 'pointer',
              marginBottom: '4px',
            }}
          >
            <input
              id="banner-image"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageChange}
              className="file-input"
              style={{ display: 'none' }}
            />
            <label
              htmlFor="banner-image"
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
                letterSpacing: '0.02em',
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
          <label htmlFor="banner-title">Question</label>
          <input
            id="banner-title"
            type="text"
            className="text-input"
            placeholder="e.g., Will Rod Wave score 20+ points?"
            value={config.title}
            onChange={(e) => onConfigChange({ title: e.target.value })}
          />
        </div>

        <div className="control-group">
          <label htmlFor="banner-outcome">Outcome</label>
          <input
            id="banner-outcome"
            type="text"
            className="text-input"
            placeholder="e.g., Over 20.5"
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
      </div>

      {/* Price Section */}
      <div className="control-section">
        <div className="control-section-title">Price</div>

        <div className="control-group">
          <label htmlFor="banner-odds">Odds (%)</label>
          <div className="slider-wrapper">
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
            <div className="slider-value">{config.odds}%</div>
          </div>
        </div>

        <div className="control-group">
          <label>Trend</label>
          <div className="segmented-control">
            {(['up', 'down'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                className={`segmented-option${config.trendDirection === dir ? ' active' : ''}`}
                onClick={() => onConfigChange({ trendDirection: dir })}
                aria-pressed={config.trendDirection === dir}
              >
                {dir === 'up' ? 'Up' : 'Down'}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="banner-rank">Rank</label>
          <input
            id="banner-rank"
            type="text"
            className="text-input"
            placeholder="e.g., 1"
            value={config.rank}
            onChange={(e) => onConfigChange({ rank: e.target.value })}
          />
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
