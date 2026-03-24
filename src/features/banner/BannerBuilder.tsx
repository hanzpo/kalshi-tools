import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BannerConfig } from '../../types';
import { BannerMaker } from './BannerMaker';
import { BannerPreview, BANNER_PREVIEW_ID } from './BannerPreview';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { useExport } from '../../hooks/useExport';
import { useImagePaste } from '../../hooks/useImageUpload';
import { layout } from '../../styles/layout';

export default function BannerBuilder() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<BannerConfig>({
    title: '',
    image: null,
    outcome: '',
    tradeSide: 'Yes',
    odds: 65,
    trendDirection: 'up',
    change: '',
    variant: 'classic',
    cardWidth: 500,
    cardHeight: 0,
    cardBorderRadius: 16,
  });

  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const { message: toastMessage, showToast } = useToast();

  const { handleExport: exportImage, handleCopyToClipboard: copyToClipboard } = useExport({
    elementId: BANNER_PREVIEW_ID,
    onSuccess: showToast,
    analyticsContext: { tool: 'banner', target: BANNER_PREVIEW_ID },
  });

  function handleConfigChange(updates: Partial<BannerConfig>) {
    setConfig((prev) => ({ ...prev, ...updates }));
  }

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  function handleCropComplete(croppedImage: string) {
    setConfig((prev) => ({ ...prev, image: croppedImage }));
    setCropperImage(null);
  }

  function handleCropCancel() {
    setCropperImage(null);
  }

  useImagePaste(handleImageUpload);

  function handleExport() {
    const nameSource = config.title?.trim() || config.outcome?.trim() || 'banner';
    exportImage(nameSource, 'kalshi-banner');
  }

  function handleCopyToClipboard() {
    copyToClipboard('Banner copied to clipboard!');
  }

  return (
    <div className={layout.app}>
      <div className={layout.appContainer}>
        <BannerMaker
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleImageUpload}
          onExport={handleExport}
          onCopyToClipboard={handleCopyToClipboard}
          onBack={() => navigate('/')}
        />
        <div className={layout.previewSection}>
          <BannerPreview config={config} />
        </div>
      </div>

      {cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
