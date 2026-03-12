import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OverlayConfig } from './types';
import { encodeOverlayState, decodeOverlayState, createDefaultConfig } from './overlayState';
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
import './OverlayBuilder.css';

export default function OverlayBuilder() {
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.has('edit');
  const encodedState = searchParams.get('v');

  const [config, setConfig] = useState<OverlayConfig>(() => {
    if (encodedState) {
      const decoded = decodeOverlayState(encodedState);
      if (decoded) return decoded;
    }
    return createDefaultConfig();
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { message: toastMessage, showToast } = useToast();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [sidebarWidth, setSidebarWidth] = useState(340);
  const resizingRef = useRef(false);

  // WebSocket status
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>(
    kalshiWs.isConnected ? 'connected' : 'disconnected'
  );

  // Listen to WebSocket status changes
  useEffect(() => {
    return kalshiWs.onStatus(setWsStatus);
  }, []);

  // Auto-connect WebSocket (proxy handles auth via env vars)
  useEffect(() => {
    if (kalshiWs.isConnected) return;
    kalshiWs.connect();
  }, []);

  // Track resize of canvas container
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

  // Collect market tickers for polling from any element that uses market data.
  // Deduplicate by ticker, and set fetchTrades=true if any element needs trades.
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
      // Fallback: show URL in prompt
      window.prompt('Copy this URL for OBS:', url);
    });
  }, [config, showToast]);

  // Keyboard shortcuts
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

  // Viewer mode — full screen, no chrome
  if (!isEditMode) {
    return (
      <div className="overlay-viewer">
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
    <div className="overlay-builder" style={{ gridTemplateColumns: `${sidebarWidth}px 0px 1fr` }}>
      <div className="overlay-builder__editor">
        <OverlayEditor
          config={config}
          selectedId={selectedId}
          wsStatus={wsStatus}
          onConfigChange={setConfig}
          onSelect={setSelectedId}
          onCopyLink={handleCopyLink}
        />
      </div>
      <div className="overlay-builder__resize-handle" onPointerDown={handleResizeStart} />
      <div className="overlay-builder__canvas" ref={canvasContainerRef} onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}>
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
