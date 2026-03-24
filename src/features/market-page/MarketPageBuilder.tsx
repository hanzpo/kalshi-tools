import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { MarketPageConfig, ChartDataPoint, SubmittedOrder, MarketOutcome } from '../../types/market-page';
import { MarketPageMaker } from './MarketPageMaker';
import { MarketPagePreview, MARKET_PAGE_PREVIEW_ID } from './MarketPagePreview';
import { ImageCropper } from '../../components/shared/ImageCropper';
import { TrendDrawer } from '../../components/shared/TrendDrawer';
import { Toast } from '../../components/ui/Toast';
import { captureElementAsPng, copyDataUrlToClipboard, downloadDataUrl } from '../../lib/imageExport';
import { createFileName } from '../../lib/chartHelpers';
import { useToast } from '../../hooks/useToast';
import { trackEvent } from '../../lib/analytics';

const OUTCOME_COLORS = ['#09C285', '#265CFF', '#000000', '#FF5A5A', '#9333EA', '#F59E0B'];

function generateChartDataForOutcomes(outcomes: MarketOutcome[]): ChartDataPoint[] {
  return generateChartDataWithCustomTrends(outcomes);
}

function generateChartDataWithCustomTrends(outcomes: MarketOutcome[]): ChartDataPoint[] {
  const now = Date.now();
  const points: ChartDataPoint[] = [];
  const numPoints = 100;

  // Initialize values for each outcome
  const values: Record<string, number> = {};
  outcomes.forEach((outcome) => {
    if (outcome.customTrendData && outcome.customTrendData.length > 0) {
      values[outcome.id] = outcome.customTrendData[0];
    } else {
      values[outcome.id] = outcome.yesPrice + (Math.random() - 0.5) * 20;
    }
  });

  for (let i = 0; i < numPoints; i++) {
    const point: ChartDataPoint = {
      time: now - (numPoints - i) * 60000 * 1.5, // 1.5 minute intervals
      value: 0,
    };

    const isLastPoint = i === numPoints - 1;

    // Generate data for each outcome
    outcomes.forEach((outcome) => {
      if (isLastPoint) {
        // Last point always uses the current yes price
        point[`value_${outcome.id}`] = outcome.yesPrice;
      } else if (outcome.customTrendData && outcome.customTrendData.length > 0) {
        // Use custom trend data for all points except the last
        const trendIndex = Math.floor((i / (numPoints - 1)) * (outcome.customTrendData.length - 1));
        const clampedIndex = Math.min(trendIndex, outcome.customTrendData.length - 1);
        point[`value_${outcome.id}`] = Math.round(outcome.customTrendData[clampedIndex]);
      } else {
        // Generate random data with trend toward yesPrice
        const volatility = 3 + Math.random() * 2;
        values[outcome.id] += (Math.random() - 0.5) * volatility;

        // Gradually trend toward the final yesPrice
        const progress = i / numPoints;
        const trend = (outcome.yesPrice - values[outcome.id]) * 0.02 * progress;
        values[outcome.id] += trend;

        // Keep within bounds
        values[outcome.id] = Math.max(5, Math.min(95, values[outcome.id]));

        point[`value_${outcome.id}`] = Math.round(values[outcome.id]);
      }
    });

    // Set main value to first outcome's value
    if (outcomes.length > 0) {
      point.value = point[`value_${outcomes[0].id}`] as number;
    }

    points.push(point);
  }

  return points;
}

function createDefaultOutcomes(): MarketOutcome[] {
  return [
    {
      id: 'outcome-1',
      name: 'J.D. Vance',
      subtitle: 'Republican',
      image: null,
      yesPrice: 28,
      noPrice: 72,
      volume: 2800000,
      change: 3,
      color: OUTCOME_COLORS[0],
      customTrendData: null,
    },
    {
      id: 'outcome-2',
      name: 'Gavin Newsom',
      subtitle: 'Democratic',
      image: null,
      yesPrice: 20,
      noPrice: 80,
      volume: 1900000,
      change: -2,
      color: OUTCOME_COLORS[1],
      customTrendData: null,
    },
    {
      id: 'outcome-3',
      name: 'Marco Rubio',
      subtitle: 'Republican',
      image: null,
      yesPrice: 11,
      noPrice: 89,
      volume: 1200000,
      change: 1,
      color: OUTCOME_COLORS[2],
      customTrendData: null,
    },
  ];
}

