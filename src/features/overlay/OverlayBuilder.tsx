import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OverlayConfig, MarketLiveData } from './types';
import { encodeOverlayState, decodeOverlayState, createDefaultConfig, saveOverlayState, loadOverlayState } from './overlayState';
import { useMarketData } from './useMarketData';
import { getElementDef } from './elements';
// Register all element types (side-effect import)
import './elements';
import { OverlayCanvas } from './OverlayCanvas';
import { OverlayEditor } from './OverlayEditor';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { trackEvent } from '../../lib/analytics';
import { kalshiWs } from '../../lib/kalshiWebSocket';

function ViewerCanvas({ config, marketData }: { config: OverlayConfig; marketData: Record<string, MarketLiveData> }) {
  const [viewportSize, setViewportSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scale = Math.min(viewportSize.w / config.width, viewportSize.h / config.height);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{
      background: config.background.type === 'transparent'
        ? 'transparent'
        : config.background.type === 'gradient'
          ? (config.background.gradient || '#000')
          : (config.background.color || '#000'),
    }}>
      <div
        style={{
          width: config.width,
          height: config.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
        }}
      >
        {config.elements.map((el) => {
          const def = getElementDef(el.type);
          if (!def) return null;
          const Renderer = def.Renderer;
          const liveData = def.usesMarketData ? marketData[el.props.ticker] : undefined;
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                zIndex: el.zIndex,
              }}
            >
              <Renderer props={el.props} width={el.width} height={el.height} liveData={liveData} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OverlayBuilder() {
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.has('edit');
  const encodedState = searchParams.get('v');

  const [config, setConfig] = useState<OverlayConfig>(() => {
    if (encodedState) {
      const decoded = decodeOverlayState(encodedState);
      if (decoded) return decoded;
    }
    return loadOverlayState() ?? createDefaultConfig();
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { message: toastMessage, showToast } = useToast();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [guidesEnabled, setGuidesEnabled] = useState(true);
  const resizingRef = useRef(false);

  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>(
    kalshiWs.isConnected ? 'connected' : 'disconnected'
  );

  // Debounce persist to localStorage so drag/resize don't block the main thread
  useEffect(() => {
    if (!isEditMode) return;
    const timeout = setTimeout(() => saveOverlayState(config), 500);
    return () => clearTimeout(timeout);
  }, [config, isEditMode]);

  useEffect(() => {
    return kalshiWs.onStatus(setWsStatus);
  }, []);

  useEffect(() => {
    if (kalshiWs.isConnected) return;
    kalshiWs.connect();
  }, []);

  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(canvasContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Build a stable ticker key so moving/resizing elements doesn't re-trigger subscriptions
  const tickerKey = useMemo(() => {
    const entries: string[] = [];
    for (const el of config.elements) {
      const def = getElementDef(el.type);
      if (!def?.usesMarketData || !el.props.ticker) continue;
      entries.push(`${el.props.ticker}:${(el.props.pollInterval as number) || 30}:${!!def.usesTradeData}`);
    }
    return entries.sort().join(',');
  }, [config.elements]);

  const marketTickers = useMemo(() => {
    const tickerMap = new Map<string, { ticker: string; pollInterval: number; fetchTrades: boolean }>();
    for (const el of config.elements) {
      const def = getElementDef(el.type);
      if (!def?.usesMarketData || !el.props.ticker) continue;
      const ticker = el.props.ticker as string;
      const existing = tickerMap.get(ticker);
      tickerMap.set(ticker, {
        ticker,
        pollInterval: Math.min(existing?.pollInterval ?? Infinity, (el.props.pollInterval as number) || 30),
        fetchTrades: (existing?.fetchTrades || def.usesTradeData) ?? false,
      });
    }
    return Array.from(tickerMap.values());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerKey]);

  const marketData = useMarketData(marketTickers, true);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setConfig(prev => {
      const el = prev.elements.find(e => e.id === id);
      if (el?.locked) return prev;
      return { ...prev, elements: prev.elements.map(el => el.id === id ? { ...el, x, y } : el) };
    });
  }, []);

  const handleResize = useCallback((id: string, width: number, height: number) => {
    setConfig(prev => {
      const el = prev.elements.find(e => e.id === id);
      if (el?.locked) return prev;
      return { ...prev, elements: prev.elements.map(el => el.id === id ? { ...el, width, height } : el) };
    });
  }, []);

  const handleCopyLink = useCallback(() => {
    const encoded = encodeOverlayState(config);
    const url = `${window.location.origin}/overlay?v=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('OBS link copied to clipboard!');
      trackEvent('overlay_copy_link', { element_count: config.elements.length });
    }).catch(() => {
      window.prompt('Copy this URL for OBS:', url);
    });
  }, [config, showToast]);

  useEffect(() => {
    if (!isEditMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
          const el = config.elements.find(el => el.id === selectedId);
          if (el?.locked) return;
          setConfig(prev => ({
            ...prev,
            elements: prev.elements.filter(el => el.id !== selectedId),
          }));
          setSelectedId(null);
        }
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isEditMode, selectedId]);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const onMove = (ev: PointerEvent) => {
      const newWidth = Math.max(260, Math.min(600, startWidth + (ev.clientX - startX)));
      setSidebarWidth(newWidth);
    };
    const onUp = () => {
      resizingRef.current = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  // Viewer mode — fills entire viewport for OBS browser source
  if (!isEditMode) {
    return (
      <ViewerCanvas config={config} marketData={marketData} />
    );
  }

  // Editor mode
  return (
    <div className="grid min-h-screen flex-1 bg-dark font-sans text-text-primary max-[900px]:!grid-cols-[1fr]" style={{ gridTemplateColumns: `${sidebarWidth}px 0px 1fr` }}>
      <div className="h-screen overflow-y-auto bg-dark-card [scrollbar-color:transparent_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] hover:[scrollbar-color:rgba(255,255,255,0.12)_transparent] max-[900px]:h-auto max-[900px]:max-h-[50vh] max-[900px]:border-b max-[900px]:border-dark-border">
        <OverlayEditor
          config={config}
          selectedId={selectedId}
          wsStatus={wsStatus}
          guidesEnabled={guidesEnabled}
          onConfigChange={setConfig}
          onSelect={setSelectedId}
          onCopyLink={handleCopyLink}
          onGuidesToggle={() => setGuidesEnabled(v => !v)}
        />
      </div>
      <div
        className="relative z-10 -ml-0.5 w-[5px] cursor-col-resize bg-transparent transition-[background] duration-150 after:absolute after:inset-y-0 after:left-0.5 after:w-px after:bg-dark-border hover:bg-brand/15 hover:after:bg-brand active:bg-brand/15 active:after:bg-brand max-[900px]:hidden"
        onPointerDown={handleResizeStart}
      />
      <div className="flex items-start justify-center overflow-auto bg-[#111] p-6 max-[900px]:p-3" ref={canvasContainerRef} onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}>
        <OverlayCanvas
          config={config}
          editMode={true}
          selectedId={selectedId}
          guidesEnabled={guidesEnabled}
          marketData={marketData}
          onSelect={setSelectedId}
          onMove={handleMove}
          onResize={handleResize}
          containerWidth={containerWidth}
        />
      </div>
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
