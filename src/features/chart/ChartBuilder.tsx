import { useNavigate } from 'react-router-dom';
import { MarketConfig } from '../../types';
import { ControlPanel } from './ControlPanel';
import { ChartPreview } from './ChartPreview';
import { SeoContentBlock } from '../../components/seo/SeoContentBlock';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { TrendDrawer } from '../../components/shared/TrendDrawer';
import { Toast } from '../../components/ui/Toast';
import { getOutcomeColor } from '../../lib/colorGenerator';
import { useChartBuilderState } from '../../hooks/useChartBuilderState';
import { trackEvent } from '../../lib/analytics';
import { KalshiImportResult } from '../../lib/kalshiApi';
import { seoPages } from '../../seo/routes';
import { layout } from '../../styles/layout';

const CHART_PREVIEW_ID = 'chart-preview';

export default function ChartBuilder() {
  const navigate = useNavigate();

  const {
    config,
    data,
    cropperImage,
    toastMessage,
    showTrendDrawer,
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
  } = useChartBuilderState({
    tool: 'chart',
    elementId: CHART_PREVIEW_ID,
    initialOverrides: { darkMode: true },
    enableUrlDecode: true,
  });

  function handleImportKalshiMarket(result: KalshiImportResult) {
    const updates: Partial<MarketConfig> = {
      title: result.title,
      marketType: result.marketType,
      volume: result.volume,
      customTrendData: null,
    };

    if (result.marketType === 'binary') {
      updates.currentOdds = result.currentOdds;
    } else if (result.marketType === 'forecast') {
      updates.forecastValue = result.forecastValue ?? result.currentOdds;
      updates.forecastUnit = result.forecastUnit ?? '';
    } else if (result.marketType === 'multi' && result.outcomes) {
      updates.mutuallyExclusive = result.mutuallyExclusive ?? true;
      updates.outcomes = result.outcomes.map((outcome, index) => ({
        id: String(index + 1),
        name: outcome.name,
        color: getOutcomeColor(index),
        currentOdds: outcome.currentOdds,
        customTrendData: null,
      }));
    }

    updateConfig((prev) => {
      const next = { ...prev, ...updates };
      setTimeout(() => regenerateData(next), 0);
      return next;
    });

    showToast('Market imported successfully!');
  }

  return (
    <div className={layout.app}>
      <div className={layout.appContainer}>
        <ControlPanel
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleImageUpload}
          onExport={() => handleExport(config.title, 'kalshi-chart')}
          onRegenerateData={regenerateData}
          onOpenTrendDrawer={handleOpenTrendDrawer}
          onCopyToClipboard={() => handleCopyToClipboard('Chart copied to clipboard!')}
          onBack={() => navigate('/')}
          mode="chart"
          onImportKalshiMarket={handleImportKalshiMarket}
        />
        <div className={layout.previewSection}>
          <ChartPreview
            config={config}
            data={data}
            onTimeHorizonChange={(timeHorizon) => {
              handleConfigChange({ timeHorizon: timeHorizon as any });
              regenerateData();
              trackEvent('time_horizon_change', { tool: 'chart', horizon: timeHorizon });
            }}
          />
        </div>
      </div>

      <SeoContentBlock content={seoPages['/chart'].content} />

      {cropperImage && (
        <ImageCropper imageSrc={cropperImage} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
      )}

      {showTrendDrawer && <TrendDrawer onComplete={handleTrendDrawComplete} onCancel={handleTrendDrawCancel} />}

      <Toast message={toastMessage} />
    </div>
  );
}
