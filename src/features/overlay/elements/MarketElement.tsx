import React, { useState } from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';
import { MarketLiveData } from '../types';
import { extractTicker } from '../useMarketData';

export interface MarketProps {
  type: 'market';
  ticker: string;
  marketUrl: string;
  variant: 'compact' | 'expanded' | 'minimal';
  pollInterval: number;
  showTitle: boolean;
  showVolume: boolean;
  accentColor: string;
}

// ---- Renderer ----

function MarketRenderer({ props, width, height, liveData }: {
  props: MarketProps; width: number; height: number; liveData?: MarketLiveData;
}) {
  const isCompact = props.variant === 'compact';
  const isMinimal = props.variant === 'minimal';

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
    return (
      <div style={{ width, height, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', borderRadius: 12, border: `1px solid ${props.accentColor}33`, padding: isCompact ? '10px 14px' : '16px 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: isCompact ? 6 : 10, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
        {props.showTitle && (
          <div style={{ fontSize: isCompact ? 13 : 16, fontWeight: 600, color: '#ffffff', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {liveData.title}
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isCompact ? 3 : 5, overflow: 'hidden' }}>
          {liveData.outcomes.slice(0, isCompact ? 4 : 6).map((outcome, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, fontSize: isCompact ? 12 : 14, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{outcome.name}</div>
              <div style={{ fontSize: isCompact ? 13 : 15, fontWeight: 700, color: props.accentColor, fontVariantNumeric: 'tabular-nums', minWidth: 42, textAlign: 'right' }}>{outcome.odds}%</div>
              <div style={{ width: isCompact ? 60 : 80, height: isCompact ? 6 : 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ width: `${outcome.odds}%`, height: '100%', background: props.accentColor, borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
        {props.showVolume && !isCompact && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
            Vol: ${liveData.volume.toLocaleString()}
          </div>
        )}
      </div>
    );
  }

  // Minimal
  if (isMinimal) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: Math.min(height * 0.6, 48), fontWeight: 800, color: props.accentColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{liveData.odds}%</div>
        {props.showTitle && (
          <div style={{ fontSize: Math.min(height * 0.3, 18), color: 'rgba(255,255,255,0.7)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{liveData.title}</div>
        )}
      </div>
    );
  }

  // Expanded / Compact
  return (
    <div style={{ width, height, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', borderRadius: 12, border: `1px solid ${props.accentColor}33`, padding: isCompact ? '10px 14px' : '20px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: isCompact ? 'row' : 'column', alignItems: isCompact ? 'center' : 'flex-start', gap: 12, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <div style={{ fontSize: isCompact ? 28 : 48, fontWeight: 800, color: props.accentColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1, flexShrink: 0 }}>
        {liveData.odds}<span style={{ fontSize: isCompact ? 16 : 28, opacity: 0.7 }}>%</span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
        {props.showTitle && (
          <div style={{ fontSize: isCompact ? 13 : 18, fontWeight: 600, color: '#ffffff', opacity: 0.9, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: isCompact ? 1 : 2, WebkitBoxOrient: 'vertical' }}>{liveData.title}</div>
        )}
        {props.showVolume && (
          <div style={{ fontSize: isCompact ? 11 : 13, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>Vol: ${liveData.volume.toLocaleString()}</div>
        )}
      </div>
      {!isCompact && (
        <div style={{ width: '100%', display: 'flex', gap: 4, height: 8, borderRadius: 4, overflow: 'hidden' }}>
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
          <span className={oe.fieldLabel}>Variant</span>
          <select className={oe.select} value={props.variant} onChange={e => onChange({ ...props, variant: e.target.value as any })}>
            <option value="expanded">Expanded</option>
            <option value="compact">Compact</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Accent</span>
          <input type="color" className={oe.color} value={props.accentColor} onChange={e => onChange({ ...props, accentColor: e.target.value })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Poll (s)</span>
          <input type="number" className={oe.inputSm} value={props.pollInterval} min={5} max={300} onChange={e => onChange({ ...props, pollInterval: parseInt(e.target.value) || 30 })} />
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
      variant: 'expanded',
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
