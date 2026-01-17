import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TradeSlipConfig } from '../../types';
import { TradeSlipMaker } from './TradeSlipMaker';
import { TradeSlipPreview } from './TradeSlipPreview';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { Toast } from '../../components/ui/Toast';
import { captureElementAsPng, copyDataUrlToClipboard, downloadDataUrl } from '../../lib/imageExport';
import { createFileName } from '../../lib/chartHelpers';
import { useToast } from '../../hooks/useToast';
import { trackEvent } from '../../lib/analytics';
import '../../App.css';

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
    backgroundColor: '#28CC95',
    parlayOdds: 400,
    parlayLegs: [
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
    prizePickPlayers: [],
    prizePickWager: 1000,
    prizePickPayout: 25000,
    prizePickType: '6-Pick Power Play',
    prizePickShowTeam: true,
    prizePickShowPosition: true,
    prizePickShowNumber: true,
    prizePickShowScore: true,
    coinbasePredictions: [],
    coinbaseWager: 1000,
    coinbasePayout: 25000,
    coinbasePlayType: '',
  });

  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const { message: toastMessage, showToast } = useToast();

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

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = Array.from(event.clipboardData?.items ?? []);
      const imageItem = items.find((item) => item.type.startsWith('image/'));
      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      event.preventDefault();
      handleImageUpload(file);
      trackEvent('image_paste', {
        tool: 'trade-slip',
        mode: config.mode,
        target: 'main',
      });
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleImageUpload, config.mode]);

  useEffect(() => {
    trackEvent('trade_slip_mode_change', { tool: 'trade-slip', mode: config.mode });
  }, [config.mode]);

  async function handleExport() {
    const element = document.getElementById(TRADE_SLIP_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      const outcomeName = config.outcome?.trim();
      const marketName = config.marketName?.trim();
      const titleName = config.title?.trim();
      let nameSource: string;
      if (config.mode === 'single') {
        nameSource = outcomeName || marketName || titleName || 'trade-slip';
      } else if (config.mode === 'coinbase') {
        nameSource = config.coinbasePlayType?.trim() || 'coinbase-slip';
      } else {
        nameSource = titleName || 'trade-slip';
      }
      downloadDataUrl(dataUrl, createFileName(nameSource, 'kalshi-trade-slip'));
      trackEvent('export_image', {
        tool: 'trade-slip',
        mode: config.mode,
        method: 'download',
        target: TRADE_SLIP_PREVIEW_ID,
      });
    } catch (error) {
      console.error('Error exporting image:', error);
      trackEvent('export_error', {
        tool: 'trade-slip',
        mode: config.mode,
        method: 'download',
        message: error instanceof Error ? error.message : 'unknown',
      });
      alert('Failed to export image. Please try again.');
    }
  }

  async function handleCopyToClipboard() {
    const element = document.getElementById(TRADE_SLIP_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      await copyDataUrlToClipboard(dataUrl);
      showToast('Trade slip copied to clipboard!');
      trackEvent('copy_image', {
        tool: 'trade-slip',
        mode: config.mode,
        method: 'clipboard',
        target: TRADE_SLIP_PREVIEW_ID,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard');
      trackEvent('export_error', {
        tool: 'trade-slip',
        mode: config.mode,
        method: 'clipboard',
        message: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  return (
    <div className="app">
      <div className="app-container">
        <TradeSlipMaker
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleImageUpload}
          onExport={handleExport}
          onCopyToClipboard={handleCopyToClipboard}
          onBack={() => navigate('/')}
        />
        <div className="preview-section">
          <TradeSlipPreview config={config} />
        </div>
      </div>

      {cropperImage && (
        <ImageCropper imageSrc={cropperImage} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