export default function MarketPageBuilder() {
  const navigate = useNavigate();
  const defaultOutcomes = createDefaultOutcomes();

  const [config, setConfig] = useState<MarketPageConfig>({
    category: 'Politics',
    subcategory: 'US Elections',
    title: 'Next US Presidential Election Winner?',
    subtitle: '',
    image: null,
    profileImage: null,
    portfolioBalance: '$1,250.00',
    eventStatus: 'upcoming',
    eventDate: 'Nov 5, 2028',
    countdownText: '',
    outcomes: defaultOutcomes,
    chartData: generateChartDataForOutcomes(defaultOutcomes),
    chartTimeRange: 'ALL',
    volume: '$5.9M',
    selectedOutcome: 'outcome-1',
    selectedSide: 'Yes',
    orderAmount: 100,
    limitPrice: 28,
    showWatermark: true,
    showRules: true,
    rulesText: 'This market will resolve to the name of the winner of the 2028 US Presidential Election. The winner is determined by the candidate who receives at least 270 Electoral College votes.',
    showRelatedMarkets: true,
    showReviewPage: true,
    relatedMarkets: [
      { id: 'related-1', title: '2028 Republican Presidential Nominee?', image: null },
      { id: 'related-2', title: '2028 Democratic Presidential Nominee?', image: null },
      { id: 'related-3', title: 'Who will win the 2026 Senate elections?', image: null },
    ],
    submittedOrders: [],
    payoutAmount: '',
    sidebarState: 'trading',
    darkMode: true,
  });

  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropperTarget, setCropperTarget] = useState<'market' | 'profile' | string>('market'); // 'market', 'profile', or outcome id
  const [showTrendDrawer, setShowTrendDrawer] = useState(false);
  const [drawingOutcomeId, setDrawingOutcomeId] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const { message: toastMessage, showToast } = useToast();

  // Dragging state
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle mouse down on drag handle
  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;

        // Keep panel within viewport bounds
        const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 380);
        const maxY = window.innerHeight - 100;

        setPanelPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  function handleConfigChange(updates: Partial<MarketPageConfig>) {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };

      // If outcomes changed, regenerate chart data
      if (updates.outcomes && updates.outcomes !== prev.outcomes) {
        newConfig.chartData = generateChartDataForOutcomes(updates.outcomes);
      }

      if (!newConfig.showReviewPage && newConfig.sidebarState === 'review') {
        newConfig.sidebarState = 'trading';
      }

      return newConfig;
    });
  }

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperTarget('market');
      setCropperImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleOutcomeImageUpload = useCallback((outcomeId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperTarget(outcomeId);
      setCropperImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleProfileImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperTarget('profile');
      setCropperImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  function handleCropComplete(croppedImage: string) {
    if (cropperTarget === 'market') {
      setConfig((prev) => ({ ...prev, image: croppedImage }));
    } else if (cropperTarget === 'profile') {
      setConfig((prev) => ({ ...prev, profileImage: croppedImage }));
    } else {
      // It's an outcome ID
      setConfig((prev) => ({
        ...prev,
        outcomes: prev.outcomes.map((o) =>
          o.id === cropperTarget ? { ...o, image: croppedImage } : o
        ),
      }));
    }
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

  function fireFireworks() {
    const duration = 1500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
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

    fireFireworks();

    showToast(`Order submitted: ${config.selectedSide} ${outcome.name} @ ${config.limitPrice}¢`);
    trackEvent('fake_order_submit', {
      tool: 'market-page',
      side: config.selectedSide,
      amount: config.orderAmount,
      price: config.limitPrice,
    });
  }

  function handleDrawOutcomeTrend(outcomeId: string) {
    trackEvent('trend_draw_open', { tool: 'market-page', outcomeId });
    setDrawingOutcomeId(outcomeId);
    setShowTrendDrawer(true);
  }

  function handleTrendDrawComplete(trendData: number[]) {
    trackEvent('trend_draw_complete', { tool: 'market-page', outcomeId: drawingOutcomeId });

    if (drawingOutcomeId) {
      // Update the specific outcome's customTrendData
      setConfig((prev) => {
        const updatedOutcomes = prev.outcomes.map((o) =>
          o.id === drawingOutcomeId ? { ...o, customTrendData: trendData } : o
        );

        // Regenerate chart data using the custom trend data
        const chartData = generateChartDataWithCustomTrends(updatedOutcomes);

        return { ...prev, outcomes: updatedOutcomes, chartData };
      });
    }

    setShowTrendDrawer(false);
    setDrawingOutcomeId(null);
  }

  function handleTrendDrawCancel() {
    trackEvent('trend_draw_cancel', { tool: 'market-page' });
    setShowTrendDrawer(false);
    setDrawingOutcomeId(null);
  }

  function handleRegenerateData() {
    trackEvent('regenerate_data', { tool: 'market-page' });
    setConfig((prev) => ({
      ...prev,
      chartData: generateChartDataForOutcomes(prev.outcomes),
    }));
    showToast('Chart data regenerated');
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
    <div className="fixed inset-0 bg-[#141414] overflow-hidden">
      {/* Full-page preview */}
      <div className="size-full overflow-auto [&_.kmp]:min-h-full">
        <MarketPagePreview
          config={config}
          onOutcomeSelect={handleOutcomeSelect}
          onSideSelect={handleSideSelect}
          onSubmitOrder={handleSubmitOrder}
          onAmountChange={(amount) => handleConfigChange({ orderAmount: amount })}
          onLimitPriceChange={(price) => handleConfigChange({ limitPrice: price })}
          onSidebarStateChange={(state) => handleConfigChange({ sidebarState: state })}
          onLogoClick={() => navigate('/')}
        />
      </div>

      {/* Floating control panel */}
      <div
        ref={panelRef}
        className={`fixed z-[1000] flex flex-col overflow-hidden rounded-xl bg-[#1e1e1e] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)] transition-shadow duration-200 hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.3)] ${isPanelCollapsed ? 'h-auto w-[180px]' : 'w-[380px] max-h-[calc(100vh-40px)] max-md:w-[calc(100%-40px)] max-md:max-w-[360px]'}`}
        style={{
          left: panelPosition.x,
          top: panelPosition.y,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        <div
          className="flex shrink-0 select-none items-center gap-2 border-b border-[#333] bg-[#252525] px-4 py-3"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="flex items-center justify-center text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="6" r="2" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="16" cy="12" r="2" />
              <circle cx="8" cy="18" r="2" />
              <circle cx="16" cy="18" r="2" />
            </svg>
          </div>
          <span className="flex-1 text-sm font-semibold text-gray-200">Controls</span>
          <button
            className="flex size-7 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-gray-400 transition-[background-color,color] duration-150 hover:bg-[#333] hover:text-gray-300"
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-200"
              style={{ transform: isPanelCollapsed ? 'rotate(180deg)' : 'none' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
        {!isPanelCollapsed && (
          <div className="flex-1 overflow-y-auto overflow-x-hidden [&_.sticky]:static [&_.rounded-lg]:rounded-none [&_.border]:border-none [&_.shadow-sm]:shadow-none">
            <MarketPageMaker
              config={config}
              onConfigChange={handleConfigChange}
              onImageUpload={handleImageUpload}
              onOutcomeImageUpload={handleOutcomeImageUpload}
              onProfileImageUpload={handleProfileImageUpload}
              onExport={handleExport}
              onCopyToClipboard={handleCopyToClipboard}
              onBack={() => navigate('/')}
              onDrawOutcomeTrend={handleDrawOutcomeTrend}
              onRegenerateData={handleRegenerateData}
            />
          </div>
        )}
      </div>

      {cropperImage && (
        <ImageCropper imageSrc={cropperImage} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
      )}

      {showTrendDrawer && <TrendDrawer onComplete={handleTrendDrawComplete} onCancel={handleTrendDrawCancel} />}

      <Toast message={toastMessage} />
    </div>
  );
}
