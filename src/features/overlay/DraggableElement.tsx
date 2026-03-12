import { useRef, useCallback, useState, useEffect } from 'react';
import { OverlayElement } from './types';

interface DraggableElementProps {
  element: OverlayElement;
  selected: boolean;
  editMode: boolean;
  scale: number;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  children: React.ReactNode;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

export function DraggableElement({
  element,
  selected,
  editMode,
  scale,
  onSelect,
  onMove,
  onResize,
  children,
}: DraggableElementProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    type: 'move' | 'resize';
    handle?: ResizeHandle;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!editMode) return;
    e.stopPropagation();
    onSelect(element.id);

    dragState.current = {
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
      origW: element.width,
      origH: element.height,
    };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [editMode, element, onSelect]);

  const handleResizeDown = useCallback((e: React.PointerEvent, handle: ResizeHandle) => {
    if (!editMode) return;
    e.stopPropagation();
    e.preventDefault();

    dragState.current = {
      type: 'resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
      origW: element.width,
      origH: element.height,
    };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [editMode, element]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = (e.clientX - dragState.current.startX) / scale;
    const dy = (e.clientY - dragState.current.startY) / scale;

    if (dragState.current.type === 'move') {
      onMove(element.id, Math.round(dragState.current.origX + dx), Math.round(dragState.current.origY + dy));
    } else if (dragState.current.type === 'resize' && dragState.current.handle) {
      const h = dragState.current.handle;
      let newW = dragState.current.origW;
      let newH = dragState.current.origH;
      let newX = dragState.current.origX;
      let newY = dragState.current.origY;

      if (h.includes('e')) newW = Math.max(40, dragState.current.origW + dx);
      if (h.includes('w')) {
        newW = Math.max(40, dragState.current.origW - dx);
        newX = dragState.current.origX + (dragState.current.origW - newW);
      }
      if (h.includes('s')) newH = Math.max(20, dragState.current.origH + dy);
      if (h.includes('n')) {
        newH = Math.max(20, dragState.current.origH - dy);
        newY = dragState.current.origY + (dragState.current.origH - newH);
      }

      onMove(element.id, Math.round(newX), Math.round(newY));
      onResize(element.id, Math.round(newW), Math.round(newH));
    }
  }, [element.id, scale, onMove, onResize]);

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
    setIsDragging(false);
  }, []);

  // Handle keyboard delete
  useEffect(() => {
    if (!selected || !editMode) return;
    // Keyboard handling is done at the parent level
  }, [selected, editMode]);

  const handles: ResizeHandle[] = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
  const handleSize = 8;

  const getHandleStyle = (handle: ResizeHandle): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: handleSize,
      height: handleSize,
      background: '#09C285',
      border: '1px solid #fff',
      borderRadius: 2,
      zIndex: 9999,
      pointerEvents: 'auto',
    };
    switch (handle) {
      case 'nw': return { ...base, top: -handleSize / 2, left: -handleSize / 2, cursor: 'nw-resize' };
      case 'ne': return { ...base, top: -handleSize / 2, right: -handleSize / 2, cursor: 'ne-resize' };
      case 'sw': return { ...base, bottom: -handleSize / 2, left: -handleSize / 2, cursor: 'sw-resize' };
      case 'se': return { ...base, bottom: -handleSize / 2, right: -handleSize / 2, cursor: 'se-resize' };
      case 'n': return { ...base, top: -handleSize / 2, left: '50%', marginLeft: -handleSize / 2, cursor: 'n-resize' };
      case 's': return { ...base, bottom: -handleSize / 2, left: '50%', marginLeft: -handleSize / 2, cursor: 's-resize' };
      case 'e': return { ...base, right: -handleSize / 2, top: '50%', marginTop: -handleSize / 2, cursor: 'e-resize' };
      case 'w': return { ...base, left: -handleSize / 2, top: '50%', marginTop: -handleSize / 2, cursor: 'w-resize' };
    }
  };

  return (
    <div
      ref={elRef}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
        cursor: editMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
        outline: selected && editMode ? '2px solid #09C285' : 'none',
        outlineOffset: 1,
        userSelect: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {children}
      {selected && editMode && handles.map(h => (
        <div
          key={h}
          style={getHandleStyle(h)}
          onPointerDown={(e) => handleResizeDown(e, h)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      ))}
    </div>
  );
}
