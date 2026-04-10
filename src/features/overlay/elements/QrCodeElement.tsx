import React from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';

export interface QrCodeProps {
  type: 'qr-code';
  url: string;
  fgColor: string;
  bgColor: string;
  padding: number;
  borderRadius: number;
}

/**
 * Simple QR code renderer using a public API.
 * For an OBS overlay this works well — it fetches a QR code image from
 * a free service. For production you'd bundle a QR library.
 */
function QrCodeRenderer({ props, width, height }: {
  props: QrCodeProps; width: number; height: number;
}) {
  const size = Math.min(width, height);

  if (!props.url) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: props.borderRadius, border: '2px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Kalshi Sans, sans-serif' }}>
        Enter URL for QR
      </div>
    );
  }

  // Use a deterministic QR API (no tracking, CORS-friendly)
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${Math.round(size)}x${Math.round(size)}&data=${encodeURIComponent(props.url)}&color=${props.fgColor.replace('#', '')}&bgcolor=${props.bgColor.replace('#', '')}&format=svg`;

  return (
    <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: props.padding, boxSizing: 'border-box', borderRadius: props.borderRadius, overflow: 'hidden' }}>
      <img src={qrSrc} alt="QR Code" style={{ width: size - props.padding * 2, height: size - props.padding * 2, borderRadius: props.borderRadius, display: 'block' }} crossOrigin="anonymous" />
    </div>
  );
}

function QrCodePropsEditor({ props, onChange }: { props: QrCodeProps; onChange: (p: QrCodeProps) => void }) {
  return (
    <div className={oe.props}>
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>URL</span>
        <input type="text" className={oe.input} placeholder="https://kalshi.com/markets/..." value={props.url} onChange={e => onChange({ ...props, url: e.target.value })} />
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>FG Color</span>
          <input type="color" className={oe.color} value={props.fgColor} onChange={e => onChange({ ...props, fgColor: e.target.value })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>BG Color</span>
          <input type="color" className={oe.color} value={props.bgColor} onChange={e => onChange({ ...props, bgColor: e.target.value })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Padding</span>
          <input type="number" className={oe.inputSm} value={props.padding} min={0} max={40} onChange={e => onChange({ ...props, padding: parseInt(e.target.value) || 0 })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Radius</span>
          <input type="number" className={oe.inputSm} value={props.borderRadius} min={0} onChange={e => onChange({ ...props, borderRadius: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
    </div>
  );
}

registerElement<QrCodeProps>({
  type: 'qr-code',
  label: 'QR Code',
  layerLabel: (p) => p.url ? 'QR' : 'No URL',
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('rect', { x: 3, y: 3, width: 7, height: 7 }),
    React.createElement('rect', { x: 14, y: 3, width: 7, height: 7 }),
    React.createElement('rect', { x: 3, y: 14, width: 7, height: 7 }),
    React.createElement('rect', { x: 14, y: 14, width: 3, height: 3 }),
    React.createElement('rect', { x: 18, y: 18, width: 3, height: 3 }),
    React.createElement('rect', { x: 18, y: 14, width: 3, height: 3 }),
    React.createElement('rect', { x: 14, y: 18, width: 3, height: 3 }),
  ),
  defaults: {
    width: 180, height: 180, zIndex: 5,
    props: {
      type: 'qr-code', url: '', fgColor: '#000000', bgColor: '#ffffff', padding: 8, borderRadius: 8,
    },
  },
  Renderer: QrCodeRenderer,
  PropsEditor: QrCodePropsEditor,
});
