import { useImageUpload } from '../../hooks/useImageUpload';
import { Upload as UploadIcon, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  id: string;
  onImageSelect: (file: File) => void;
  hasImage?: boolean;
  label?: string;
}

export function ImageUploader({
  id,
  onImageSelect,
  hasImage = false,
  label = 'Click to upload or drag & drop'
}: ImageUploaderProps) {
  const {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange
  } = useImageUpload({ onImageSelect });

  return (
    <div
      className={`flex min-h-12 cursor-pointer items-center justify-center rounded-[6px] border-[1.5px] border-dashed p-[16px_12px] transition-[border-color,background-color] duration-150 ${
        isDragging
          ? 'border-[#00DD94] bg-[#01201A]'
          : 'border-dark-border-light bg-dark-surface hover:border-brand hover:bg-dark-elevated'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-[0.02em] ${
          isDragging ? 'text-[#00DD94]' : 'text-[#9ca3af]'
        }`}
      >
        {isDragging ? (
          <>
            <UploadIcon size={18} />
            <span>Drop image here</span>
          </>
        ) : hasImage ? (
          <>
            <ImageIcon size={18} />
            <span>Image uploaded – Click to change</span>
          </>
        ) : (
          <>
            <ImageIcon size={18} />
            <span>{label}</span>
          </>
        )}
      </label>
    </div>
  );
}
