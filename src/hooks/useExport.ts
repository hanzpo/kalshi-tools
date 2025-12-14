import { useCallback } from 'react';
import { captureElementAsPng, copyDataUrlToClipboard, downloadDataUrl } from '../utils/imageExport';
import { createFileName } from '../utils/chartHelpers';

interface UseExportOptions {
  elementId: string;
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
}

interface UseExportReturn {
  handleExport: (title: string, fallbackName?: string) => Promise<void>;
  handleCopyToClipboard: (successMessage?: string) => Promise<void>;
}

export function useExport({ 
  elementId, 
  onSuccess, 
  onError 
}: UseExportOptions): UseExportReturn {

  const handleExport = useCallback(async (title: string, fallbackName: string = 'export') => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      downloadDataUrl(dataUrl, createFileName(title, fallbackName));
    } catch (error) {
      console.error('Error exporting image:', error);
      onError?.(error as Error);
      alert('Failed to export image. Please try again.');
    }
  }, [elementId, onError]);

  const handleCopyToClipboard = useCallback(async (successMessage: string = 'Copied to clipboard!') => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      await copyDataUrlToClipboard(dataUrl);
      onSuccess?.(successMessage);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      onError?.(error as Error);
      onSuccess?.('Failed to copy to clipboard');
    }
  }, [elementId, onSuccess, onError]);

  return { handleExport, handleCopyToClipboard };
}
