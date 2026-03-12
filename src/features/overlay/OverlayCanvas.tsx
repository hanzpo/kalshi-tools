import { useRef, useMemo } from 'react';
import { OverlayConfig, OverlayElement, MarketLiveData } from './types';
import { DraggableElement } from './DraggableElement';
import { getElementDef } from './elements';

interface OverlayCanvasProps {
  config: OverlayConfig;
  editMode: boolean;
  selectedId: string | null;
  marketData: Record<string, MarketLiveData>;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  containerWidth?: number;
}

function renderElement(
  el: OverlayElement,
  marketData: Record<string, MarketLiveData>,
) {
  const def = getElementDef(el.type);
  if (!def) return null;

  const Renderer = def.Renderer;
  const liveData = def.usesMarketData ? marketData[el.props.ticker] : undefined;
  return <Renderer props={el.props} width={el.width} height={el.height} liveData={liveData} />;
}

export function OverlayCanvas({
  config,
  editMode,
  selectedId,
  marketData,
  onSelect,
  onMove,
  onResize,
  containerWidth,
}: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const scale = useMemo(() => {
    if (!containerWidth) return 1;
    return Math.min(1, containerWidth / config.width);
  }, [containerWidth, config.width]);

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
              onSelect={onSelect}
              onMove={onMove}
              onResize={onResize}
            >
              {renderElement(el, marketData)}
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
              {renderElement(el, marketData)}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
