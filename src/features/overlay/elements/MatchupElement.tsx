import React from 'react';
import { registerElement } from './registry';
import { oe } from '../styles';
import { MarketLiveData } from '../types';
import { extractTicker } from '../useMarketData';

export interface MatchupProps {
  type: 'matchup';
  ticker: string;
  marketUrl: string;
  pollInterval: number;
  team1Name: string;
  team2Name: string;
  team1Color: string;
  team2Color: string;
  showOdds: boolean;
  showPayout: boolean;
  payoutWager: number;
  variant: 'large' | 'compact';
  vsStyle: 'text' | 'slash' | 'hidden';
}

function MatchupRenderer({ props, width, height, liveData }: {
  props: MatchupProps; width: number; height: number; liveData?: MarketLiveData;
}) {
  const isCompact = props.variant === 'compact';
  const fontSize = isCompact ? Math.min(width * 0.12, 48) : Math.min(width * 0.15, 100);
  const vsFontSize = fontSize * 0.35;
  const oddsFontSize = isCompact ? fontSize * 0.4 : fontSize * 0.55;
  const payoutFontSize = isCompact ? fontSize * 0.2 : fontSize * 0.25;

  // Determine odds: if we have multi-outcome live data, use first two outcomes.
  // If binary, team1 = yes odds, team2 = 100 - yes odds.
  let team1Odds = 50;
  let team2Odds = 50;
  if (liveData) {
    if (liveData.marketType === 'multi' && liveData.outcomes && liveData.outcomes.length >= 2) {
      team1Odds = liveData.outcomes[0].odds;
      team2Odds = liveData.outcomes[1].odds;
    } else {
      team1Odds = liveData.odds;
      team2Odds = 100 - liveData.odds;
    }
  }

  const wager = props.payoutWager || 100;

  if (!props.ticker && !liveData) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '2px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
        Set team names & paste market URL
      </div>
    );
  }

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'Inter, sans-serif', overflow: 'hidden', gap: isCompact ? 4 : 8 }}>
      {/* Team names row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: isCompact ? 8 : 16 }}>
        <span style={{ fontSize, fontWeight: 900, color: props.team1Color, letterSpacing: -2, lineHeight: 1, textTransform: 'uppercase' }}>
          {props.team1Name || 'TEAM1'}
        </span>
        {props.vsStyle !== 'hidden' && (
          <span style={{ fontSize: vsFontSize, fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1 }}>
            {props.vsStyle === 'slash' ? '/' : 'vs'}
          </span>
        )}
        <span style={{ fontSize, fontWeight: 900, color: props.team2Color, letterSpacing: -2, lineHeight: 1, textTransform: 'uppercase' }}>
          {props.team2Name || 'TEAM2'}
        </span>
      </div>

      {/* Odds row */}
      {props.showOdds && (
        <div style={{ display: 'flex', gap: isCompact ? 20 : 40, alignItems: 'flex-start' }}>
          {/* Team 1 odds */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: oddsFontSize * 0.5, color: props.team1Color, lineHeight: 1 }}>
                {team1Odds < team2Odds ? '\u2191' : '\u2193'}
              </span>
              <span style={{ fontSize: oddsFontSize, fontWeight: 800, color: props.team1Color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {team1Odds}%
              </span>
            </div>
            {props.showPayout && (
              <span style={{ fontSize: payoutFontSize, color: props.team1Color, opacity: 0.8, fontVariantNumeric: 'tabular-nums' }}>
                ${wager} → ${team1Odds > 0 ? Math.round(wager / (team1Odds / 100)) : '?'}
              </span>
            )}
          </div>
          {/* Team 2 odds */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: oddsFontSize * 0.5, color: props.team2Color, lineHeight: 1 }}>
                {team2Odds < team1Odds ? '\u2191' : '\u2193'}
              </span>
              <span style={{ fontSize: oddsFontSize, fontWeight: 800, color: props.team2Color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {team2Odds}%
              </span>
            </div>
            {props.showPayout && (
              <span style={{ fontSize: payoutFontSize, color: props.team2Color, opacity: 0.8, fontVariantNumeric: 'tabular-nums' }}>
                ${wager} → ${team2Odds > 0 ? Math.round(wager / (team2Odds / 100)) : '?'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchupPropsEditor({ props, onChange }: { props: MatchupProps; onChange: (p: MatchupProps) => void }) {
  const [urlInput, setUrlInput] = React.useState(props.marketUrl);

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
          <span className={oe.fieldLabel}>Team 1</span>
          <input type="text" className={oe.input} value={props.team1Name} placeholder="SEA" onChange={e => onChange({ ...props, team1Name: e.target.value })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Color</span>
          <input type="color" className={oe.color} value={props.team1Color} onChange={e => onChange({ ...props, team1Color: e.target.value })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Team 2</span>
          <input type="text" className={oe.input} value={props.team2Name} placeholder="NE" onChange={e => onChange({ ...props, team2Name: e.target.value })} />
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Color</span>
          <input type="color" className={oe.color} value={props.team2Color} onChange={e => onChange({ ...props, team2Color: e.target.value })} />
        </div>
      </div>
      <div className={oe.row}>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Variant</span>
          <select className={oe.select} value={props.variant} onChange={e => onChange({ ...props, variant: e.target.value as any })}>
            <option value="large">Large</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>VS Style</span>
          <select className={oe.select} value={props.vsStyle} onChange={e => onChange({ ...props, vsStyle: e.target.value as any })}>
            <option value="text">vs</option>
            <option value="slash">/</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Poll (s)</span>
          <input type="number" className={oe.inputSm} value={props.pollInterval} min={5} max={300} onChange={e => onChange({ ...props, pollInterval: parseInt(e.target.value) || 30 })} />
        </div>
      </div>
      <div className={oe.row}>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showOdds} onChange={e => onChange({ ...props, showOdds: e.target.checked })} />
          Show Odds
        </label>
        <label className={oe.checkbox}>
          <input type="checkbox" checked={props.showPayout} onChange={e => onChange({ ...props, showPayout: e.target.checked })} />
          Show Payout
        </label>
        <div className={oe.field}>
          <span className={oe.fieldLabel}>Wager $</span>
          <input type="number" className={oe.inputSm} value={props.payoutWager} min={1} onChange={e => onChange({ ...props, payoutWager: parseInt(e.target.value) || 100 })} />
        </div>
      </div>
    </div>
  );
}

registerElement<MatchupProps>({
  type: 'matchup',
  label: 'Matchup',
  layerLabel: (p) => `${p.team1Name || '?'} vs ${p.team2Name || '?'}`,
  icon: React.createElement('svg', { viewBox: '0 0 24 24', width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
    React.createElement('path', { d: 'M6 4v16' }),
    React.createElement('path', { d: 'M18 4v16' }),
    React.createElement('path', { d: 'M6 12h12' }),
    React.createElement('circle', { cx: 6, cy: 4, r: 2 }),
    React.createElement('circle', { cx: 18, cy: 4, r: 2 }),
  ),
  defaults: {
    width: 700, height: 280, zIndex: 2,
    props: {
      type: 'matchup', ticker: '', marketUrl: '', pollInterval: 30,
      team1Name: 'TEAM1', team2Name: 'TEAM2',
      team1Color: '#09C285', team2Color: '#3B82F6',
      showOdds: true, showPayout: true, payoutWager: 100,
      variant: 'large', vsStyle: 'text',
    },
  },
  Renderer: MatchupRenderer,
  PropsEditor: MatchupPropsEditor,
  usesMarketData: true,
});
