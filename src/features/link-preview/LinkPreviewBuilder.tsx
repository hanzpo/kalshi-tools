import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ControlPanel } from '../chart/ControlPanel';
import { LinkPreviewPreview } from './LinkPreviewPreview';
import { SeoContentBlock } from '../../components/seo/SeoContentBlock';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { TrendDrawer } from '../../components/shared/TrendDrawer';
import { Toast } from '../../components/ui/Toast';
import { useChartBuilderState } from '../../hooks/useChartBuilderState';
import { trackEvent } from '../../lib/analytics';
import { seoPages } from '../../seo/routes';
import { layout } from '../../styles/layout';

const PREVIEW_ID = 'link-preview';

export default function LinkPreviewBuilder() {
  const navigate = useNavigate();

  const {
    config,
    data,
    cropperImage,
    setCropperImage,
    toastMessage,
    showTrendDrawer,
    handleExport,
    handleCopyToClipboard,
    updateConfig,
    regenerateData,
    handleConfigChange,
    handleOpenTrendDrawer,
    handleTrendDrawComplete,
    handleTrendDrawCancel,
  } = useChartBuilderState({
    tool: 'link-preview',
    elementId: PREVIEW_ID,
    initialOverrides: { showWatermark: false },
    enableUrlDecode: false,
  });

  const [leftImage, setLeftImage] = useState<string | null>(null);
  const [cropperTarget, setCropperTarget] = useState<'left' | 'chart'>('left');

  function handleLeftImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperImage(result);
      setCropperTarget('left');
    };
    reader.readAsDataURL(file);
  }

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

      <SeoContentBlock content={seoPages['/link-preview'].content} />

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
