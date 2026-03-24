import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MarketConfig, DataPoint } from '../types';
import { generateMarketData, generateForecastData, generateVolume, getDateRangeForTimeHorizon } from '../lib/dataGenerator';
import { decodeConfigFromUrl } from '../lib/urlEncoder';
import { getOutcomeColor } from '../lib/colorGenerator';
import {
  getDefaultStartDate,
  generateDefaultTrend,
  generateDefaultForecastTrend
} from '../lib/chartHelpers';
import { useToast } from './useToast';
import { useExport } from './useExport';
import { trackEvent } from '../lib/analytics';

interface UseChartBuilderOptions {
  tool: string;
  elementId: string;
  initialOverrides?: Partial<MarketConfig>;
  enableUrlDecode?: boolean;
}

export function useChartBuilderState({
  tool,
  elementId,
  initialOverrides = {},
  enableUrlDecode = false,
}: UseChartBuilderOptions) {
  const location = useLocation();

  const [config, setConfig] = useState<MarketConfig>(() => ({
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
    showWatermark: true,
    forecastValue: 128000,
    forecastUnit: 'K',
    mutuallyExclusive: true,
    ...initialOverrides,
  }));

  const [data, setData] = useState<DataPoint[]>([]);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [showTrendDrawer, setShowTrendDrawer] = useState(false);
  const configRef = useRef(config);

  const { message: toastMessage, showToast } = useToast();
  const { handleExport, handleCopyToClipboard } = useExport({
    elementId,
    onSuccess: showToast,
    analyticsContext: {
      tool,
      target: elementId,
    },
  });

  function updateConfig(updater: (prev: MarketConfig) => MarketConfig) {
    setConfig((prev) => {
      const next = updater(prev);
      configRef.current = next;
      return next;
    });
  }

  // URL decode effect (only when enabled)
  useEffect(() => {
    if (!enableUrlDecode) return;

    const urlParams = new URLSearchParams(location.search);
    const sharedConfig = urlParams.get('c');

    if (sharedConfig) {
      decodeConfigFromUrl(sharedConfig)
        .then((decodedConfig) => {
          updateConfig((prev) => ({ ...prev, ...decodedConfig }));
        })
        .catch((error) => {
          console.error('Failed to decode shared config:', error);
        });
    }
  }, [enableUrlDecode, location.search]);

  const regenerateData = useCallback((sourceConfig?: MarketConfig) => {
    const current = sourceConfig && 'marketType' in sourceConfig ? sourceConfig : configRef.current;
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
  }, []);

  // Initial data generation
  useEffect(() => {
    regenerateData();
  }, [regenerateData]);

  // Regenerate on market type / time changes
  useEffect(() => {
    regenerateData();
  }, [regenerateData, config.marketType, config.timeHorizon, config.startDate, config.endDate]);

  // Regenerate when multi outcomes change
  useEffect(() => {
    if (config.marketType === 'multi') {
      regenerateData();
    }
  }, [regenerateData, config.marketType, config.outcomes.length]);

  function handleConfigChange(updates: Partial<MarketConfig>) {
    updateConfig((prev) => ({ ...prev, ...updates }));
  }

  function handleImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperImage(result);
    };
    reader.readAsDataURL(file);
  }

  function handleCropComplete(croppedImage: string) {
    updateConfig((prev) => ({ ...prev, image: croppedImage }));
    setCropperImage(null);
  }

  function handleCropCancel() {
    setCropperImage(null);
  }

  function handleOpenTrendDrawer() {
    trackEvent('trend_draw_open', { tool, market_type: config.marketType });
    setShowTrendDrawer(true);
  }

  function handleTrendDrawComplete(trendData: number[]) {
    trackEvent('trend_draw_complete', { tool, market_type: config.marketType });
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
    trackEvent('trend_draw_cancel', { tool, market_type: config.marketType });
    setShowTrendDrawer(false);
  }

  return {
    config,
    data,
    cropperImage,
    setCropperImage,
    showTrendDrawer,
    toastMessage,
    showToast,
    handleExport,
    handleCopyToClipboard,
    updateConfig,
    regenerateData,
    handleConfigChange,
    handleImageUpload,
    handleCropComplete,
    handleCropCancel,
    handleOpenTrendDrawer,
    handleTrendDrawComplete,
    handleTrendDrawCancel,
  };
}
