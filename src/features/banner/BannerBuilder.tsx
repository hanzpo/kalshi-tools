import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BannerConfig } from '../../types';
import { BannerMaker } from './BannerMaker';
import { BannerPreview, BANNER_PREVIEW_ID } from './BannerPreview';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { Toast } from '../../components/ui/Toast';
import { captureElementAsPng, copyDataUrlToClipboard, downloadDataUrl } from '../../lib/imageExport';
import { createFileName } from '../../lib/chartHelpers';
import { useToast } from '../../hooks/useToast';
import { trackEvent } from '../../lib/analytics';
import '../../App.css';

export default function BannerBuilder() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<BannerConfig>({
    title: '',
    image: null,
    outcome: '',
    tradeSide: 'Yes',
    odds: 65,
    trendDirection: 'up',
    rank: '',
  });

  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const { message: toastMessage, showToast } = useToast();

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

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = Array.from(event.clipboardData?.items ?? []);
      const imageItem = items.find((item) => item.type.startsWith('image/'));
      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      event.preventDefault();
      handleImageUpload(file);
      trackEvent('image_paste', { tool: 'banner', target: 'main' });
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleImageUpload]);

  async function handleExport() {
    const element = document.getElementById(BANNER_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      const nameSource = config.title?.trim() || config.outcome?.trim() || 'banner';
      downloadDataUrl(dataUrl, createFileName(nameSource, 'kalshi-banner'));
      trackEvent('export_image', {
        tool: 'banner',
        method: 'download',
        target: BANNER_PREVIEW_ID,
      });
    } catch (error) {
      console.error('Error exporting image:', error);
      trackEvent('export_error', {
        tool: 'banner',
        method: 'download',
        message: error instanceof Error ? error.message : 'unknown',
      });
      alert('Failed to export image. Please try again.');
    }
  }

  async function handleCopyToClipboard() {
    const element = document.getElementById(BANNER_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      await copyDataUrlToClipboard(dataUrl);
      showToast('Banner copied to clipboard!');
      trackEvent('copy_image', {
        tool: 'banner',
        method: 'clipboard',
        target: BANNER_PREVIEW_ID,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard');
      trackEvent('export_error', {
        tool: 'banner',
        method: 'clipboard',
        message: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  return (
    <div className="app">
      <div className="app-container">
        <BannerMaker
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleImageUpload}
          onExport={handleExport}
          onCopyToClipboard={handleCopyToClipboard}
          onBack={() => navigate('/')}
        />
        <div className="preview-section">
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
