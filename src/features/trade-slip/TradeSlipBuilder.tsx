import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TradeSlipConfig } from '../../types';
import { TradeSlipMaker } from './TradeSlipMaker';
import { TradeSlipPreview } from './TradeSlipPreview';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { useExport } from '../../hooks/useExport';
import { useImagePaste } from '../../hooks/useImageUpload';
import { trackEvent } from '../../lib/analytics';
import { layout } from '../../styles/layout';

const TRADE_SLIP_PREVIEW_ID = 'trade-slip-preview';

export default function TradeSlipBuilder() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<TradeSlipConfig>({
    mode: 'single',
    title: '',
    marketName: '',
    outcome: '',
    image: null,
    wager: 1000,
    odds: 65,
    tradeSide: 'Yes',
    showWatermark: true,
    showTimestamp: true,
    showCashedOut: false,
    isPaidOut: false,
    backgroundColor: '#28CC95',
    comboOdds: 400,
    comboLegs: [
      { id: 'leg-1', question: '', answer: 'Yes', image: null },
      { id: 'leg-2', question: '', answer: 'Yes', image: null },
    ],
    comboCategories: [
      {
        id: 'category-1',
        name: 'Pro Football',
        events: [
          {
            id: 'event-1',
            name: 'Kansas City @ Philadelphia',
            color1: '#E31837', // Chiefs red
            color2: '#004C54', // Eagles green
            markets: [
              { id: 'market-1', text: 'Philadelphia' },
              { id: 'market-2', text: 'Total game point is 47 or more', prefix: 'No' },
              { id: 'market-3', text: 'S. Barkley: 1st touchdown added' },
            ],
          },
        ],
      },
      {
        id: 'category-2',
        name: 'Pro basketball',
        events: [
          {
            id: 'event-2',
            name: 'Miami @ Philadelphia',
            color1: '#98002E', // Heat red
            color2: '#006BB6', // 76ers blue
            markets: [
              { id: 'market-4', text: 'Philadelphia' },
              { id: 'market-5', text: 'Total game point is 219.5 or more' },
            ],
          },
          {
            id: 'event-3',
            name: 'Dallas @ Los Angeles C',
            color1: '#00538C', // Mavs blue
            color2: '#C8102E', // Clippers red
            markets: [
              { id: 'market-6', text: 'LAC wins by 8 or more' },
            ],
          },
        ],
      },
    ],
    comboPayout: 1920,
    comboCost: 99.84,
    comboAutoCompute: false,
    comboSpread: 10,
    championshipSecondaryColor: '#0a3d2e',
    championshipTitle: 'CHAMPIONSHIP',
  });

  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const { message: toastMessage, showToast } = useToast();

  const { handleExport: exportImage, handleCopyToClipboard: copyToClipboard } = useExport({
    elementId: TRADE_SLIP_PREVIEW_ID,
    onSuccess: showToast,
    analyticsContext: { tool: 'trade-slip', target: TRADE_SLIP_PREVIEW_ID },
  });

  function handleConfigChange(updates: Partial<TradeSlipConfig>) {
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

  useEffect(() => {
    trackEvent('trade_slip_mode_change', { tool: 'trade-slip', mode: config.mode });
  }, [config.mode]);

  function handleExport() {
    const outcomeName = config.outcome?.trim();
    const marketName = config.marketName?.trim();
    const titleName = config.title?.trim();
    let nameSource: string;
    if (config.mode === 'single') {
      nameSource = outcomeName || marketName || titleName || 'trade-slip';
    } else {
      nameSource = titleName || 'trade-slip';
    }
    exportImage(nameSource, 'kalshi-trade-slip');
  }

  function handleCopyToClipboard() {
    copyToClipboard('Trade slip copied to clipboard!');
  }

  return (
    <div className={layout.app}>
      <div className={layout.appContainer}>
        <TradeSlipMaker
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleImageUpload}
          onExport={handleExport}
          onCopyToClipboard={handleCopyToClipboard}
          onBack={() => navigate('/')}
        />
        <div className={layout.previewSection}>
          <TradeSlipPreview config={config} />
        </div>
      </div>

      {cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={config.mode === 'horizontal' ? 16 / 9 : 1}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
