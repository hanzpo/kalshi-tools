import React, { useRef, useState, useEffect } from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';

export interface ImageProps {
  type: 'image';
  src: string;
  objectFit: 'contain' | 'cover';
  opacity: number;
  borderRadius: number;
  // Effects
  grayscale: number;
  brightness: number;
  contrast: number;
  stipple: boolean;
  stippleDotSize: number;
  stippleSpacing: number;
  tintColor: string;
  tintOpacity: number;
  tintBlendMode: string;
}

/* ---- helpers ---- */

function readFileAsDataUrl(file: File, maxDim = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { naturalWidth: w, naturalHeight: h } = img;
        if (Math.max(w, h) > maxDim) {
          const s = maxDim / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function processStipple(img: HTMLImageElement, dotSize: number, spacing: number): string {
  const MAX = 2000;
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (Math.max(w, h) > MAX) {
    const s = MAX / Math.max(w, h);
    w = Math.round(w * s);
    h = Math.round(h * s);
  }

  // Draw source on white background to get luminance data
  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  const sctx = src.getContext('2d')!;
  sctx.fillStyle = '#fff';
  sctx.fillRect(0, 0, w, h);
  sctx.drawImage(img, 0, 0, w, h);
  const { data } = sctx.getImageData(0, 0, w, h);

  // Output canvas: white background with black halftone dots
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#000';

  const sp = Math.max(2, spacing);
  for (let y = 0; y < h; y += sp) {
    for (let x = 0; x < w; x += sp) {
      let total = 0, count = 0;
      for (let dy = 0; dy < sp && y + dy < h; dy++) {
        for (let dx = 0; dx < sp && x + dx < w; dx++) {
          const i = ((y + dy) * w + (x + dx)) * 4;
          total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          count++;
        }
      }
      const r = dotSize * (1 - total / count / 255);
      if (r > 0.4) {
        ctx.beginPath();
        ctx.arc(x + sp / 2, y + sp / 2, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return out.toDataURL('image/png');
}

/* ---- renderer ---- */

function ImageRenderer({ props, width, height }: { props: ImageProps; width: number; height: number }) {
  const [stippleUrl, setStippleUrl] = useState('');
  const [processing, setProcessing] = useState(false);

  // Process stipple with debounce so slider drags don't thrash
  useEffect(() => {
    if (!props.stipple || !props.src) { setStippleUrl(''); return; }
    setProcessing(true);
    const tid = setTimeout(() => {
      const img = new Image();
      if (!props.src.startsWith('data:')) img.crossOrigin = 'anonymous';
      img.onload = () => {
        try { setStippleUrl(processStipple(img, props.stippleDotSize ?? 3, props.stippleSpacing ?? 6)); }
        catch { setStippleUrl(''); }
        setProcessing(false);
      };
      img.onerror = () => { setStippleUrl(''); setProcessing(false); };
      img.src = props.src;
    }, 150);
    return () => clearTimeout(tid);
  }, [props.src, props.stipple, props.stippleDotSize, props.stippleSpacing]);

  if (!props.src) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: props.borderRadius, border: '2px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
        No image
      </div>
    );
  }

  const displaySrc = props.stipple && stippleUrl ? stippleUrl : props.src;

  // CSS filters (greyscale only when stipple is off — stipple already converts to B&W)
  const filters: string[] = [];
  if (!props.stipple && (props.grayscale ?? 0) > 0) filters.push(`grayscale(${props.grayscale})`);
  if ((props.brightness ?? 1) !== 1) filters.push(`brightness(${props.brightness})`);
  if ((props.contrast ?? 1) !== 1) filters.push(`contrast(${props.contrast})`);
  const hasTint = (props.tintOpacity ?? 0) > 0;

  return (
    <div style={{ width, height, position: 'relative', borderRadius: props.borderRadius, overflow: 'hidden' }}>
      {processing && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, zIndex: 2, fontFamily: 'Inter, sans-serif' }}>
          Processing…
        </div>
      )}
      <img
        src={displaySrc}
        alt=""
        style={{ width, height, objectFit: props.objectFit, opacity: props.opacity, filter: filters.length ? filters.join(' ') : undefined, display: 'block' }}
        crossOrigin="anonymous"
      />
      {hasTint && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: props.tintColor, opacity: props.tintOpacity, mixBlendMode: (props.tintBlendMode || 'multiply') as React.CSSProperties['mixBlendMode'], pointerEvents: 'none' }} />
      )}
    </div>
  );
}

/* ---- props editor ---- */

