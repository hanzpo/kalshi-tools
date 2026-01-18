import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketPageConfig, ChartDataPoint, SubmittedOrder } from '../../types/market-page';
import { MarketPageMaker } from './MarketPageMaker';
import { MarketPagePreview, MARKET_PAGE_PREVIEW_ID } from './MarketPagePreview';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { TrendDrawer } from '../../components/shared/TrendDrawer';
import { Toast } from '../../components/ui/Toast';
import { captureElementAsPng, copyDataUrlToClipboard, downloadDataUrl } from '../../lib/imageExport';
import { createFileName } from '../../lib/chartHelpers';
import { useToast } from '../../hooks/useToast';
import { trackEvent } from '../../lib/analytics';
import '../../App.css';

function generateDefaultChartData(): ChartDataPoint[] {
  const now = Date.now();
  const points: ChartDataPoint[] = [];
  const numPoints = 100;

  // Generate a slightly realistic trend
  let value = 50 + (Math.random() - 0.5) * 20;
  for (let i = 0; i < numPoints; i++) {
    // Add some volatility
    value += (Math.random() - 0.5) * 5;
    // Keep within bounds
    value = Math.max(5, Math.min(95, value));
    points.push({
      time: now - (numPoints - i) * 60000, // 1 minute intervals
      value: Math.round(value),
    });
  }

  return points;
}

export default function MarketPageBuilder() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<MarketPageConfig>({
    category: 'Politics',
    title: 'Will Bitcoin hit $100k in 2025?',
    subtitle: 'This market will resolve to Yes if Bitcoin reaches $100,000 USD at any point in 2025.',
    image: null,
    outcomes: [
      { id: 'outcome-1', name: 'Yes', yesPrice: 65, noPrice: 35, volume: 125000 },
    ],
    chartData: generateDefaultChartData(),
    chartTimeRange: '1D',
    selectedOutcome: null,
    selectedSide: 'Yes',
    orderAmount: 100,
    limitPrice: 65,
    showWatermark: true,
    showRules: false,
    rulesText: '',
    submittedOrders: [],
  });

  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [showTrendDrawer, setShowTrendDrawer] = useState(false);
  const { message: toastMessage, showToast } = useToast();

  function handleConfigChange(updates: Partial<MarketPageConfig>) {
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

  function handleOutcomeSelect(outcomeId: string) {
    const outcome = config.outcomes.find((o) => o.id === outcomeId);
    if (outcome) {
      setConfig((prev) => ({
        ...prev,
        selectedOutcome: outcomeId,
        limitPrice: prev.selectedSide === 'Yes' ? outcome.yesPrice : outcome.noPrice,
      }));
    }
  }

  function handleSideSelect(side: 'Yes' | 'No') {
    const outcome = config.outcomes.find((o) => o.id === config.selectedOutcome);
    if (outcome) {
      setConfig((prev) => ({
        ...prev,
        selectedSide: side,
        limitPrice: side === 'Yes' ? outcome.yesPrice : outcome.noPrice,
      }));
    }
  }

  function handleSubmitOrder() {
    if (!config.selectedOutcome) return;

    const outcome = config.outcomes.find((o) => o.id === config.selectedOutcome);
    if (!outcome) return;

    const newOrder: SubmittedOrder = {
      id: `order-${Date.now()}`,
      outcomeName: outcome.name,
      side: config.selectedSide,
      amount: config.orderAmount,
      price: config.limitPrice,
      timestamp: new Date(),
      status: 'filled',
    };

    setConfig((prev) => ({
      ...prev,
      submittedOrders: [...prev.submittedOrders, newOrder],
    }));

    showToast(`Order submitted: ${config.selectedSide} ${outcome.name} @ ${config.limitPrice}¢`);
    trackEvent('fake_order_submit', {
      tool: 'market-page',
      side: config.selectedSide,
      amount: config.orderAmount,
      price: config.limitPrice,
    });
  }

  function handleDrawChart() {
    trackEvent('trend_draw_open', { tool: 'market-page' });
    setShowTrendDrawer(true);
  }

  function handleTrendDrawComplete(trendData: number[]) {
    trackEvent('trend_draw_complete', { tool: 'market-page' });
    const now = Date.now();
    const chartData: ChartDataPoint[] = trendData.map((value, i) => ({
      time: now - (trendData.length - i) * 60000,
      value: Math.round(value),
    }));
    setConfig((prev) => ({ ...prev, chartData }));
    setShowTrendDrawer(false);
  }

  function handleTrendDrawCancel() {
    trackEvent('trend_draw_cancel', { tool: 'market-page' });
    setShowTrendDrawer(false);
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
        tool: 'market-page',
        target: 'main',
      });
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleImageUpload]);

  async function handleExport() {
    const element = document.getElementById(MARKET_PAGE_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      const name = config.title?.trim() || 'market-page';
      downloadDataUrl(dataUrl, createFileName(name, 'kalshi-market'));
      trackEvent('export_image', {
        tool: 'market-page',
        method: 'download',
        target: MARKET_PAGE_PREVIEW_ID,
      });
    } catch (error) {
      console.error('Error exporting image:', error);
      trackEvent('export_error', {
        tool: 'market-page',
        method: 'download',
        message: error instanceof Error ? error.message : 'unknown',
      });
      alert('Failed to export image. Please try again.');
    }
  }

  async function handleCopyToClipboard() {
    const element = document.getElementById(MARKET_PAGE_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      await copyDataUrlToClipboard(dataUrl);
      showToast('Market page copied to clipboard!');
      trackEvent('copy_image', {
        tool: 'market-page',
        method: 'clipboard',
        target: MARKET_PAGE_PREVIEW_ID,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard');
      trackEvent('export_error', {
        tool: 'market-page',
        method: 'clipboard',
        message: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  return (
    <div className="app">
      <div className="app-container">
        <MarketPageMaker
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleImageUpload}
          onExport={handleExport}
          onCopyToClipboard={handleCopyToClipboard}
          onBack={() => navigate('/')}
          onDrawChart={handleDrawChart}
        />
        <div className="preview-section">
          <MarketPagePreview
            config={config}
            onOutcomeSelect={handleOutcomeSelect}
            onSideSelect={handleSideSelect}
            onSubmitOrder={handleSubmitOrder}
            onAmountChange={(amount) => handleConfigChange({ orderAmount: amount })}
            onLimitPriceChange={(price) => handleConfigChange({ limitPrice: price })}
          />
        </div>
      </div>

      {cropperImage && (
        <ImageCropper imageSrc={cropperImage} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
      )}

      {showTrendDrawer && <TrendDrawer onComplete={handleTrendDrawComplete} onCancel={handleTrendDrawCancel} />}

      <Toast message={toastMessage} />
    </div>
  );
}
