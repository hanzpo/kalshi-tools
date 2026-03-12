import React from 'react';
import { registerElement } from './registry';

export interface DisclaimerProps {
  type: 'disclaimer';
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
}

const DEFAULT_DISCLAIMER = 'Restrictions and eligibility requirements apply. Event contract trading involves significant risk and is not appropriate for everyone. Please carefully consider if it\u2019s appropriate for you in light of your personal financial circumstances. Prices may not be live and are subject to change. See kalshi.com/regulatory for more information. Federally regulated event contract exchange. Users over the age of 18 are able to register and trade.';

function DisclaimerRenderer({ props, width, height }: {
  props: DisclaimerProps; width: number; height: number;
}) {
  return (
    <div style={{
      width, height, fontSize: props.fontSize || 9, color: props.color || '#ffffff',
      opacity: props.opacity ?? 0.3, fontFamily: 'Inter, sans-serif', lineHeight: 1.4,
      overflow: 'hidden', boxSizing: 'border-box', padding: '4px 0',
    }}>
      {props.text}
    </div>
  );
}

function DisclaimerPropsEditor({ props, onChange }: { props: DisclaimerProps; onChange: (p: DisclaimerProps) => void }) {
  return (
    <div className="oe-props">
      <div className="oe-field oe-field--full">
        <span className="oe-field-label">Text</span>
        <textarea className="oe-input" rows={3} value={props.text} onChange={e => onChange({ ...props, text: e.target.value })} style={{ resize: 'vertical', minHeight: 50 }} />
      </div>
      <div className="oe-row">
        <div className="oe-field">
          <span className="oe-field-label">Size</span>
          <input type="number" className="oe-input oe-input--sm" value={props.fontSize || 9} min={6} max={16} onChange={e => onChange({ ...props, fontSize: parseInt(e.target.value) || 9 })} />
        </div>
        <div className="oe-field">
          <span className="oe-field-label">Color</span>
          <input type="color" className="oe-color" value={props.color || '#ffffff'} onChange={e => onChange({ ...props, color: e.target.value })} />
        </div>
        <div className="oe-field">
          <span className="oe-field-label">Opacity</span>
          <input type="range" min={0} max={1} step={0.05} value={props.opacity ?? 0.3} onChange={e => onChange({ ...props, opacity: parseFloat(e.target.value) })} />
        </div>
      </div>
    </div>
  );
}

registerElement<DisclaimerProps>({
  type: 'disclaimer',
  label: 'Disclaimer',
  layerLabel: () => 'Disclaimer',
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
    React.createElement('path', { d: 'M12 8v4' }),
    React.createElement('path', { d: 'M12 16h.01' }),
  ),
  defaults: {
    width: 900, height: 40, zIndex: 0,
    props: {
      type: 'disclaimer', text: DEFAULT_DISCLAIMER,
      fontSize: 9, color: '#ffffff', opacity: 0.3,
    },
  },
  Renderer: DisclaimerRenderer,
  PropsEditor: DisclaimerPropsEditor,
});
