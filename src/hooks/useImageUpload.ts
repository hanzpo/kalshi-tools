import { useState, useCallback, useEffect, DragEvent, ChangeEvent } from 'react';

interface UseImageUploadOptions {
  onImageSelect: (file: File) => void;
  acceptTypes?: string[];
}

interface UseImageUploadReturn {
  isDragging: boolean;
  handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function useImageUpload({ 
  onImageSelect, 
  acceptTypes = ['image/'] 
}: UseImageUploadOptions): UseImageUploadReturn {
  const [isDragging, setIsDragging] = useState(false);

  const isValidType = useCallback((type: string) => {
    return acceptTypes.some(accept => type.startsWith(accept));
  }, [acceptTypes]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidType(file.type)) {
        onImageSelect(file);
      }
    }
  }, [isValidType, onImageSelect]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
  };
}

// Hook for handling paste events
export function useImagePaste(onImageSelect: (file: File) => void): void {
  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = Array.from(event.clipboardData?.items ?? []);
      const imageItem = items.find((item) => item.type.startsWith('image/'));
      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      event.preventDefault();
      onImageSelect(file);
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageSelect]);
}
