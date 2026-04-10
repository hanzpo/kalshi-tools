import React from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';

export interface TextProps {
  type: 'text';
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  letterSpacing: number;
  textShadow: string;
  textTransform: 'none' | 'uppercase' | 'lowercase';
  fontStyle: 'normal' | 'italic';
  lineHeight: number;
  strokeColor: string;
  strokeWidth: number;
  fontFamily: string;
}

const FONT_OPTIONS = [
  { value: "'Kalshi Sans', sans-serif", label: 'Kalshi Sans' },
  { value: "'Sohne Schmal', 'Kalshi Sans', sans-serif", label: 'Söhne Schmal' },
  { value: "'Matricha', 'Kalshi Sans', sans-serif", label: 'Matricha' },
  { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue' },
  { value: "'Oswald', sans-serif", label: 'Oswald' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: "'Arial Black', sans-serif", label: 'Arial Black' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier New' },
];

function TextRenderer({ props, width, height }: { props: TextProps; width: number; height: number }) {
  const hasStroke = props.strokeWidth > 0 && props.strokeColor;
  return (
    <div style={{
      width, height, fontSize: props.fontSize, fontWeight: props.fontWeight,
      color: props.color, textAlign: props.textAlign, backgroundColor: props.backgroundColor,
      padding: props.padding, borderRadius: props.borderRadius, boxSizing: 'border-box',
      fontFamily: props.fontFamily || 'Kalshi Sans, sans-serif', lineHeight: props.lineHeight || 1.2,
      letterSpacing: props.letterSpacing || 0,
      textShadow: props.textShadow || 'none',
      textTransform: props.textTransform || 'none',
      fontStyle: props.fontStyle || 'normal',
      display: 'flex', alignItems: 'center',
      justifyContent: props.textAlign === 'center' ? 'center' : props.textAlign === 'right' ? 'flex-end' : 'flex-start',
      overflow: 'hidden', wordBreak: 'break-word',
      WebkitTextStroke: hasStroke ? `${props.strokeWidth}px ${props.strokeColor}` : undefined,
      paintOrder: hasStroke ? 'stroke fill' : undefined,
    } as React.CSSProperties}>
      {props.text}
    </div>
  );
}

function TextPropsEditor({ props, onChange }: { props: TextProps; onChange: (p: TextProps) => void }) {
  return (
    <div className={oe.props}>
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>Text</span>
        <input type="text" className={oe.input} value={props.text} onChange={e => onChange({ ...props, text: e.target.value })} />
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Size</span>
          <input type="number" className={oe.inputSm} value={props.fontSize} min={8} max={400} onChange={e => onChange({ ...props, fontSize: parseInt(e.target.value) || 16 })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Weight</span>
          <select className={oe.select} value={props.fontWeight} onChange={e => onChange({ ...props, fontWeight: parseInt(e.target.value) })}>
            <option value={400}>Regular</option>
            <option value={600}>Semi Bold</option>
            <option value={700}>Bold</option>
            <option value={800}>Extra Bold</option>
            <option value={900}>Black</option>
          </select>
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Style</span>
          <select className={oe.select} value={props.fontStyle || 'normal'} onChange={e => onChange({ ...props, fontStyle: e.target.value as any })}>
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Font</span>
          <select className={oe.select} value={props.fontFamily || 'Kalshi Sans, sans-serif'} onChange={e => onChange({ ...props, fontFamily: e.target.value })}>
            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Color</span>
          <input type="color" className={oe.color} value={props.color} onChange={e => onChange({ ...props, color: e.target.value })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Align</span>
          <select className={oe.select} value={props.textAlign} onChange={e => onChange({ ...props, textAlign: e.target.value as any })}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Transform</span>
          <select className={oe.select} value={props.textTransform || 'none'} onChange={e => onChange({ ...props, textTransform: e.target.value as any })}>
            <option value="none">None</option>
            <option value="uppercase">UPPER</option>
            <option value="lowercase">lower</option>
          </select>
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Spacing</span>
          <input type="number" className={oe.inputSm} value={props.letterSpacing || 0} step={0.5} onChange={e => onChange({ ...props, letterSpacing: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Line Height</span>
          <input type="number" className={oe.inputSm} value={props.lineHeight || 1.2} step={0.1} min={0.5} max={3} onChange={e => onChange({ ...props, lineHeight: parseFloat(e.target.value) || 1.2 })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Background</span>
          <input type="text" className={oe.inputSm} value={props.backgroundColor} placeholder="transparent" onChange={e => onChange({ ...props, backgroundColor: e.target.value })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Shadow</span>
          <input type="text" className={oe.input} value={props.textShadow || ''} placeholder="2px 2px 4px #000" onChange={e => onChange({ ...props, textShadow: e.target.value })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Stroke</span>
          <input type="number" className={oe.inputSm} value={props.strokeWidth || 0} min={0} max={20} onChange={e => onChange({ ...props, strokeWidth: parseInt(e.target.value) || 0 })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Stroke Color</span>
          <input type="color" className={oe.color} value={props.strokeColor || '#000000'} onChange={e => onChange({ ...props, strokeColor: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

registerElement<TextProps>({
  type: 'text',
  label: 'Text',
  layerLabel: (p) => p.text.slice(0, 20) || 'Empty',
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('path', { d: 'M4 7V4h16v3' }),
    React.createElement('path', { d: 'M12 4v16' }),
    React.createElement('path', { d: 'M8 20h8' }),
  ),
  defaults: {
    width: 300, height: 60, zIndex: 1,
    props: { type: 'text', text: 'Headline Text', fontSize: 32, fontWeight: 700, color: '#ffffff', textAlign: 'left', backgroundColor: 'transparent', padding: 8, borderRadius: 0, letterSpacing: 0, textShadow: '', textTransform: 'none', fontStyle: 'normal', lineHeight: 1.2, strokeColor: '#000000', strokeWidth: 0, fontFamily: 'Kalshi Sans, sans-serif' },
  },
  Renderer: TextRenderer,
  PropsEditor: TextPropsEditor,
});
