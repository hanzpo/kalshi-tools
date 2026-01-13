import { useCallback } from 'react';
import { captureElementAsPng, copyDataUrlToClipboard, downloadDataUrl } from '../utils/imageExport';
import { createFileName } from '../utils/chartHelpers';
import { trackEvent } from '../utils/analytics';

interface UseExportOptions {
  elementId: string;
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
  analyticsContext?: {
    tool?: string;
    target?: string;
  };
}

interface UseExportReturn {
  handleExport: (title: string, fallbackName?: string) => Promise<void>;
  handleCopyToClipboard: (successMessage?: string) => Promise<void>;
}

export function useExport({ 
  elementId, 
  onSuccess, 
  onError,
  analyticsContext,
}: UseExportOptions): UseExportReturn {
  const baseParams = {
    tool: analyticsContext?.tool,
    target: analyticsContext?.target,
    element_id: elementId,
  };

  const handleExport = useCallback(async (title: string, fallbackName: string = 'export') => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      downloadDataUrl(dataUrl, createFileName(title, fallbackName));
      trackEvent('export_image', { ...baseParams, method: 'download' });
    } catch (error) {
      console.error('Error exporting image:', error);
      onError?.(error as Error);
      trackEvent('export_error', {
        ...baseParams,
        method: 'download',
        message: error instanceof Error ? error.message : 'unknown',
      });
      alert('Failed to export image. Please try again.');
    }
  }, [elementId, onError, baseParams]);

  const handleCopyToClipboard = useCallback(async (successMessage: string = 'Copied to clipboard!') => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      await copyDataUrlToClipboard(dataUrl);
      onSuccess?.(successMessage);
      trackEvent('copy_image', { ...baseParams, method: 'clipboard' });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      onError?.(error as Error);
      onSuccess?.('Failed to copy to clipboard');
      trackEvent('export_error', {
        ...baseParams,
        method: 'clipboard',
        message: error instanceof Error ? error.message : 'unknown',
      });
    }
  }, [elementId, onSuccess, onError, baseParams]);

  return { handleExport, handleCopyToClipboard };
}
