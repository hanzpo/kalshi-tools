import { useRef, useMemo, memo, useState, useCallback } from 'react';
import { OverlayConfig, OverlayElement, MarketLiveData } from './types';
import { DraggableElement, Guide, SnapFn } from './DraggableElement';
import { getElementDef } from './elements';

const SNAP_THRESHOLD = 5;

interface OverlayCanvasProps {
  config: OverlayConfig;
  editMode: boolean;
  selectedId: string | null;
  guidesEnabled: boolean;
  marketData: Record<string, MarketLiveData>;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  containerWidth?: number;
}

/** Memoized wrapper so element renderers only re-render when their own data changes */
const MemoElement = memo(function MemoElement({ el, marketData }: {
  el: OverlayElement;
  marketData: Record<string, MarketLiveData>;
}) {
  const def = getElementDef(el.type);
  if (!def) return null;
  const Renderer = def.Renderer;
  const liveData = def.usesMarketData ? marketData[el.props.ticker] : undefined;
  return <Renderer props={el.props} width={el.width} height={el.height} liveData={liveData} />;
});

export function OverlayCanvas({
  config,
  editMode,
  selectedId,
  guidesEnabled,
  marketData,
  onSelect,
  onMove,
  onResize,
  containerWidth,
}: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeGuides, setActiveGuides] = useState<Guide[]>([]);

  // Use ref so snap callback stays stable while reading latest elements
  const elementsRef = useRef(config.elements);
  elementsRef.current = config.elements;

  const scale = useMemo(() => {
    if (!containerWidth) return 1;
    return Math.min(1, containerWidth / config.width);
  }, [containerWidth, config.width]);

  const snapFn: SnapFn | undefined = useMemo(() => {
    if (!guidesEnabled || !editMode) return undefined;

    return (id: string, x: number, y: number, w: number, h: number) => {
      const elements = elementsRef.current;
      const cw = config.width;
      const ch = config.height;

      // Collect snap targets from other elements + canvas edges/center
      const xTargets: number[] = [0, Math.round(cw / 2), cw];
      const yTargets: number[] = [0, Math.round(ch / 2), ch];

      for (const el of elements) {
        if (el.id === id) continue;
        xTargets.push(el.x, el.x + el.width, Math.round(el.x + el.width / 2));
        yTargets.push(el.y, el.y + el.height, Math.round(el.y + el.height / 2));
      }

      // Dragged element edges
      const dragEdgesX = [x, x + w, Math.round(x + w / 2)];
      const dragEdgesY = [y, y + h, Math.round(y + h / 2)];

      // Find best X snap
      let bestXOffset = Infinity;
      for (const dragEdge of dragEdgesX) {
        for (const target of xTargets) {
          const offset = target - dragEdge;
          if (Math.abs(offset) < Math.abs(bestXOffset)) {
            bestXOffset = offset;
          }
        }
      }

      // Find best Y snap
      let bestYOffset = Infinity;
      for (const dragEdge of dragEdgesY) {
        for (const target of yTargets) {
          const offset = target - dragEdge;
          if (Math.abs(offset) < Math.abs(bestYOffset)) {
            bestYOffset = offset;
          }
        }
      }

      // Apply threshold
      const snappedX = Math.abs(bestXOffset) <= SNAP_THRESHOLD ? x + bestXOffset : x;
      const snappedY = Math.abs(bestYOffset) <= SNAP_THRESHOLD ? y + bestYOffset : y;

      // Collect visible guides from snapped position
      const guides: Guide[] = [];
      const finalEdgesX = [snappedX, snappedX + w, Math.round(snappedX + w / 2)];
      const finalEdgesY = [snappedY, snappedY + h, Math.round(snappedY + h / 2)];

      if (snappedX !== x) {
        const seen = new Set<number>();
        for (const target of xTargets) {
          if (seen.has(target)) continue;
          if (finalEdgesX.some(e => Math.abs(e - target) < 1)) {
            seen.add(target);
            guides.push({ type: 'v', pos: target });
          }
        }
      }
      if (snappedY !== y) {
        const seen = new Set<number>();
        for (const target of yTargets) {
          if (seen.has(target)) continue;
          if (finalEdgesY.some(e => Math.abs(e - target) < 1)) {
            seen.add(target);
            guides.push({ type: 'h', pos: target });
          }
        }
      }

      return { x: snappedX, y: snappedY, guides };
    };
  }, [guidesEnabled, editMode, config.width, config.height]);

  const handleGuidesChange = useCallback((guides: Guide[]) => {
    setActiveGuides(guides);
  }, []);

  const bgStyle = useMemo((): React.CSSProperties => {
    if (config.background.type === 'transparent') {
      return editMode
        ? {
            backgroundImage: `
              linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
              linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
              linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            backgroundColor: '#252525',
          }
        : { backgroundColor: 'transparent' };
    }
    if (config.background.type === 'gradient' && config.background.gradient) {
      return { background: config.background.gradient };
    }
    return { backgroundColor: config.background.color || '#000000' };
  }, [config.background, editMode]);

  return (
    <div
      style={{
        width: config.width * scale,
        height: config.height * scale,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: editMode ? 8 : 0,
        border: editMode ? '1px solid #333' : 'none',
        flexShrink: 0,
      }}
      onClick={(e) => {
        if (editMode && e.target === e.currentTarget) onSelect(null);
      }}
    >
      <div
        ref={canvasRef}
        id="overlay-canvas"
        style={{
          width: config.width,
          height: config.height,
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          ...bgStyle,
        }}
        onClick={(e) => {
          if (editMode && e.target === e.currentTarget) onSelect(null);
        }}
      >
        {config.elements.map((el) => (
          editMode ? (
            <DraggableElement
              key={el.id}
              element={el}
              selected={selectedId === el.id}
              editMode={editMode}
              scale={scale}
              snap={snapFn}
              onSelect={onSelect}
              onMove={onMove}
              onResize={onResize}
              onGuidesChange={handleGuidesChange}
            >
              <MemoElement el={el} marketData={marketData} />
            </DraggableElement>
          ) : (
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
              <MemoElement el={el} marketData={marketData} />
            </div>
          )
        ))}

        {/* Snap guide lines */}
        {activeGuides.map((g, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: g.type === 'v' ? g.pos : 0,
              top: g.type === 'h' ? g.pos : 0,
              width: g.type === 'v' ? 1 : '100%',
              height: g.type === 'h' ? 1 : '100%',
              background: '#00DD94',
              opacity: 0.6,
              zIndex: 99999,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