function ImagePropsEditor({ props, onChange }: { props: ImageProps; onChange: (p: ImageProps) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = await readFileAsDataUrl(file);
    onChange({ ...props, src: url });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isDataUrl = props.src.startsWith('data:');
  const gs = props.grayscale ?? 0;
  const br = props.brightness ?? 1;
  const ct = props.contrast ?? 1;
  const stipple = props.stipple ?? false;
  const dotSize = props.stippleDotSize ?? 3;
  const spacing = props.stippleSpacing ?? 6;
  const tintColor = props.tintColor ?? '#00DD94';
  const tintOp = props.tintOpacity ?? 0;
  const tintBlend = props.tintBlendMode ?? 'multiply';

  return (
    <div className={oe.props}>
      {/* Upload drop zone */}
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>Image</span>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#00DD94' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 8, padding: '10px 12px', textAlign: 'center', cursor: 'pointer',
            background: dragging ? 'rgba(9,194,133,0.05)' : 'rgba(255,255,255,0.02)',
            fontSize: 12, color: 'rgba(255,255,255,0.5)', transition: 'all 150ms',
          }}
        >
          {props.src ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <img src={props.src} alt="" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
              <span>Replace: drop or click</span>
            </div>
          ) : 'Drop image here or click to browse'}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        </div>
      </div>

      {/* URL input */}
      <div className={oe.fieldFull}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={oe.fieldLabel}>or URL</span>
          {props.src && <button type="button" onClick={() => onChange({ ...props, src: '' })} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 10, cursor: 'pointer', padding: '0 2px' }}>Clear</button>}
        </div>
        <input type="text" className={oe.input} placeholder={isDataUrl ? '(uploaded image)' : 'https://...'} value={isDataUrl ? '' : props.src} onChange={e => onChange({ ...props, src: e.target.value })} />
      </div>

      {/* Fit / Opacity / Radius */}
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Fit</span>
          <select className={oe.select} value={props.objectFit} onChange={e => onChange({ ...props, objectFit: e.target.value as 'contain' | 'cover' })}>
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
          </select>
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Opacity</span>
          <input type="range" min={0} max={1} step={0.05} value={props.opacity} onChange={e => onChange({ ...props, opacity: parseFloat(e.target.value) })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Radius</span>
          <input type="number" className={oe.inputSm} value={props.borderRadius} min={0} onChange={e => onChange({ ...props, borderRadius: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      {/* ---- Effects ---- */}
      {props.src && (
        <>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0 0', paddingTop: 8 }}>
            <span className={oe.fieldLabel} style={{ display: 'block' }}>Effects</span>
          </div>

          {/* Greyscale */}
          <div className={oe.row}>
            <div className={oe.field}>
              <span className={oe.fieldLabel}>Greyscale{gs > 0 ? ` ${Math.round(gs * 100)}%` : ''}</span>
              <input type="range" min={0} max={1} step={0.05} value={gs} onChange={e => onChange({ ...props, grayscale: parseFloat(e.target.value) })} />
            </div>
          </div>

          {/* Brightness / Contrast */}
          <div className={oe.row}>
            <div className={oe.field}>
              <span className={oe.fieldLabel}>Brightness{br !== 1 ? ` ${Math.round(br * 100)}%` : ''}</span>
              <input type="range" min={0} max={2} step={0.05} value={br} onChange={e => onChange({ ...props, brightness: parseFloat(e.target.value) })} />
            </div>
            <div className={oe.field}>
              <span className={oe.fieldLabel}>Contrast{ct !== 1 ? ` ${Math.round(ct * 100)}%` : ''}</span>
              <input type="range" min={0} max={2} step={0.05} value={ct} onChange={e => onChange({ ...props, contrast: parseFloat(e.target.value) })} />
            </div>
          </div>

          {/* Stipple / Halftone */}
          <div className={oe.row}>
            <label className={oe.checkbox}>
              <input type="checkbox" checked={stipple} onChange={e => onChange({ ...props, stipple: e.target.checked })} />
              Halftone / Stipple
            </label>
          </div>
          {stipple && (
            <div className={oe.row}>
              <div className={oe.field}>
                <span className={oe.fieldLabel}>Dot size</span>
                <input type="range" min={1} max={8} step={0.5} value={dotSize} onChange={e => onChange({ ...props, stippleDotSize: parseFloat(e.target.value) })} />
              </div>
              <div className={oe.field}>
                <span className={oe.fieldLabel}>Spacing</span>
                <input type="range" min={3} max={20} step={1} value={spacing} onChange={e => onChange({ ...props, stippleSpacing: parseInt(e.target.value) })} />
              </div>
            </div>
          )}

          {/* Color Tint */}
          <div className={oe.row}>
            <div className={oe.field} style={{ flex: '0 0 auto' }}>
              <span className={oe.fieldLabel}>Tint</span>
              <input type="color" className={oe.color} value={tintColor} onChange={e => onChange({ ...props, tintColor: e.target.value })} />
            </div>
            <div className={oe.field}>
              <span className={oe.fieldLabel}>Tint{tintOp > 0 ? ` ${Math.round(tintOp * 100)}%` : ''}</span>
              <input type="range" min={0} max={1} step={0.05} value={tintOp} onChange={e => onChange({ ...props, tintOpacity: parseFloat(e.target.value) })} />
            </div>
            <div className={oe.field}>
              <span className={oe.fieldLabel}>Blend</span>
              <select className={oe.select} value={tintBlend} onChange={e => onChange({ ...props, tintBlendMode: e.target.value })}>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="color">Color</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

registerElement<ImageProps>({
  type: 'image',
  label: 'Image',
  layerLabel: () => 'Image',
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
    React.createElement('circle', { cx: 8.5, cy: 8.5, r: 1.5 }),
    React.createElement('path', { d: 'M21 15l-5-5L5 21' }),
  ),
  defaults: {
    width: 200, height: 200, zIndex: 1,
    props: {
      type: 'image', src: '', objectFit: 'contain', opacity: 1, borderRadius: 0,
      grayscale: 0, brightness: 1, contrast: 1,
      stipple: false, stippleDotSize: 3, stippleSpacing: 6,
      tintColor: '#00DD94', tintOpacity: 0, tintBlendMode: 'multiply',
    },
  },
  Renderer: ImageRenderer,
  PropsEditor: ImagePropsEditor,
});
