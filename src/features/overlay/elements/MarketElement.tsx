import React, { useState } from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';
import { MarketLiveData } from '../types';
import { extractTicker } from '../useMarketData';

export interface MarketProps {
  type: 'market';
  ticker: string;
  marketUrl: string;
  pollInterval: number;
  showTitle: boolean;
  showVolume: boolean;
  accentColor: string;
}

// ---- Renderer ----

function MarketRenderer({ props, width, height, liveData }: {
  props: MarketProps; width: number; height: number; liveData?: MarketLiveData;
}) {
  // Scale everything from the bounding box (reference: 400x160)
  const s = Math.min(width / 400, height / 160);
  // Auto-detect layout: wide boxes use row layout, tall/square use column
  const isWide = width / height > 2.5;

  if (!props.ticker && !liveData) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '2px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        Paste a Kalshi market URL
      </div>
    );
  }

  if (liveData?.status === 'error') {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        Failed to load market
      </div>
    );
  }

  if (!liveData) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        Loading...
      </div>
    );
  }

  // Multi-outcome
  if (liveData.marketType === 'multi' && liveData.outcomes) {
    const maxOutcomes = Math.max(2, Math.floor((height - (props.showTitle ? 30 * s : 0) - (props.showVolume ? 20 * s : 0)) / (22 * s)));
    return (
      <div style={{ width, height, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', borderRadius: 12 * s, border: `1px solid ${props.accentColor}33`, padding: `${14 * s}px ${18 * s}px`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8 * s, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
        {props.showTitle && (
          <div style={{ fontSize: 15 * s, fontWeight: 600, color: '#ffffff', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {liveData.title}
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 * s, overflow: 'hidden' }}>
          {liveData.outcomes.slice(0, maxOutcomes).map((outcome, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 * s }}>
              <div style={{ flex: 1, fontSize: 13 * s, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{outcome.name}</div>
              <div style={{ fontSize: 14 * s, fontWeight: 700, color: props.accentColor, fontVariantNumeric: 'tabular-nums', minWidth: 40 * s, textAlign: 'right' }}>{outcome.odds}%</div>
              <div style={{ width: 70 * s, height: 7 * s, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ width: `${outcome.odds}%`, height: '100%', background: props.accentColor, borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
        {props.showVolume && (
          <div style={{ fontSize: 11 * s, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
            Vol: ${liveData.volume.toLocaleString()}
          </div>
        )}
      </div>
    );
  }

  // Binary market
  return (
    <div style={{ width, height, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', borderRadius: 12 * s, border: `1px solid ${props.accentColor}33`, padding: `${16 * s}px ${20 * s}px`, boxSizing: 'border-box', display: 'flex', flexDirection: isWide ? 'row' : 'column', alignItems: isWide ? 'center' : 'flex-start', gap: 12 * s, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <div style={{ fontSize: 48 * s, fontWeight: 800, color: props.accentColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1, flexShrink: 0 }}>
        {liveData.odds}<span style={{ fontSize: 28 * s, opacity: 0.7 }}>%</span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 * s, justifyContent: 'center' }}>
        {props.showTitle && (
          <div style={{ fontSize: 16 * s, fontWeight: 600, color: '#ffffff', opacity: 0.9, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: isWide ? 1 : 2, WebkitBoxOrient: 'vertical' }}>{liveData.title}</div>
        )}
        {props.showVolume && (
          <div style={{ fontSize: 12 * s, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>Vol: ${liveData.volume.toLocaleString()}</div>
        )}
      </div>
      {!isWide && (
        <div style={{ width: '100%', display: 'flex', gap: 4, height: 8 * s, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${liveData.odds}%`, background: props.accentColor, borderRadius: 4, transition: 'width 0.5s ease' }} />
          <div style={{ flex: 1, background: 'rgba(239,68,68,0.5)', borderRadius: 4 }} />
        </div>
      )}
    </div>
  );
}

// ---- Props Editor ----

function MarketPropsEditor({ props, onChange }: { props: MarketProps; onChange: (p: MarketProps) => void }) {
  const [urlInput, setUrlInput] = useState(props.marketUrl);

  const applyUrl = () => {
    const ticker = extractTicker(urlInput);
    if (ticker) onChange({ ...props, ticker, marketUrl: urlInput });
  };

  return (
    <div className={oe.props}>
      <div className={oe.fieldFull}>
        <span className={oe.fieldLabel}>Market URL</span>
        <div className={oe.row}>
          <input type="text" className={oe.input} placeholder="https://kalshi.com/markets/..." value={urlInput} onChange={e => setUrlInput(e.target.value)} />
          <button className={oe.btnSm} onClick={applyUrl}>Apply</button>
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Accent</span>
          <input type="color" className={oe.color} value={props.accentColor} onChange={e => onChange({ ...props, accentColor: e.target.value })} />
        </div>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showTitle} onChange={e => onChange({ ...props, showTitle: e.target.checked })} />
          Title
        </label>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showVolume} onChange={e => onChange({ ...props, showVolume: e.target.checked })} />
          Volume
        </label>
      </div>
    </div>
  );
}

// ---- Register ----

registerElement<MarketProps>({
  type: 'market',
  label: 'Market',
  layerLabel: (p) => p.ticker || 'No market',
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('path', { d: 'M3 3v18h18' }),
    React.createElement('path', { d: 'M7 16l4-8 4 4 6-10' }),
  ),
  defaults: {
    width: 400,
    height: 160,
    zIndex: 1,
    props: {
      type: 'market',
      ticker: '',
      marketUrl: '',
      pollInterval: 30,
      showTitle: true,
      showVolume: true,
      accentColor: '#09C285',
    },
  },
  Renderer: MarketRenderer,
  PropsEditor: MarketPropsEditor,
  usesMarketData: true,
});
