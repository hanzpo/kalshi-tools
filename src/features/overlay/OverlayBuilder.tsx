import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OverlayConfig } from './types';
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
  const resizingRef = useRef(false);

  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>(
    kalshiWs.isConnected ? 'connected' : 'disconnected'
  );

  // Persist config to localStorage on every change (edit mode only)
  useEffect(() => {
    if (isEditMode) {
      saveOverlayState(config);
    }
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
  }, [config.elements]);

  const marketData = useMarketData(marketTickers, true);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setConfig(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === id ? { ...el, x, y } : el),
    }));
  }, []);

  const handleResize = useCallback((id: string, width: number, height: number) => {
    setConfig(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === id ? { ...el, width, height } : el),
    }));
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

  // Viewer mode
  if (!isEditMode) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-transparent">
        <OverlayCanvas
          config={config}
          editMode={false}
          selectedId={null}
          marketData={marketData}
          onSelect={() => {}}
          onMove={() => {}}
          onResize={() => {}}
        />
      </div>
    );
  }

  // Editor mode
  return (
    <div className="grid min-h-screen flex-1 bg-dark font-sans text-text-primary max-[900px]:!grid-cols-[1fr]" style={{ gridTemplateColumns: `${sidebarWidth}px 0px 1fr` }}>
      <div className="h-screen overflow-y-auto bg-dark-card [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:rgba(255,255,255,0.12)_transparent] max-[900px]:h-auto max-[900px]:max-h-[50vh] max-[900px]:border-b max-[900px]:border-dark-border">
        <OverlayEditor
          config={config}
          selectedId={selectedId}
          wsStatus={wsStatus}
          onConfigChange={setConfig}
          onSelect={setSelectedId}
          onCopyLink={handleCopyLink}
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
