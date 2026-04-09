import { ChangeEvent, useState, DragEvent, useRef, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { MarketConfig, MarketType, Outcome, TimeHorizon } from '../../types';
import { getOutcomeColor } from '../../lib/colorGenerator';
import { Image as ImageIcon, Upload as UploadIcon, Pencil as PencilIcon, RotateCw as RefreshIcon, Download as DownloadIcon, Copy as CopyIcon, Settings as SettingsIcon, ChevronDown as ChevronDownIcon, Check as CheckIcon, TriangleAlert as WarningIcon, ArrowLeft as ArrowLeftIcon, Link as LinkIcon } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import { isKalshiUrl, importKalshiMarket, KalshiImportResult } from '../../lib/kalshiApi';
import { ctrl } from '../../styles/controls';

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
  // Kalshi import callback
  onImportKalshiMarket?: (result: KalshiImportResult) => void;
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
  onImportKalshiMarket,
}: ControlPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);

  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
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

  // Handle URL import
  const handleUrlImport = useCallback(async (url: string) => {
    if (!url.trim() || !onImportKalshiMarket) return;

    if (!isKalshiUrl(url)) {
      setImportError('Please enter a valid Kalshi URL');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const result = await importKalshiMarket(url);
      onImportKalshiMarket(result);
      setUrlInput('');
      trackEvent('kalshi_import', {
        tool: mode,
        market_type: result.marketType,
        method: 'url_input',
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import market');
    } finally {
      setIsImporting(false);
    }
  }, [onImportKalshiMarket, mode]);


  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      trackEvent('image_upload', {
        tool: mode,
        method: 'file_input',
        target: 'chart',
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
          tool: mode,
          method: 'drop',
          target: 'chart',
        });
      }
    }
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = Array.from(event.clipboardData?.items ?? []);

      // Check for Kalshi URL in pasted text first
      if (onImportKalshiMarket) {
        const clipboardText = event.clipboardData?.getData('text/plain');
        if (clipboardText && isKalshiUrl(clipboardText)) {
          event.preventDefault();
          setUrlInput(clipboardText);
          handleUrlImport(clipboardText);
          return;
        }
      }

      // Check for image paste
      const imageItem = items.find((item) => item.type.startsWith('image/'));
      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      event.preventDefault();
      // For link-preview mode, paste goes to left image
      if (mode === 'link-preview' && onLeftImageUpload) {
        onLeftImageUpload(file);
        trackEvent('image_paste', {
          tool: mode,
          target: 'left',
        });
      } else {
        onImageUpload(file);
        trackEvent('image_paste', {
          tool: mode,
          target: 'chart',
        });
      }
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageUpload, onLeftImageUpload, mode, onImportKalshiMarket, handleUrlImport]);

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
        trackEvent('image_upload', {
          tool: mode,
          method: 'drop',
          target: 'left',
        });
      }
    }
  }

  function handleLeftImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onLeftImageUpload) {
      onLeftImageUpload(file);
      trackEvent('image_upload', {
        tool: mode,
        method: 'file_input',
        target: 'left',
      });
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
    trackEvent('market_type_change', { tool: mode, market_type: marketType });
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
    <div className={ctrl.panel}>
      {onBack && (
        <button onClick={onBack} className={ctrl.backBtn}>
          <ArrowLeftIcon size={14} />
          Back
        </button>
      )}
      <h1 className={ctrl.title}>
        {mode === 'search' ? 'Search Result Builder' : mode === 'link-preview' ? 'Link Preview Builder' : 'Chart Maker'}
      </h1>
      <p className={ctrl.subtitle}>
        {mode === 'search' 
          ? 'Realistic Google search result generator for Kalshi markets'
          : mode === 'link-preview'
          ? 'Create Twitter/social media card previews (1200×675)'
          : 'Realistic chart generator for Kalshi markets'}
      </p>

      {/* Import from Kalshi */}
      {mode === 'chart' && onImportKalshiMarket && (
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            className={`${ctrl.input} flex-1`}
            placeholder="Paste Kalshi URL or Ctrl+V"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setImportError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUrlImport(urlInput);
            }}
            disabled={isImporting}
          />
          <button
            onClick={() => handleUrlImport(urlInput)}
            disabled={isImporting || !urlInput.trim()}
            className={`shrink-0 px-3 py-1.5 border-none rounded-[5px] font-medium text-[13px] transition-colors duration-150 flex items-center gap-1.5 ${isImporting || !urlInput.trim() ? 'cursor-not-allowed bg-[#333] text-text-secondary' : 'cursor-pointer bg-brand text-white'}`}
          >
            {isImporting ? <><RefreshIcon size={14} /> Importing...</> : <><LinkIcon size={14} /> Import</>}
          </button>
        </div>
      )}
      {importError && (
        <p className={`${ctrl.helpText} -mt-2 mb-3 flex items-center gap-1 text-[#dc2626]`}>
          <WarningIcon size={14} />{importError}
        </p>
      )}

      {/* Content Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Content</div>

        {mode === 'search' && (
          <div className={ctrl.group}>
            <label htmlFor="search-query">Search Query</label>
            <input
              id="search-query"
              type="text"
              className={ctrl.input}
              placeholder="e.g., How high will Bitcoin get this year?"
              value={config.searchQuery || ''}
              onChange={(e) => onConfigChange({ searchQuery: e.target.value })}
            />

          </div>
        )}

        {mode === 'link-preview' && onLeftImageUpload && (
          <div className={ctrl.group}>
            <label>Left Side Image</label>
            <div
              onDragOver={handleLeftDragOver}
              onDragLeave={handleLeftDragLeave}
              onDrop={handleLeftDrop}
              className={`rounded-[5px] px-3 py-4 flex items-center justify-center min-h-12 border-[1.5px] border-dashed transition-[border-color,background-color] duration-150 cursor-pointer mb-1 ${isDraggingLeft ? 'border-brand bg-[#01201A]' : 'border-dark-border-light bg-dark-surface'}`}
            >
              <input
                id="left-image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleLeftImageChange}
                className="hidden"
              />
              <label
                htmlFor="left-image"
                className={`cursor-pointer flex items-center justify-center gap-2 font-medium text-[13px] uppercase tracking-[0.02em] ${isDraggingLeft ? 'text-brand' : 'text-text-secondary'}`}
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
          </div>
        )}

        <div className={ctrl.group}>
          <label htmlFor="market-image">Market Image (Optional)</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-[5px] px-3 py-4 flex items-center justify-center min-h-12 border-[1.5px] border-dashed transition-[border-color,background-color] duration-150 cursor-pointer mb-1 ${isDragging ? 'border-brand bg-[#01201A]' : 'border-dark-border-light bg-dark-surface'}`}
          >
            <input
              id="market-image"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageChange}
              className={`${ctrl.fileInput} hidden`}
            />
            <label
              htmlFor="market-image"
              className={`cursor-pointer flex items-center justify-center gap-2 font-medium text-[13px] uppercase tracking-[0.02em] ${isDragging ? 'text-brand' : 'text-text-secondary'}`}
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
          <label htmlFor="market-title">Market Title</label>
          <input
            id="market-title"
            type="text"
            className={ctrl.input}
            placeholder="e.g., Will SpaceX land on Mars by 2030?"
            value={config.title}
            onChange={(e) => onConfigChange({ title: e.target.value })}
          />
        </div>
      </div>

      {/* Market Settings Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Market Settings</div>

        <div className={ctrl.group}>
          <label htmlFor="market-type">Market Type</label>
          <select
            id="market-type"
            className={`${ctrl.input} mt-0 px-2.5 py-2 border border-[#333] rounded-[5px] bg-[#141414] text-sm text-[#e5e7eb] cursor-pointer transition-[border-color] duration-150 w-full`}
            value={config.marketType}
            onChange={(e) => handleMarketTypeChange(e.target.value as MarketType)}
          >
            <option value="binary">Binary (Yes/No)</option>
            <option value="multi">Multi-Outcome</option>
            <option value="forecast">Forecast</option>
          </select>


        </div>

        {config.marketType === 'multi' && (
        <>
          <div className={ctrl.checkboxGroup}>
            <label htmlFor="mutually-exclusive" className={ctrl.checkboxLabel}>
              <input
                id="mutually-exclusive"
                type="checkbox"
                checked={config.mutuallyExclusive !== false}
                onChange={(e) => onConfigChange({ mutuallyExclusive: e.target.checked })}
                className={ctrl.checkboxInput}
              />
              Mutually Exclusive (odds sum to 100%)
            </label>


          </div>
          <div className={ctrl.group}>
            <label>Outcomes</label>
            <div className="flex flex-col gap-3 mt-2">
              {config.outcomes.map((outcome, index) => (
                <div
                  key={outcome.id}
                  className="border border-[#2a2a2a] rounded-md p-3 bg-[#252525]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setColorPickerOpen(colorPickerOpen === outcome.id ? null : outcome.id)}
                        className="size-7 border border-[#333] rounded cursor-pointer shrink-0 p-0"
                        style={{ backgroundColor: outcome.color }}
                        title="Choose color"
                      />
                      {colorPickerOpen === outcome.id && (
                        <div
                          ref={colorPickerRef}
                          className="absolute top-9 left-0 z-[1000] bg-[#1e1e1e] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.4)] p-3 border border-[#333]"
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
                      className="flex-1 px-2.5 py-1.5 border border-[#e5e7eb] rounded text-sm"
                    />
                    {config.outcomes.length > 2 && (
                      <button
                        onClick={() => handleRemoveOutcome(outcome.id)}
                        className="px-2.5 py-1.5 border border-[#fecaca] bg-transparent text-[#dc2626] rounded cursor-pointer text-xs font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-[13px] text-[#6b7280] block mb-1">
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
              className="w-full p-2.5 mt-3 border-[1.5px] border-dashed border-[#d1d5db] bg-transparent rounded-md cursor-pointer text-[13px] font-medium text-[#6b7280] transition-[border-color,color] duration-150"
            >
              + Add Outcome
            </button>
          </div>
        </>
      )}

      {config.marketType === 'binary' && (
        <div className={ctrl.group}>
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
          <div className={ctrl.sliderLabels}>
            <span>0%</span>
            <span>100%</span>
          </div>
          {config.customTrendData && (
            <p className={`${ctrl.helpText} text-[#dc2626] mt-2 flex items-center gap-1`}>
              <WarningIcon size={14} />
              Adjusting odds will reset your custom trend
            </p>
          )}
        </div>
      )}

      {config.marketType === 'forecast' && (
        <>
          <div className={ctrl.group}>
            <label htmlFor="forecast-value">
              Forecast Value: {config.forecastValue ?? 128000}
            </label>
            <input
              id="forecast-value"
              type="number"
              className={ctrl.input}
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


            {config.customTrendData && (
              <p className={`${ctrl.helpText} text-[#dc2626] mt-2 flex items-center gap-1`}>
                <WarningIcon size={14} />
                Adjusting value will reset your custom trend
              </p>
            )}
          </div>

          <div className={ctrl.group}>
            <label htmlFor="forecast-unit">Unit</label>
            <input
              id="forecast-unit"
              type="text"
              className={ctrl.input}
              placeholder="e.g., K"
              value={config.forecastUnit ?? 'K'}
              onChange={(e) => {
                onConfigChange({ forecastUnit: e.target.value });
              }}
            />


          </div>
        </>
      )}

      {(config.marketType === 'binary' || config.marketType === 'forecast') && (
        <div className={ctrl.group}>
          <button onClick={onOpenTrendDrawer} className={ctrl.btnDraw}>
            <PencilIcon size={16} />
            {config.customTrendData ? 'Redraw Trend' : 'Draw Custom Trend'}
          </button>
          {config.customTrendData && (
            <p className={`${ctrl.helpText} text-[#00DD94] font-semibold flex items-center gap-1`}>
              <CheckIcon size={14} />
              Using your custom drawn trend
            </p>
          )}
        </div>
      )}
      </div>

      {/* Chart Settings Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Chart Settings</div>

        <div className={ctrl.checkboxGroup}>
          <label htmlFor="dark-mode" className={ctrl.checkboxLabel}>
            <input
              id="dark-mode"
              type="checkbox"
              checked={config.darkMode === true}
              onChange={(e) => onConfigChange({ darkMode: e.target.checked })}
              className={ctrl.checkboxInput}
            />
            Dark Mode
          </label>
        </div>

        <div className={ctrl.group}>
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
          <div className={ctrl.sliderLabels}>
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div className={ctrl.group}>
          <label>Time Horizon</label>
          <div className="flex gap-1.5 flex-wrap">
            {(['6H', '1D', '1W', '1M', 'ALL'] as TimeHorizon[]).map((horizon) => (
              <button
                key={horizon}
                onClick={() => {
                  onConfigChange({ timeHorizon: horizon });
                  onRegenerateData();
                  trackEvent('time_horizon_change', { tool: mode, horizon });
                }}
                className={`px-2.5 py-1.5 border rounded cursor-pointer font-medium transition-[border-color,background-color,color] duration-150 text-xs min-w-10 ${config.timeHorizon === horizon ? 'border-brand bg-[#01201A] text-brand' : 'border-dark-border-light bg-dark-surface text-text-secondary'}`}
              >
                {horizon}
              </button>
            ))}
          </div>


        </div>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full p-2.5 border border-dark-border-light bg-dark-surface rounded-[5px] cursor-pointer text-[13px] font-medium text-text-primary flex items-center justify-between transition-colors duration-150"
      >
        <span className="flex items-center gap-2">
          <SettingsIcon size={16} />
          Advanced Settings
        </span>
        <span className={`transition-transform duration-150 ${showAdvanced ? 'rotate-180' : ''}`}>
          <ChevronDownIcon size={16} />
        </span>
      </button>

      {showAdvanced && (
        <div className="border border-dark-border rounded-md p-4 bg-dark-elevated -mt-1">
          <div className={ctrl.group}>
            <label htmlFor="volume">Volume</label>
            <input
              id="volume"
              type="number"
              className={ctrl.input}
              placeholder="e.g., 528110"
              value={config.volume}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                onConfigChange({ volume: value });
              }}
              min="0"
              step="1000"
            />
            <p className={ctrl.helpText}>Enter amount (e.g., 528110)</p>
          </div>

          {config.timeHorizon === 'ALL' && (
            <div className={ctrl.group}>
              <label htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                type="date"
                className={ctrl.input}
                value={config.startDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  onConfigChange({ startDate: newDate });
                  onRegenerateData();
                }}
                max={config.endDate.toISOString().split('T')[0]}
              />
              <p className={ctrl.helpText}>Chart start date (default: 3 months ago)</p>
            </div>
          )}

          <div className={ctrl.group}>
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              className={ctrl.input}
              value={config.endDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                onConfigChange({ endDate: newDate });
                onRegenerateData();
              }}
              min={config.startDate.toISOString().split('T')[0]}
            />
            <p className={ctrl.helpText}>Chart end date (default: today)</p>
          </div>

          <div className={ctrl.checkboxGroup}>
            <label htmlFor="show-watermark" className={ctrl.checkboxLabel}>
              <input
                id="show-watermark"
                type="checkbox"
                checked={config.showWatermark}
                onChange={(e) => onConfigChange({ showWatermark: e.target.checked })}
                className={ctrl.checkboxInput}
              />
              Show Watermark
            </label>
            <p className={ctrl.helpText}>Display "kalshi.tools" at bottom of chart</p>
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-col gap-2">
        <button
          onClick={onRegenerateData}
          className={ctrl.btnRegen}
        >
          <RefreshIcon size={16} />
          Regenerate Data
        </button>

        <div className="flex gap-2">
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
    </div>
  );
}
