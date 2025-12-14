import { ChangeEvent, useState, DragEvent, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { MarketConfig, MarketType, Outcome, TimeHorizon } from '../types';
import { getOutcomeColor } from '../utils/colorGenerator';
import { 
  ImageIcon, 
  UploadIcon, 
  PencilIcon, 
  RefreshIcon, 
  DownloadIcon, 
  CopyIcon, 
  SettingsIcon, 
  ChevronDownIcon,
  CheckIcon,
  WarningIcon,
  ArrowLeftIcon
} from './ui/Icons';
import './ControlPanel.css';

interface ControlPanelProps {
  config: MarketConfig;
  onConfigChange: (config: Partial<MarketConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onRegenerateData: () => void;
  onOpenTrendDrawer: () => void;
  onCopyToClipboard: () => void;
  onBack?: () => void;
  mode?: 'chart' | 'search' | 'link-preview';
  // Link preview specific props
  leftImage?: string | null;
  onLeftImageUpload?: (file: File) => void;
}

export function ControlPanel({
  config,
  onConfigChange,
  onImageUpload,
  onExport,
  onRegenerateData,
  onOpenTrendDrawer,
  onCopyToClipboard,
  onBack,
  mode = 'chart',
  leftImage,
  onLeftImageUpload,
}: ControlPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close color picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setColorPickerOpen(null);
      }
    }

    if (colorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [colorPickerOpen]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
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
      }
    }
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = Array.from(event.clipboardData?.items ?? []);
      const imageItem = items.find((item) => item.type.startsWith('image/'));
      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      event.preventDefault();
      // For link-preview mode, paste goes to left image
      if (mode === 'link-preview' && onLeftImageUpload) {
        onLeftImageUpload(file);
      } else {
        onImageUpload(file);
      }
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageUpload, onLeftImageUpload, mode]);

  // Left image handlers for link-preview mode
  function handleLeftDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLeft(true);
  }

  function handleLeftDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLeft(false);
  }

  function handleLeftDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLeft(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0 && onLeftImageUpload) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onLeftImageUpload(file);
      }
    }
  }

  function handleLeftImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onLeftImageUpload) {
      onLeftImageUpload(file);
    }
  }

  function handleMarketTypeChange(marketType: MarketType) {
    if (marketType === 'multi' && config.outcomes.length === 0) {
      // Initialize with 2 default outcomes that sum to 100
      onConfigChange({
        marketType,
        outcomes: [
          { id: '1', name: 'Outcome 1', color: getOutcomeColor(0), currentOdds: 60, customTrendData: null },
          { id: '2', name: 'Outcome 2', color: getOutcomeColor(1), currentOdds: 40, customTrendData: null },
        ],
        mutuallyExclusive: true, // Default to mutually exclusive
      });
    } else if (marketType === 'forecast') {
      // Initialize forecast with default values if not set
      onConfigChange({
        marketType,
        forecastValue: config.forecastValue ?? 128000,
        forecastUnit: config.forecastUnit ?? 'K',
      });
    } else {
      onConfigChange({ marketType });
    }
  }

  function handleAddOutcome() {
    const isMutuallyExclusive = config.mutuallyExclusive !== false; // Default to true
    
    let allOutcomes: Outcome[];
    
    if (isMutuallyExclusive) {
      // Calculate fair distribution for new outcome
      const numOutcomes = config.outcomes.length + 1;
      const targetPerOutcome = Math.floor(100 / numOutcomes);
      
      // Redistribute odds among all outcomes including new one
      const updatedOutcomes = config.outcomes.map((outcome) => ({
        ...outcome,
        currentOdds: targetPerOutcome,
        customTrendData: null
      }));
      
      const newOutcome: Outcome = {
        id: String(config.outcomes.length + 1),
        name: `Outcome ${config.outcomes.length + 1}`,
        color: getOutcomeColor(config.outcomes.length),
        currentOdds: targetPerOutcome,
        customTrendData: null,
      };
      
      allOutcomes = [...updatedOutcomes, newOutcome];
      
      // Handle rounding to ensure sum is 100
      const currentSum = allOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
      if (currentSum !== 100 && allOutcomes.length > 0) {
        allOutcomes[0] = {
          ...allOutcomes[0],
          currentOdds: allOutcomes[0].currentOdds + (100 - currentSum)
        };
      }
    } else {
      // For non-mutually exclusive, just add a new outcome with default odds
      const newOutcome: Outcome = {
        id: String(config.outcomes.length + 1),
        name: `Outcome ${config.outcomes.length + 1}`,
        color: getOutcomeColor(config.outcomes.length),
        currentOdds: 50, // Default odds for new outcome
        customTrendData: null,
      };
      
      allOutcomes = [...config.outcomes, newOutcome];
    }
    
    onConfigChange({ outcomes: allOutcomes });
    onRegenerateData();
  }

  function handleRemoveOutcome(outcomeId: string) {
    if (config.outcomes.length > 2) {
      const filteredOutcomes = config.outcomes.filter(o => o.id !== outcomeId);
      const isMutuallyExclusive = config.mutuallyExclusive !== false; // Default to true
      
      if (isMutuallyExclusive) {
        // Redistribute odds proportionally among remaining outcomes
        const currentTotal = filteredOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
        
        if (currentTotal > 0) {
          const normalizedOutcomes = filteredOutcomes.map(outcome => ({
            ...outcome,
            currentOdds: Math.round((outcome.currentOdds / currentTotal) * 100),
            customTrendData: null
          }));
          
          // Handle rounding errors
          const currentSum = normalizedOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
          if (currentSum !== 100 && normalizedOutcomes.length > 0) {
            normalizedOutcomes[0] = {
              ...normalizedOutcomes[0],
              currentOdds: normalizedOutcomes[0].currentOdds + (100 - currentSum)
            };
          }
          
          onConfigChange({ outcomes: normalizedOutcomes });
        } else {
          // If all are 0, distribute evenly
          const perOutcome = Math.floor(100 / filteredOutcomes.length);
          const normalizedOutcomes = filteredOutcomes.map((outcome, i) => ({
            ...outcome,
            currentOdds: perOutcome + (i === 0 ? 100 - (perOutcome * filteredOutcomes.length) : 0),
            customTrendData: null
          }));
          onConfigChange({ outcomes: normalizedOutcomes });
        }
      } else {
        // For non-mutually exclusive, just remove the outcome without normalization
        onConfigChange({ outcomes: filteredOutcomes });
      }
      
      onRegenerateData();
    }
  }

  function handleOutcomeChange(outcomeId: string, updates: Partial<Outcome>) {
    const updatedOutcomes = config.outcomes.map(o =>
      o.id === outcomeId ? { ...o, ...updates } : o
    );
    onConfigChange({ outcomes: updatedOutcomes });
  }

  function handleOutcomeOddsChange(outcomeId: string, odds: number) {
    const updatedOutcomes = [...config.outcomes];
    const targetIndex = updatedOutcomes.findIndex(o => o.id === outcomeId);
    
    if (targetIndex === -1) return;
    
    const isMutuallyExclusive = config.mutuallyExclusive !== false; // Default to true
    
    // Set the new odds for the target outcome
    updatedOutcomes[targetIndex] = { 
      ...updatedOutcomes[targetIndex], 
      currentOdds: odds,
      customTrendData: null 
    };
    
    // Only normalize if mutually exclusive
    if (isMutuallyExclusive) {
      // Normalize odds so they sum to 100
      // Calculate remaining percentage to distribute
      const remaining = 100 - odds;
      
      // Get other outcomes
      const otherOutcomes = updatedOutcomes.filter((_, i) => i !== targetIndex);
      
      // Calculate current total of other outcomes
      const otherTotal = otherOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
      
      // Redistribute remaining percentage proportionally
      if (otherTotal > 0 && remaining > 0) {
        updatedOutcomes.forEach((outcome, i) => {
          if (i !== targetIndex) {
            const proportion = outcome.currentOdds / otherTotal;
            updatedOutcomes[i] = {
              ...outcome,
              currentOdds: Math.max(0, Math.round(remaining * proportion)),
              customTrendData: null // Reset custom trends when odds change
            };
          }
        });
        
        // Handle rounding errors - adjust the first other outcome
        const currentSum = updatedOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
        if (currentSum !== 100) {
          const firstOtherIndex = updatedOutcomes.findIndex((_, i) => i !== targetIndex);
          if (firstOtherIndex !== -1) {
            updatedOutcomes[firstOtherIndex] = {
              ...updatedOutcomes[firstOtherIndex],
              currentOdds: Math.max(0, updatedOutcomes[firstOtherIndex].currentOdds + (100 - currentSum))
            };
          }
        }
      } else if (remaining > 0) {
        // Distribute evenly if all others are 0
        const perOutcome = Math.floor(remaining / otherOutcomes.length);
        let remainder = remaining - (perOutcome * otherOutcomes.length);
        
        updatedOutcomes.forEach((outcome, i) => {
          if (i !== targetIndex) {
            updatedOutcomes[i] = {
              ...outcome,
              currentOdds: perOutcome + (remainder > 0 ? 1 : 0),
              customTrendData: null
            };
            remainder--;
          }
        });
      } else {
        // If remaining is 0 or negative, set all others to 0
        updatedOutcomes.forEach((outcome, i) => {
          if (i !== targetIndex) {
            updatedOutcomes[i] = {
              ...outcome,
              currentOdds: 0,
              customTrendData: null
            };
          }
        });
      }
    }
    
    onConfigChange({ outcomes: updatedOutcomes });
    onRegenerateData();
  }

  return (
    <div className="control-panel">
      {onBack && (
        <button onClick={onBack} className="back-button-control-panel">
          <ArrowLeftIcon size={14} />
          Back
        </button>
      )}
      <h1 className="panel-title">
        {mode === 'search' ? 'Search Result Builder' : mode === 'link-preview' ? 'Link Preview Builder' : 'Chart Maker'}
      </h1>
      <p className="panel-subtitle">
        {mode === 'search' 
          ? 'Realistic Google search result generator for Kalshi markets'
          : mode === 'link-preview'
          ? 'Create Twitter/social media card previews (1200×675)'
          : 'Realistic chart generator for Kalshi markets'}
      </p>

      {mode === 'search' && (
        <div className="control-group">
          <label htmlFor="search-query">Search Query</label>
          <input
            id="search-query"
            type="text"
            className="text-input"
            placeholder="e.g., How high will Bitcoin get this year?"
            value={config.searchQuery || ''}
            onChange={(e) => onConfigChange({ searchQuery: e.target.value })}
          />
          <p className="help-text">The search query displayed in the Google search bar</p>
        </div>
      )}

      {mode === 'link-preview' && onLeftImageUpload && (
        <div className="control-group">
          <label>Left Side Image</label>
          <div
            onDragOver={handleLeftDragOver}
            onDragLeave={handleLeftDragLeave}
            onDrop={handleLeftDrop}
            style={{
              border: `1.5px dashed ${isDraggingLeft ? '#09C285' : '#d1d5db'}`,
              borderRadius: '5px',
              padding: '16px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '48px',
              backgroundColor: isDraggingLeft ? '#f0fdf4' : '#fafafa',
              transition: 'border-color 0.15s, background-color 0.15s',
              cursor: 'pointer',
              marginBottom: '4px'
            }}
          >
            <input
              id="left-image"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleLeftImageChange}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="left-image"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: isDraggingLeft ? '#09C285' : '#6b7280',
                fontWeight: 500,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.02em'
              }}
            >
              {isDraggingLeft ? (
                <>
                  <UploadIcon size={14} />
                  <span>Drop image here</span>
                </>
              ) : leftImage ? (
                <>
                  <CheckIcon size={14} />
                  <span>Image uploaded</span>
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
      )}

      <div className="control-group">
        <label htmlFor="market-title">Market Title</label>
        <input
          id="market-title"
          type="text"
          className="text-input"
          placeholder="e.g., Will SpaceX land on Mars by 2030?"
          value={config.title}
          onChange={(e) => onConfigChange({ title: e.target.value })}
        />
      </div>

      <div className="control-group">
        <label htmlFor="market-image">Market Image (Optional)</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `1.5px dashed ${isDragging ? '#09C285' : '#d1d5db'}`,
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
            id="market-image"
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleImageChange}
            className="file-input"
            style={{ display: 'none' }}
          />
          <label
            htmlFor="market-image"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: isDragging ? '#09C285' : '#6b7280',
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
        <label htmlFor="market-type">Market Type</label>
        <select
          id="market-type"
          className="text-input"
          value={config.marketType}
          onChange={(e) => handleMarketTypeChange(e.target.value as MarketType)}
          style={{
            marginTop: '0',
            padding: '8px 10px',
            border: '1px solid #e5e7eb',
            borderRadius: '5px',
            backgroundColor: 'white',
            fontSize: '14px',
            color: '#374151',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
            width: '100%',
          }}
        >
          <option value="binary">Binary (Yes/No)</option>
          <option value="multi">Multi-Outcome</option>
          <option value="forecast">Forecast</option>
        </select>
        <p className="help-text">
          {config.marketType === 'binary' 
            ? 'Single yes/no outcome market' 
            : config.marketType === 'multi'
            ? 'Multiple bracket/outcome market'
            : 'Unbounded numerical forecast market'}
        </p>
      </div>

      {config.marketType === 'multi' && (
        <>
          <div className="control-group">
            <label htmlFor="mutually-exclusive" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                id="mutually-exclusive"
                type="checkbox"
                checked={config.mutuallyExclusive !== false}
                onChange={(e) => onConfigChange({ mutuallyExclusive: e.target.checked })}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: '#09C285',
                }}
              />
              <span>Mutually Exclusive (odds sum to 100%)</span>
            </label>
            <p className="help-text">
              {config.mutuallyExclusive !== false 
                ? 'Outcomes are mutually exclusive - changing one adjusts others to keep total at 100%'
                : 'Outcomes are independent - each can have any odds value'}
            </p>
          </div>
          <div className="control-group">
            <label>Outcomes</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {config.outcomes.map((outcome, index) => (
                <div
                  key={outcome.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '12px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setColorPickerOpen(colorPickerOpen === outcome.id ? null : outcome.id)}
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: outcome.color,
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          flexShrink: 0,
                          padding: 0,
                        }}
                        title="Choose color"
                      />
                      {colorPickerOpen === outcome.id && (
                        <div
                          ref={colorPickerRef}
                          style={{
                            position: 'absolute',
                            top: '36px',
                            left: 0,
                            zIndex: 1000,
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                          }}
                        >
                          <HexColorPicker
                            color={outcome.color}
                            onChange={(color) => handleOutcomeChange(outcome.id, { color })}
                          />
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={outcome.name}
                      onChange={(e) => handleOutcomeChange(outcome.id, { name: e.target.value })}
                      placeholder={`Outcome ${index + 1}`}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                    {config.outcomes.length > 2 && (
                      <button
                        onClick={() => handleRemoveOutcome(outcome.id)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #fecaca',
                          backgroundColor: 'transparent',
                          color: '#dc2626',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                      Odds: {outcome.currentOdds}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={outcome.currentOdds}
                      onChange={(e) => handleOutcomeOddsChange(outcome.id, parseInt(e.target.value))}
                      className="slider-input"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddOutcome}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '12px',
                border: '1.5px dashed #d1d5db',
                backgroundColor: 'transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                color: '#6b7280',
                transition: 'border-color 0.15s, color 0.15s',
              }}
            >
              + Add Outcome
            </button>
          </div>
        </>
      )}

      {(config.marketType === 'binary' || config.marketType === 'forecast') && (
        <>
          <div className="control-group">
            <label>Market Trend (Optional)</label>
            <button onClick={onOpenTrendDrawer} className="button-draw">
              <PencilIcon size={16} />
              {config.customTrendData ? 'Redraw Trend' : 'Draw Custom Trend'}
            </button>
            {config.customTrendData ? (
              <p className="help-text" style={{ color: '#09C285', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckIcon size={14} />
                Using your custom drawn trend
              </p>
            ) : (
              <p className="help-text">
                Using random walk default • Draw your own trend line
              </p>
            )}
          </div>

          {config.marketType === 'binary' && (
            <div className="control-group">
              <label htmlFor="current-odds">
                Current Odds: {config.currentOdds}%
              </label>
              <input
                id="current-odds"
                type="range"
                min="0"
                max="100"
                value={config.currentOdds}
                onChange={(e) => {
                  onConfigChange({ currentOdds: parseInt(e.target.value), customTrendData: null });
                  onRegenerateData();
                }}
                className="slider-input"
              />
              <div className="slider-labels">
                <span>0%</span>
                <span>100%</span>
              </div>
              {config.customTrendData && (
                <p className="help-text" style={{ color: '#dc2626', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <WarningIcon size={14} />
                  Adjusting odds will reset your custom trend
                </p>
              )}
            </div>
          )}

          {config.marketType === 'forecast' && (
            <>
              <div className="control-group">
                <label htmlFor="forecast-value">
                  Forecast Value: {config.forecastValue ?? 128000}
                </label>
                <input
                  id="forecast-value"
                  type="number"
                  className="text-input"
                  placeholder="e.g., 128000"
                  value={config.forecastValue ?? 128000}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    onConfigChange({ forecastValue: value, customTrendData: null });
                    onRegenerateData();
                  }}
                  min="0"
                  step="1"
                />
                <p className="help-text">Enter the forecasted numerical value</p>
                {config.customTrendData && (
                  <p className="help-text" style={{ color: '#dc2626', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <WarningIcon size={14} />
                    Adjusting value will reset your custom trend
                  </p>
                )}
              </div>

              <div className="control-group">
                <label htmlFor="forecast-unit">Unit</label>
                <input
                  id="forecast-unit"
                  type="text"
                  className="text-input"
                  placeholder="e.g., K"
                  value={config.forecastUnit ?? 'K'}
                  onChange={(e) => {
                    onConfigChange({ forecastUnit: e.target.value });
                  }}
                />
                <p className="help-text">Unit to display after the forecast value (e.g., K, $, etc.)</p>
              </div>
            </>
          )}
        </>
      )}

      <div className="control-group">
        <label htmlFor="volatility">
          Volatility: {config.volatility}x
        </label>
        <input
          id="volatility"
          type="range"
          min="0.2"
          max="3"
          step="0.2"
          value={config.volatility}
          onChange={(e) => {
            onConfigChange({ volatility: parseFloat(e.target.value) });
            onRegenerateData();
          }}
          className="slider-input"
        />
        <div className="slider-labels">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <div className="control-group">
        <label>Time Horizon</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['6H', '1D', '1W', '1M', 'ALL'] as TimeHorizon[]).map((horizon) => (
            <button
              key={horizon}
              onClick={() => {
                onConfigChange({ timeHorizon: horizon });
                onRegenerateData();
              }}
              style={{
                padding: '6px 10px',
                border: '1px solid',
                borderColor: config.timeHorizon === horizon ? '#09C285' : '#e5e7eb',
                backgroundColor: config.timeHorizon === horizon ? '#f0fdf4' : 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
                color: config.timeHorizon === horizon ? '#09C285' : '#9ca3af',
                transition: 'border-color 0.15s, background-color 0.15s, color 0.15s',
                fontSize: '12px',
                minWidth: '40px',
              }}
            >
              {horizon}
            </button>
          ))}
        </div>
        <p className="help-text">
          {config.timeHorizon === 'ALL' 
            ? 'Custom date range (use Advanced Settings)' 
            : `Last ${config.timeHorizon === '6H' ? '6 hours' : config.timeHorizon === '1D' ? 'day' : config.timeHorizon === '1W' ? 'week' : 'month'}`}
        </p>
      </div>

      <div className="control-group">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background-color 0.15s',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={16} />
            Advanced Settings
          </span>
          <span style={{ 
            transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}>
            <ChevronDownIcon size={16} />
          </span>
        </button>
      </div>

      {showAdvanced && (
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '16px',
          backgroundColor: '#fafafa',
          marginTop: '-4px',
        }}>
          <div className="control-group">
            <label htmlFor="volume">Volume</label>
            <input
              id="volume"
              type="number"
              className="text-input"
              placeholder="e.g., 528110"
              value={config.volume}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                onConfigChange({ volume: value });
              }}
              min="0"
              step="1000"
            />
            <p className="help-text">Enter amount (e.g., 528110)</p>
          </div>

          {config.timeHorizon === 'ALL' && (
            <div className="control-group">
              <label htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                type="date"
                className="text-input"
                value={config.startDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  onConfigChange({ startDate: newDate });
                  onRegenerateData();
                }}
                max={config.endDate.toISOString().split('T')[0]}
              />
              <p className="help-text">Chart start date (default: 3 months ago)</p>
            </div>
          )}

          <div className="control-group">
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              className="text-input"
              value={config.endDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                onConfigChange({ endDate: newDate });
                onRegenerateData();
              }}
              min={config.startDate.toISOString().split('T')[0]}
            />
            <p className="help-text">Chart end date (default: today)</p>
          </div>

          <div className="control-group" style={{ marginBottom: 0 }}>
            <label htmlFor="show-watermark" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                id="show-watermark"
                type="checkbox"
                checked={config.showWatermark}
                onChange={(e) => onConfigChange({ showWatermark: e.target.checked })}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: '#09C285',
                }}
              />
              <span>Show Watermark</span>
            </label>
            <p className="help-text">Display "kalshi.tools" at bottom of chart</p>
          </div>
        </div>
      )}

      <button 
        onClick={onRegenerateData} 
        className="button-regenerate"
        style={{ marginTop: '20px' }}
      >
        <RefreshIcon size={16} />
        Regenerate Data
      </button>

      <div style={{ display: 'flex', gap: '8px' }}>
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


