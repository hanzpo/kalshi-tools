import { useNavigate } from 'react-router-dom';
import { ControlPanel } from '../chart/ControlPanel';
import { ChartPreview } from '../chart/ChartPreview';
import { SeoContentBlock } from '../../components/seo/SeoContentBlock';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { TrendDrawer } from '../../components/shared/TrendDrawer';
import { Toast } from '../../components/ui/Toast';
import { useChartBuilderState } from '../../hooks/useChartBuilderState';
import { trackEvent } from '../../lib/analytics';
import { seoPages } from '../../seo/routes';
import { layout } from '../../styles/layout';

const CHART_PREVIEW_ID = 'chart-preview';

export default function SearchBuilder() {
  const navigate = useNavigate();

  const {
    config,
    data,
    cropperImage,
    toastMessage,
    showTrendDrawer,
    handleExport,
    handleCopyToClipboard,
    regenerateData,
    handleConfigChange,
    handleImageUpload,
    handleCropComplete,
    handleCropCancel,
    handleOpenTrendDrawer,
    handleTrendDrawComplete,
    handleTrendDrawCancel,
  } = useChartBuilderState({
    tool: 'search',
    elementId: CHART_PREVIEW_ID,
    initialOverrides: { searchQuery: '' },
    enableUrlDecode: true,
  });

  return (
    <div className={layout.app}>
      <div className={layout.appContainer}>
        <ControlPanel
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleImageUpload}
          onExport={() => handleExport(config.title, 'kalshi-search')}
          onRegenerateData={regenerateData}
          onOpenTrendDrawer={handleOpenTrendDrawer}
          onCopyToClipboard={() => handleCopyToClipboard('Search result copied to clipboard!')}
          onBack={() => navigate('/')}
          mode="search"
        />
        <div className={layout.previewSection}>
          <ChartPreview
            config={config}
            data={data}
            onTimeHorizonChange={(timeHorizon) => {
              handleConfigChange({ timeHorizon: timeHorizon as any });
              regenerateData();
              trackEvent('time_horizon_change', { tool: 'search', horizon: timeHorizon });
            }}
          />
        </div>
      </div>

      <SeoContentBlock content={seoPages['/search'].content} />

      {cropperImage && (
        <ImageCropper imageSrc={cropperImage} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
      )}

      {showTrendDrawer && <TrendDrawer onComplete={handleTrendDrawComplete} onCancel={handleTrendDrawCancel} />}

      <Toast message={toastMessage} />
    </div>
  );
}
