import React from 'react';
import { registerElement } from './registry';

export interface ShapeProps {
  type: 'shape';
  shapeType: 'rectangle' | 'line';
  color: string;
  opacity: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
}

function ShapeRenderer({ props, width, height }: { props: ShapeProps; width: number; height: number }) {
  if (props.shapeType === 'line') {
    return (
      <div style={{ width, height: Math.max(height, 2), display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', height: props.borderWidth || 2, backgroundColor: props.color, opacity: props.opacity, borderRadius: props.borderRadius }} />
      </div>
    );
  }
  return (
    <div style={{
      width, height, backgroundColor: props.color, opacity: props.opacity,
      borderRadius: props.borderRadius,
      border: props.borderWidth ? `${props.borderWidth}px solid ${props.borderColor}` : 'none',
      boxSizing: 'border-box',
    }} />
  );
}

function ShapePropsEditor({ props, onChange }: { props: ShapeProps; onChange: (p: ShapeProps) => void }) {
  return (
    <div className="oe-props">
      <div className="oe-row">
        <div className="oe-field">
          <span className="oe-field-label">Type</span>
          <select className="oe-select" value={props.shapeType} onChange={e => onChange({ ...props, shapeType: e.target.value as any })}>
            <option value="rectangle">Rectangle</option>
            <option value="line">Line</option>
          </select>
        </div>
        <div className="oe-field">
          <span className="oe-field-label">Color</span>
          <input type="text" className="oe-input oe-input--sm" value={props.color} placeholder="rgba(0,0,0,0.5)" onChange={e => onChange({ ...props, color: e.target.value })} />
        </div>
      </div>
      <div className="oe-row">
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

registerElement<ShapeProps>({
  type: 'shape',
  label: 'Shape',
  layerLabel: (p) => p.shapeType,
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
  ),
  defaults: {
    width: 400, height: 200, zIndex: 0,
    props: { type: 'shape', shapeType: 'rectangle', color: 'rgba(0,0,0,0.6)', opacity: 1, borderRadius: 0, borderWidth: 0, borderColor: 'transparent' },
  },
  Renderer: ShapeRenderer,
  PropsEditor: ShapePropsEditor,
});
