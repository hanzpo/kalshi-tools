import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketConfig, DataPoint } from '../../types';
import { ControlPanel } from '../chart/ControlPanel';
import { LinkPreviewPreview } from './LinkPreviewPreview';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { TrendDrawer } from '../../components/shared/TrendDrawer';
import { Toast } from '../../components/ui/Toast';
import { generateMarketData, generateForecastData, generateVolume, getDateRangeForTimeHorizon } from '../../lib/dataGenerator';
import { getOutcomeColor } from '../../lib/colorGenerator';
import {
  getDefaultStartDate,
  generateDefaultTrend,
  generateDefaultForecastTrend
} from '../../lib/chartHelpers';
import { useToast } from '../../hooks/useToast';
import { useExport } from '../../hooks/useExport';
import { trackEvent } from '../../lib/analytics';
import { layout } from '../../styles/layout';

const PREVIEW_ID = 'link-preview';

export default function LinkPreviewBuilder() {
  const navigate = useNavigate();

  const [config, setConfig] = useState<MarketConfig>({
    title: '',
    image: null,
    marketType: 'binary',
    currentOdds: 92,
    volume: generateVolume(),
    volatility: 1.5,
    customTrendData: null,
    outcomes: [
      { id: '1', name: 'Outcome 1', color: getOutcomeColor(0), currentOdds: 60, customTrendData: null },
      { id: '2', name: 'Outcome 2', color: getOutcomeColor(1), currentOdds: 40, customTrendData: null },
    ],
    startDate: getDefaultStartDate(),
    endDate: new Date(),
    timeHorizon: 'ALL',
    showWatermark: false,
    forecastValue: 128000,
    forecastUnit: 'K',
    mutuallyExclusive: true,
  });

  const [data, setData] = useState<DataPoint[]>([]);
  const [leftImage, setLeftImage] = useState<string | null>(null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropperTarget, setCropperTarget] = useState<'left' | 'chart'>('left');
  const [showTrendDrawer, setShowTrendDrawer] = useState(false);
  const configRef = useRef(config);
  
  const { message: toastMessage, showToast } = useToast();
  const { handleExport, handleCopyToClipboard } = useExport({
    elementId: PREVIEW_ID,
    onSuccess: showToast,
    analyticsContext: {
      tool: 'link-preview',
      target: 'link-preview',
    },
  });

  function updateConfig(updater: (prev: MarketConfig) => MarketConfig) {
    setConfig((prev) => {
      const next = updater(prev);
      configRef.current = next;
      return next;
    });
  }

  useEffect(() => {
    regenerateData();
  }, []);

  useEffect(() => {
    regenerateData();
  }, [config.marketType, config.timeHorizon, config.startDate, config.endDate]);

  useEffect(() => {
    if (config.marketType === 'multi') {
      regenerateData();
    }
  }, [config.marketType, config.outcomes.length]);

  function regenerateData(sourceConfig: MarketConfig = configRef.current) {
    const current = sourceConfig;
    const { startDate, endDate } = current.timeHorizon === 'ALL' 
      ? { startDate: current.startDate, endDate: current.endDate }
      : getDateRangeForTimeHorizon(current.timeHorizon, current.endDate);

    if (current.marketType === 'binary') {
      if (!current.customTrendData) {
        const defaultTrend = generateDefaultTrend(current.currentOdds);
        const newData = generateMarketData(current.currentOdds, current.volatility, defaultTrend, startDate, endDate, current.timeHorizon);
        setData(newData);
      } else {
        const newData = generateMarketData(current.currentOdds, current.volatility, current.customTrendData, startDate, endDate, current.timeHorizon);
        setData(newData);
      }
    } else if (current.marketType === 'forecast') {
      const targetValue = current.forecastValue ?? 128000;
      if (!current.customTrendData) {
        const defaultTrend = generateDefaultForecastTrend(targetValue);
        const newData = generateForecastData(targetValue, current.volatility, defaultTrend, startDate, endDate, current.timeHorizon);
        setData(newData);
      } else {
        const newData = generateForecastData(targetValue, current.volatility, current.customTrendData, startDate, endDate, current.timeHorizon);
        setData(newData);
      }
    } else {
      const baseData = generateMarketData(50, current.volatility, generateDefaultTrend(50), startDate, endDate, current.timeHorizon);

      current.outcomes.forEach((outcome) => {
        const trend = outcome.customTrendData || generateDefaultTrend(outcome.currentOdds);
        const outcomeData = generateMarketData(outcome.currentOdds, current.volatility, trend, startDate, endDate, current.timeHorizon);

        outcomeData.forEach((point, index) => {
          if (baseData[index]) {
            baseData[index][`value_${outcome.id}`] = point.value;
          }
        });
      });

      setData(baseData);
    }
  }

  function handleConfigChange(updates: Partial<MarketConfig>) {
    updateConfig((prev) => ({ ...prev, ...updates }));
  }

  // Left image handling
  function handleLeftImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperImage(result);
      setCropperTarget('left');
    };
    reader.readAsDataURL(file);
  }

  // Chart image handling
  function handleChartImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperImage(result);
      setCropperTarget('chart');
    };
    reader.readAsDataURL(file);
  }

  function handleCropComplete(croppedImage: string) {
    if (cropperTarget === 'left') {
      setLeftImage(croppedImage);
    } else {
      updateConfig((prev) => ({ ...prev, image: croppedImage }));
    }
    setCropperImage(null);
  }

  function handleCropCancel() {
    setCropperImage(null);
  }

  function handleOpenTrendDrawer() {
    trackEvent('trend_draw_open', { tool: 'link-preview', market_type: config.marketType });
    setShowTrendDrawer(true);
  }

  function handleTrendDrawComplete(trendData: number[]) {
    trackEvent('trend_draw_complete', { tool: 'link-preview', market_type: config.marketType });
    if (config.marketType === 'forecast') {
      const finalValue = trendData[trendData.length - 1];

      updateConfig((prev) => {
        const updated = {
          ...prev,
          customTrendData: trendData,
          forecastValue: finalValue,
        };

        const { startDate, endDate } = updated.timeHorizon === 'ALL' 
          ? { startDate: updated.startDate, endDate: updated.endDate }
          : getDateRangeForTimeHorizon(updated.timeHorizon, updated.endDate);
        const newData = generateForecastData(finalValue, updated.volatility, trendData, startDate, endDate, updated.timeHorizon);
        setData(newData);

        return updated;
      });
    } else {
      const finalOdds = Math.round(trendData[trendData.length - 1]);

      updateConfig((prev) => {
        const updated = {
          ...prev,
          customTrendData: trendData,
          currentOdds: finalOdds,
        };

        const { startDate, endDate } = updated.timeHorizon === 'ALL' 
          ? { startDate: updated.startDate, endDate: updated.endDate }
          : getDateRangeForTimeHorizon(updated.timeHorizon, updated.endDate);
        const newData = generateMarketData(finalOdds, updated.volatility, trendData, startDate, endDate, updated.timeHorizon);
        setData(newData);

        return updated;
      });
    }

    setShowTrendDrawer(false);
  }

  function handleTrendDrawCancel() {
    trackEvent('trend_draw_cancel', { tool: 'link-preview', market_type: config.marketType });
    setShowTrendDrawer(false);
  }

  return (
    <div className={layout.app}>
      <div className={layout.appContainer}>
        <ControlPanel
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleChartImageUpload}
          onExport={() => handleExport(config.title, 'kalshi-link-preview')}
          onRegenerateData={regenerateData}
          onOpenTrendDrawer={handleOpenTrendDrawer}
          onCopyToClipboard={() => handleCopyToClipboard('Link preview copied to clipboard!')}
          onBack={() => navigate('/')}
          mode="link-preview"
          leftImage={leftImage}
          onLeftImageUpload={handleLeftImageUpload}
        />
        <div className={layout.previewSection}>
          <LinkPreviewPreview 
            config={config} 
            data={data} 
            leftImage={leftImage}
            onTimeHorizonChange={(timeHorizon) => {
              handleConfigChange({ timeHorizon: timeHorizon as any });
              regenerateData();
              trackEvent('time_horizon_change', { tool: 'link-preview', horizon: timeHorizon });
            }}
          />
        </div>
      </div>

      {cropperImage && (
        <ImageCropper 
          imageSrc={cropperImage} 
          onCropComplete={handleCropComplete} 
          onCancel={handleCropCancel}
          aspectRatio={cropperTarget === 'left' ? 600 / 675 : 1}
        />
      )}

      {showTrendDrawer && <TrendDrawer onComplete={handleTrendDrawComplete} onCancel={handleTrendDrawCancel} />}

      <Toast message={toastMessage} />
    </div>
  );
}
