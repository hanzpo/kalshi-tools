import { useImageUpload } from '../../hooks/useImageUpload';
import { UploadIcon, ImageIcon } from './Icons';
import './ImageUploader.css';

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
      className={`image-uploader ${isDragging ? 'image-uploader--dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
        className="image-uploader__input"
      />
      <label htmlFor={id} className="image-uploader__label">
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
