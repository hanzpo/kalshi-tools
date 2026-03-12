import React from 'react';
import { registerElement } from './registry';

export interface ImageProps {
  type: 'image';
  src: string;
  objectFit: 'contain' | 'cover';
  opacity: number;
  borderRadius: number;
}

function ImageRenderer({ props, width, height }: { props: ImageProps; width: number; height: number }) {
  if (!props.src) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: props.borderRadius, border: '2px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
        No image
      </div>
    );
  }
  return (
    <img src={props.src} alt="" style={{ width, height, objectFit: props.objectFit, opacity: props.opacity, borderRadius: props.borderRadius, display: 'block' }} crossOrigin="anonymous" />
  );
}

function ImagePropsEditor({ props, onChange }: { props: ImageProps; onChange: (p: ImageProps) => void }) {
  return (
    <div className="oe-props">
      <div className="oe-field oe-field--full">
        <span className="oe-field-label">Image URL</span>
        <input type="text" className="oe-input" placeholder="https://..." value={props.src} onChange={e => onChange({ ...props, src: e.target.value })} />
      </div>
      <div className="oe-row">
        <div className="oe-field">
          <span className="oe-field-label">Fit</span>
          <select className="oe-select" value={props.objectFit} onChange={e => onChange({ ...props, objectFit: e.target.value as any })}>
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
          </select>
        </div>
        <div className="oe-field">
          <span className="oe-field-label">Opacity</span>
          <input type="range" min={0} max={1} step={0.05} value={props.opacity} onChange={e => onChange({ ...props, opacity: parseFloat(e.target.value) })} />
        </div>
        <div className="oe-field">
          <span className="oe-field-label">Radius</span>
          <input type="number" className="oe-input oe-input--sm" value={props.borderRadius} min={0} onChange={e => onChange({ ...props, borderRadius: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
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
    props: { type: 'image', src: '', objectFit: 'contain', opacity: 1, borderRadius: 0 },
  },
  Renderer: ImageRenderer,
  PropsEditor: ImagePropsEditor,
});
