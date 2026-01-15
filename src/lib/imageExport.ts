import { toPng } from 'html-to-image';

/**
 * Convert a DOM element into a PNG data URL using html-to-image.
 */
export async function captureElementAsPng(element: HTMLElement): Promise<string> {
  // Use higher of device pixel ratio or 3 for crisp exports
  const pixelRatio = Math.max(window.devicePixelRatio || 1, 3);

  return toPng(element, {
    quality: 1,
    pixelRatio,
  });
}

/**
 * Trigger a browser download for a given data URL.
 */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

/**
 * Copy a PNG data URL to the clipboard.
 */
export async function copyDataUrlToClipboard(dataUrl: string): Promise<void> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}

