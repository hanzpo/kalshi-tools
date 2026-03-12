import { ChangeEvent, useState, DragEvent } from 'react';
import { MarketPageConfig, MarketOutcome } from '../../types/market-page';
import {
  UploadIcon,
  DownloadIcon,
  CopyIcon,
  ArrowLeftIcon
} from '../../components/ui/Icons';
import { trackEvent } from '../../lib/analytics';
import { ctrl } from '../../styles/controls';

interface MarketPageMakerProps {
  config: MarketPageConfig;
  onConfigChange: (config: Partial<MarketPageConfig>) => void;
  onImageUpload: (file: File) => void;
  onOutcomeImageUpload: (outcomeId: string, file: File) => void;
  onProfileImageUpload: (file: File) => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onBack: () => void;
  onDrawOutcomeTrend: (outcomeId: string) => void;
  onRegenerateData: () => void;
}

const OUTCOME_COLORS = ['#09C285', '#265CFF', '#000000', '#FF5A5A', '#9333EA', '#F59E0B'];

function createOutcome(index: number): MarketOutcome {
  return {
    id: `outcome-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    subtitle: '',
    image: null,
    yesPrice: 50,
    noPrice: 50,
    volume: 10000,
    change: 0,
    color: OUTCOME_COLORS[index % OUTCOME_COLORS.length],
    customTrendData: null,
  };
}

export function MarketPageMaker({
  config,
  onConfigChange,
  onImageUpload,
  onOutcomeImageUpload,
  onProfileImageUpload,
  onExport,
  onCopyToClipboard,
  onBack,
  onDrawOutcomeTrend,
  onRegenerateData,
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
    const newOutcome = createOutcome(config.outcomes.length);
    onConfigChange({ outcomes: [...config.outcomes, newOutcome] });
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
    <div className={ctrl.panel}>
      <button className={ctrl.backBtn} onClick={onBack}>
        <ArrowLeftIcon />
        Back
      </button>
      <h2 className={ctrl.title}>Market Page</h2>
      <p className={ctrl.subtitle}>
        Create a pixel-perfect Kalshi market page with customizable outcomes, chart, and rules.
      </p>

      {/* Market Info Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Market Info</div>

        <div className={ctrl.group}>
          <label>Category</label>
          <input
            type="text"
            className={ctrl.input}
            placeholder="e.g., Politics, Sports, Mentions"
            value={config.category}
            onChange={(e) => onConfigChange({ category: e.target.value })}
          />
        </div>

        <div className={ctrl.group}>
          <label>Subcategory</label>
          <input
            type="text"
            className={ctrl.input}
            placeholder="e.g., US Elections, NFL, Fox News"
            value={config.subcategory}
            onChange={(e) => onConfigChange({ subcategory: e.target.value })}
          />
        </div>

        <div className={ctrl.group}>
          <label>Title</label>
          <input
            type="text"
            className={ctrl.input}
            placeholder="e.g., What will Mark Rutte say during his Fox News Interview?"
            value={config.title}
            onChange={(e) => onConfigChange({ title: e.target.value })}
          />
        </div>

        <div className={ctrl.group}>
          <label>Image</label>
          <div
            className={ctrl.comboImagePlaceholder}
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
                  className={ctrl.comboImageClear}
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

      {/* Event Status Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Event Status</div>

        <div className={ctrl.group}>
          <label>Status</label>
          <div className={ctrl.segmented}>
            {(['upcoming', 'live', 'closed'] as const).map((status) => (
              <button
                key={status}
                className={`${ctrl.segmentedOption} ${config.eventStatus === status ? ctrl.segmentedOptionActive : ''}`}
                onClick={() => onConfigChange({ eventStatus: status })}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={ctrl.group}>
          <label>Countdown Text</label>
          <input
            type="text"
            className={ctrl.input}
            placeholder="e.g., Begins in 28m 40s"
            value={config.countdownText}
            onChange={(e) => onConfigChange({ countdownText: e.target.value })}
          />
        </div>

        <div className={ctrl.group}>
          <label>Event Date</label>
          <input
            type="text"
            className={ctrl.input}
            placeholder="e.g., Jan 21, 6:00pm EST"
            value={config.eventDate}
            onChange={(e) => onConfigChange({ eventDate: e.target.value })}
          />
        </div>

        <div className={ctrl.group}>
          <label>Payout Amount (optional)</label>
          <input
            type="text"
            className={ctrl.input}
            placeholder="e.g., +$5"
            value={config.payoutAmount}
            onChange={(e) => onConfigChange({ payoutAmount: e.target.value })}
          />
        </div>
      </div>

      {/* Outcomes Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Outcomes</div>

        <div className={ctrl.comboLegs}>
          {config.outcomes.map((outcome, index) => (
            <div key={outcome.id} className={ctrl.comboLeg}>
              <div className={ctrl.comboLegHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={outcome.color}
                    onChange={(e) => handleOutcomeChange(outcome.id, { color: e.target.value })}
                    style={{ width: '24px', height: '24px', padding: 0, border: 'none', cursor: 'pointer' }}
                  />
                  <span className={ctrl.comboLegTitle}>Outcome {index + 1}</span>
                </div>
                <button
                  className={ctrl.comboLegRemove}
                  onClick={() => handleRemoveOutcome(outcome.id)}
                  disabled={config.outcomes.length <= 1}
                >
                  Remove
                </button>
              </div>
              <div className={ctrl.comboLegBody}>
                <div className={ctrl.comboLegControl} style={{ flex: '1 1 100%' }}>
                  <label className={ctrl.comboLegLabel}>Name</label>
                  <input
                    type="text"
                    className={ctrl.input}
                    placeholder="e.g., J.D. Vance, Gavin Newsom"
                    value={outcome.name}
                    onChange={(e) => handleOutcomeChange(outcome.id, { name: e.target.value })}
                  />
                </div>
                <div className={ctrl.comboLegControl} style={{ flex: '1 1 100%' }}>
                  <label className={ctrl.comboLegLabel}>Subtitle (optional)</label>
                  <input
                    type="text"
                    className={ctrl.input}
                    placeholder="e.g., Republican, Democratic"
                    value={outcome.subtitle}
                    onChange={(e) => handleOutcomeChange(outcome.id, { subtitle: e.target.value })}
                  />
                </div>
                <div className={ctrl.comboLegControl} style={{ flex: '1 1 100%' }}>
                  <label className={ctrl.comboLegLabel}>Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {outcome.image ? (
                      <>
                        <img
                          src={outcome.image}
                          alt={outcome.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                          className={ctrl.comboImageClear}
                          onClick={() => handleOutcomeChange(outcome.id, { image: null })}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          background: '#252525',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: '#6b7280',
                        }}
                      >
                        <UploadIcon />
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onOutcomeImageUpload(outcome.id, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className={ctrl.comboLegControls}>
                  <div className={ctrl.comboLegControl}>
                    <label className={ctrl.comboLegLabel}>Yes Price (¢)</label>
                    <input
                      type="number"
                      className={ctrl.input}
                      value={outcome.yesPrice}
                      min={1}
                      max={99}
                      onChange={(e) => handleYesPriceChange(outcome.id, Number(e.target.value))}
                    />
                  </div>
                  <div className={ctrl.comboLegControl}>
                    <label className={ctrl.comboLegLabel}>No Price (¢)</label>
                    <input
                      type="number"
                      className={ctrl.input}
                      value={outcome.noPrice}
                      disabled
                      style={{ backgroundColor: '#252525' }}
                    />
                  </div>
                </div>
                <div className={ctrl.comboLegControls}>
                  <div className={ctrl.comboLegControl}>
                    <label className={ctrl.comboLegLabel}>Change</label>
                    <input
                      type="number"
                      className={ctrl.input}
                      value={outcome.change}
                      onChange={(e) => handleOutcomeChange(outcome.id, { change: Number(e.target.value) })}
                    />
                  </div>
                  <div className={ctrl.comboLegControl}>
                    <label className={ctrl.comboLegLabel}>Volume ($)</label>
                    <input
                      type="number"
                      className={ctrl.input}
                      value={outcome.volume}
                      min={0}
                      onChange={(e) => handleOutcomeChange(outcome.id, { volume: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <button
                  className={ctrl.btnDraw}
                  onClick={() => onDrawOutcomeTrend(outcome.id)}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                  </svg>
                  Draw Trend {outcome.customTrendData ? '(Custom)' : ''}
                </button>
              </div>
            </div>
          ))}

          <button className={ctrl.comboLegAdd} onClick={handleAddOutcome}>
            + Add Outcome
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Chart</div>

        <div className={ctrl.group}>
          <label>Volume</label>
          <input
            type="text"
            className={ctrl.input}
            placeholder="e.g., $5.9M"
            value={config.volume}
            onChange={(e) => onConfigChange({ volume: e.target.value })}
          />
        </div>

        <div className={ctrl.group}>
          <label>Time Range</label>
          <div className={ctrl.segmented}>
            {(['1D', '1W', '1M', 'ALL'] as const).map((range) => (
              <button
                key={range}
                className={`${ctrl.segmentedOption} ${config.chartTimeRange === range ? ctrl.segmentedOptionActive : ''}`}
                onClick={() => onConfigChange({ chartTimeRange: range })}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <button className={ctrl.btnRegen} onClick={onRegenerateData} style={{ width: '100%' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Regenerate All Trends
        </button>
        <p className={ctrl.helpText}>
          Use the "Draw Trend" button on each outcome above to customize individual chart lines.
        </p>
      </div>

      {/* User Profile Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>User Profile</div>

        <div className={ctrl.group}>
          <label>Profile Picture</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {config.profileImage ? (
              <>
                <img
                  src={config.profileImage}
                  alt="Profile"
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                />
                <button
                  className={ctrl.comboImageClear}
                  onClick={() => onConfigChange({ profileImage: null })}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  Remove
                </button>
              </>
            ) : (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: '#252525',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#6b7280',
                }}
              >
                <UploadIcon />
                Upload profile picture
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onProfileImageUpload(file);
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <div className={ctrl.group}>
          <label>Portfolio Balance</label>
          <input
            type="text"
            className={ctrl.input}
            placeholder="e.g., $1,250.00"
            value={config.portfolioBalance}
            onChange={(e) => onConfigChange({ portfolioBalance: e.target.value })}
          />
        </div>
      </div>

      {/* Display Options */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Display Options</div>

        <div className={ctrl.group}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', color: '#d1d5db' }}>
            <input
              type="checkbox"
              checked={config.darkMode === true}
              onChange={(e) => onConfigChange({ darkMode: e.target.checked })}
            />
            Dark mode
          </label>
        </div>

        <div className={ctrl.group}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', color: '#d1d5db' }}>
            <input
              type="checkbox"
              checked={config.showWatermark}
              onChange={(e) => onConfigChange({ showWatermark: e.target.checked })}
            />
            Show watermark
          </label>
        </div>

        <div className={ctrl.group}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', color: '#d1d5db' }}>
            <input
              type="checkbox"
              checked={config.showRules}
              onChange={(e) => onConfigChange({ showRules: e.target.checked })}
            />
            Show rules section
          </label>
        </div>

        {config.showRules && (
          <div className={ctrl.group}>
            <label>Rules Text</label>
            <textarea
              className={ctrl.input}
              placeholder="Enter market rules..."
              value={config.rulesText}
              onChange={(e) => onConfigChange({ rulesText: e.target.value })}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>
        )}

        <div className={ctrl.group}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', color: '#d1d5db' }}>
            <input
              type="checkbox"
              checked={config.showRelatedMarkets}
              onChange={(e) => onConfigChange({ showRelatedMarkets: e.target.checked })}
            />
            Show "People are also buying" section
          </label>
        </div>

        <div className={ctrl.group}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', color: '#d1d5db' }}>
            <input
              type="checkbox"
              checked={config.showReviewPage}
              onChange={(e) => onConfigChange({ showReviewPage: e.target.checked })}
            />
            Show review step before submit
          </label>
        </div>
      </div>

      {/* Export Buttons */}
      <div className={ctrl.footer}>
        <button className={ctrl.btnExport} onClick={onExport}>
          <DownloadIcon />
          Export as PNG
        </button>
        <button className={ctrl.btnRegen} onClick={onCopyToClipboard}>
          <CopyIcon />
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
