import { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop | undefined>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 100,
        },
        aspectRatio,
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    );

    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, naturalWidth, naturalHeight));
  }, [aspectRatio]);

  const getCroppedImg = useCallback((): string | null => {
    const image = imgRef.current;
    if (!image) {
      return null;
    }

    const pixelCrop =
      completedCrop ??
      (crop
        ? convertToPixelCrop(crop, image.naturalWidth, image.naturalHeight)
        : null);

    if (!pixelCrop || !pixelCrop.width || !pixelCrop.height) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  }, [completedCrop, crop]);

  const handleComplete = useCallback(() => {
    const croppedImage = getCroppedImg();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
  }, [getCroppedImg, onCropComplete]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-5">
      <div className="flex max-h-[90vh] max-w-[90vw] flex-col gap-5 rounded-xl bg-[#1e1e1e] p-7 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)]">
        <h3 className="m-0 text-xl font-semibold tracking-[-0.2px] text-[#f3f4f6]">
          Crop Image{aspectRatio === 1 ? ' (Square)' : aspectRatio === 16 / 9 ? ' (16:9)' : ''}
        </h3>
        <div className="flex flex-1 items-center justify-center overflow-hidden [will-change:contents] [&_.ReactCrop]:translate-z-0 [&_.ReactCrop]:backface-hidden">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
            aspect={aspectRatio}
            circularCrop={false}
            ruleOfThirds
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={handleImageLoad}
              style={{ maxWidth: '100%', maxHeight: '60vh', display: 'block' }}
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-dark-border-light bg-dark-elevated px-[22px] py-[11px] text-[15px] font-semibold text-text-primary transition-all duration-200 hover:border-brand/30 hover:bg-dark-border-light"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="cursor-pointer rounded-lg border-none bg-[#00DD94] px-[22px] py-[11px] text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#00BB7D] hover:shadow-[0_2px_8px_rgba(0,221,148,0.25)]"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
