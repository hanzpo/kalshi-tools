import { useRef, useState, useEffect } from 'react';

interface TrendDrawerProps {
  onComplete: (trendData: number[]) => void;
  onCancel: () => void;
}

export function TrendDrawer({ onComplete, onCancel }: TrendDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw percentage labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px Kalshi Sans, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * canvas.height;
      const percentage = 100 - (i * 10);
      ctx.fillText(`${percentage}%`, canvas.width - 5, y + 4);
    }

    // Draw points
    if (points.length > 1) {
      ctx.strokeStyle = '#00DD94';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }

    // Draw cursor crosshair + percentage tooltip
    if (cursorPos) {
      const pct = Math.round(((canvas.height - cursorPos.y) / canvas.height) * 100);
      const clamped = Math.max(0, Math.min(100, pct));

      // Horizontal guide line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, cursorPos.y);
      ctx.lineTo(canvas.width, cursorPos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tooltip pill
      const label = `${clamped}%`;
      ctx.font = 'bold 12px Kalshi Sans, sans-serif';
      const textWidth = ctx.measureText(label).width;
      const pillW = textWidth + 12;
      const pillH = 22;
      const pillX = Math.min(cursorPos.x + 12, canvas.width - pillW - 4);
      const pillY = Math.max(cursorPos.y - pillH - 6, 4);

      ctx.fillStyle = '#00DD94';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 4);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(label, pillX + 6, pillY + 16);
    }
  }, [points, cursorPos]);

  function getCanvasCoordinates(
    e: React.MouseEvent<HTMLCanvasElement> | React.Touch,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return {
      x: Math.max(0, Math.min(canvas.width, x)),
      y: Math.max(0, Math.min(canvas.height, y))
    };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoordinates(e, canvas);
    setPoints([coords]);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoordinates(e, canvas);
    setCursorPos(coords);

    if (isDrawing) {
      setPoints((prev) => [...prev, coords]);
    }
  }

  function handleMouseUp() {
    setIsDrawing(false);
  }

  function handleMouseLeave() {
    setIsDrawing(false);
    setCursorPos(null);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch, canvas);
    setPoints([coords]);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch, canvas);
    setCursorPos(coords);
    setPoints((prev) => [...prev, coords]);
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setIsDrawing(false);
    setCursorPos(null);
  }

  function handleClear() {
    setPoints([]);
  }

  function handleApply() {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) {
      alert('Please draw a trend line first!');
      return;
    }

    // Convert points to percentage values (100 data points)
    const numPoints = 100;
    const trendData: number[] = [];

    // Sort points by x coordinate
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);

    // Remove duplicate x coordinates, keep first occurrence
    const uniquePoints: { x: number; y: number }[] = [];
    let lastX = -1;
    for (const point of sortedPoints) {
      if (point.x !== lastX) {
        uniquePoints.push(point);
        lastX = point.x;
      }
    }

    for (let i = 0; i < numPoints; i++) {
      const targetX = (i / (numPoints - 1)) * canvas.width;

      // Find the two closest points for interpolation
      let p1 = uniquePoints[0];
      let p2 = uniquePoints[uniquePoints.length - 1];

      for (let j = 0; j < uniquePoints.length - 1; j++) {
        if (uniquePoints[j].x <= targetX && uniquePoints[j + 1].x >= targetX) {
          p1 = uniquePoints[j];
          p2 = uniquePoints[j + 1];
          break;
        }
      }

      // Interpolate between the two points
      let y: number;
      if (p1.x === p2.x || p2.x - p1.x === 0) {
        y = p1.y;
      } else {
        const t = (targetX - p1.x) / (p2.x - p1.x);
        y = p1.y + t * (p2.y - p1.y);
      }

      // Convert y coordinate to percentage (0-100)
      // Canvas y goes from 0 (top) to height (bottom)
      // We want 0% at bottom, 100% at top
      const percentage = ((canvas.height - y) / canvas.height) * 100;
      const clampedPercentage = Math.max(0, Math.min(100, percentage));
      trendData.push(clampedPercentage);
    }

    onComplete(trendData);
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-5">
      <div className="flex max-h-[90vh] max-w-[90vw] flex-col gap-5 rounded-xl bg-[#1e1e1e] p-7 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] max-md:p-5">
        <h3 className="m-0 text-xl font-semibold tracking-[-0.2px] text-[#f3f4f6]">Draw Your Trend</h3>
        <p className="m-0 text-sm text-[#9ca3af]">
          Click and drag to draw a line from left to right showing your custom market trend
        </p>

        <div className="overflow-hidden rounded-lg border-2 border-[#333] bg-[#141414] max-md:max-w-full">
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            className="block h-auto w-full cursor-crosshair touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        <div className="flex justify-between gap-3 max-md:flex-col">
          <button
            onClick={handleClear}
            className="cursor-pointer rounded-lg border border-dark-border-light bg-dark-elevated px-[22px] py-[11px] text-[15px] font-semibold text-text-primary transition-all duration-200 hover:border-brand/30 hover:bg-dark-border-light max-md:flex-1"
          >
            Clear
          </button>
          <div className="flex gap-3 max-md:w-full">
            <button
              onClick={onCancel}
              className="cursor-pointer rounded-lg border border-dark-border-light bg-dark-elevated px-[22px] py-[11px] text-[15px] font-semibold text-text-primary transition-all duration-200 hover:border-brand/30 hover:bg-dark-border-light max-md:flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="cursor-pointer rounded-lg border-none bg-[#00DD94] px-[22px] py-[11px] text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#00BB7D] hover:shadow-[0_2px_8px_rgba(0,221,148,0.25)] max-md:flex-1"
            >
              Apply Trend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
