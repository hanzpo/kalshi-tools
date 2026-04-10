import { BracketConfig, BracketTeam } from '../../types/bracket';
import {
  DEFAULT_BRACKET_SUBTITLE,
  DEFAULT_BRACKET_TITLE,
  getMatchupParticipants,
  getWinner,
} from './bracketData';

export const BRACKET_PREVIEW_ID = 'bracket-preview';

const GRAPHIK_FONT = "'Kalshi Sans', system-ui, sans-serif";
const GRAPHIK_CONDENSED_FONT = "'Kalshi Sans', system-ui, sans-serif";
const FEATURE_SETTINGS = "'case' 1, 'ss05' 1, 'lnum' 1, 'tnum' 1";
const FEATURE_SETTINGS_ALT = "'case' 1, 'lnum' 1, 'pnum' 1";

const LIGHT_TEXT = 'rgba(255,255,255,0.95)';
const DARK_TEXT = '#0a1128';

function textColorForBg(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.35 ? DARK_TEXT : LIGHT_TEXT;
}

interface Props {
  config: BracketConfig;
  onPick: (gameIndex: number, pick: number) => void;
  view?: 'r32' | 'r64';
}

function getNextPick(currentPick: number | null): number {
  return currentPick === 0 ? 1 : 0;
}

function TeamSquare({
  team,
  onClick,
  size = 'sm',
}: {
  team: BracketTeam | null;
  onClick?: () => void;
  size?: 'sm' | 'lg';
}) {
  const isLg = size === 'lg';

  if (!team) {
    return (
      <div className={`${isLg ? 'w-[81px] h-[81px]' : 'size-12'} rounded-xl border-2 border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] flex flex-col items-stretch justify-stretch p-[5px] shrink-0 cursor-default select-none transition-[transform,box-shadow,opacity] duration-100 relative box-border z-[2] opacity-25 hover:scale-100 hover:shadow-none`}>
        <div className="flex w-full flex-1 items-center justify-center rounded-[6px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <span
            className={`flex items-center justify-center w-full h-full ${isLg ? 'text-[17px] tracking-[1.2px]' : 'text-[10px] tracking-[0.72px]'} font-semibold uppercase whitespace-nowrap text-center leading-none`}
            style={{ fontFamily: GRAPHIK_FONT, fontFeatureSettings: FEATURE_SETTINGS, color: 'rgba(255,255,255,0.15)' }}
          >?</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isLg ? 'w-[81px] h-[81px]' : 'size-12'} rounded-xl border-2 border-[rgba(255,255,255,0.1)] bg-[#0b0d0c] flex flex-col items-stretch justify-stretch p-[5px] shrink-0 cursor-pointer select-none transition-[transform,box-shadow,opacity] duration-100 relative box-border z-[2] hover:scale-[1.12] hover:shadow-[0_3px_18px_rgba(0,0,0,0.5)] hover:z-[5] active:scale-95`}
      onClick={onClick}
    >
      <div className="flex w-full flex-1 items-center justify-center rounded-[6px] overflow-hidden" style={{ background: team.bgColor }}>
        <span
          className={`flex items-center justify-center w-full h-full ${isLg ? 'text-[17px] tracking-[1.2px]' : 'text-[10px] tracking-[0.72px]'} font-semibold uppercase whitespace-nowrap text-center leading-none`}
          style={{ fontFamily: GRAPHIK_FONT, fontFeatureSettings: FEATURE_SETTINGS, color: textColorForBg(team.bgColor) }}
        >
          {team.name}
        </span>
      </div>
    </div>
  );
}

function SeedBadge({ team }: { team: BracketTeam | null }) {
  if (!team) {
    return <div className="w-[36px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0 bg-[rgba(255,255,255,0.06)]" />;
  }
  return (
    <div className="w-[36px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0" style={{ background: team.bgColor }}>
      <span
        className="text-[7.5px] font-semibold tracking-[0.4px] uppercase whitespace-nowrap leading-none"
        style={{ fontFamily: GRAPHIK_FONT, fontFeatureSettings: FEATURE_SETTINGS, color: textColorForBg(team.bgColor) }}
      >
        {team.name}
      </span>
    </div>
  );
}

function Connector({ height = 40, mirrored = false }: { height?: number; mirrored?: boolean }) {
  return (
    <div
      className="flex items-center w-[12px] max-w-[12px] shrink-0"
      style={{ height }}
    >
      <div className={`flex flex-1 h-full items-center justify-between ${mirrored ? '-scale-x-100' : ''}`}>
        <div className="flex flex-1 flex-col h-full min-h-px min-w-px">
          <div className="flex-1 border-r border-t border-[rgba(255,255,255,0.1)]" />
          <div className="flex-1 border-r border-b border-[rgba(255,255,255,0.1)]" />
        </div>
        <div className="flex flex-1 flex-col h-full min-h-px min-w-px">
          <div className="flex-1 border-b border-[rgba(255,255,255,0.1)]" />
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}

function RegionBracket({
  config,
  regionIndex,
  mirrored = false,
  onPick,
  view = 'r32',
}: {
  config: BracketConfig;
  regionIndex: number;
  mirrored?: boolean;
  onPick: (gameIndex: number, pick: number) => void;
  view?: 'r32' | 'r64';
}) {
  const regionName = config.regions[regionIndex].name;
  const baseGame = regionIndex * 8;

  const r64Col = view === 'r32' ? (
    <div className="flex flex-col gap-[12px] items-center justify-center h-full">
      {Array.from({ length: 8 }, (_, i) => {
        const gameIdx = baseGame + i;
        const [teamA, teamB] = getMatchupParticipants(config, gameIdx);
        const currentWinner = getWinner(config, gameIdx);
        const currentPick = config.picks[gameIdx];
        const displayTeam = currentWinner || teamA;
        return (
          <TeamSquare
            key={i}
            team={displayTeam}
            onClick={() => {
              if (!teamA || !teamB) return;
              onPick(gameIdx, getNextPick(currentPick));
            }}
          />
        );
      })}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full">
      {Array.from({ length: 8 }, (_, i) => {
        const gameIdx = baseGame + i;
        const [teamA, teamB] = getMatchupParticipants(config, gameIdx);
        const currentWinner = getWinner(config, gameIdx);
        const currentPick = config.picks[gameIdx];
        return (
          <div key={i} className={`flex flex-1 items-center min-h-px w-full ${mirrored ? 'flex-row-reverse' : ''}`}>
            <div className="flex flex-col gap-[2px] shrink-0">
              <SeedBadge team={teamA} />
              <SeedBadge team={teamB} />
            </div>
            <Connector height={36} mirrored={mirrored} />
            <TeamSquare
              team={currentWinner || teamA}
              onClick={() => {
                if (!teamA || !teamB) return;
                onPick(gameIdx, getNextPick(currentPick));
              }}
            />
          </div>
        );
      })}
    </div>
  );

  const makeRoundCol = (
    count: number,
    gameBase: number,
    connectorHeight: number,
  ) => (
    <div className="flex flex-col gap-[12px] items-center justify-center h-full w-[60px]">
      {Array.from({ length: count }, (_, i) => {
        const gameIdx = gameBase + i;
        const [tA, tB] = getMatchupParticipants(config, gameIdx);
        const currentW = getWinner(config, gameIdx);
        const currentPick = config.picks[gameIdx];
        return (
          <div key={i} className={`flex flex-1 items-center min-h-px min-w-px w-full ${mirrored ? 'flex-row-reverse' : ''}`}>
            <Connector height={connectorHeight} mirrored={mirrored} />
            <TeamSquare
              team={currentW || tA || tB}
              onClick={() => {
                if (!tA || !tB) return;
                onPick(gameIdx, getNextPick(currentPick));
              }}
            />
          </div>
        );
      })}
    </div>
  );

  const r32Base = 32 + regionIndex * 4;
  const s16Base = 48 + regionIndex * 2;
  const e8Game = 56 + regionIndex;

  const r32Col = makeRoundCol(4, r32Base, 60);
  const s16Col = makeRoundCol(2, s16Base, 120);

  const e8Col = (
    <div className="flex flex-col gap-[12px] items-center justify-center h-full w-[60px]">
      <div className={`flex flex-1 items-center min-h-px min-w-px w-full ${mirrored ? 'flex-row-reverse' : ''}`}>
        <Connector height={240} mirrored={mirrored} />
        {(() => {
          const [tA, tB] = getMatchupParticipants(config, e8Game);
          const currentW = getWinner(config, e8Game);
          const currentPick = config.picks[e8Game];
          return (
            <TeamSquare
              team={currentW || tA || tB}
              onClick={() => {
                if (!tA || !tB) return;
                onPick(e8Game, getNextPick(currentPick));
              }}
            />
          );
        })()}
      </div>
    </div>
  );

  if (mirrored) {
    return (
      <div className="flex flex-1 h-full items-center justify-center relative flex-row-reverse">
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16.5px] font-semibold tracking-[1.32px] uppercase text-white/90 leading-[27px] pointer-events-none whitespace-nowrap z-[1]"
          style={{ fontFamily: GRAPHIK_FONT }}
        >{regionName}</span>
        {r64Col}
        {r32Col}
        {s16Col}
        {e8Col}
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full items-center justify-center relative">
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16.5px] font-semibold tracking-[1.32px] uppercase text-white/90 leading-[27px] pointer-events-none whitespace-nowrap z-[1]"
        style={{ fontFamily: GRAPHIK_FONT }}
      >{regionName}</span>
      {r64Col}
      {r32Col}
      {s16Col}
      {e8Col}
    </div>
  );
}

function FinalFourLabels({
  config,
  onPick,
  gameIndex,
  side,
}: {
  config: BracketConfig;
  onPick: (gameIndex: number, pick: number) => void;
  gameIndex: number;
  side: 'left' | 'right';
}) {
  const [teamA, teamB] = getMatchupParticipants(config, gameIndex);

  return (
    <div className={`flex flex-col gap-[6px] self-start z-[4] ${side === 'left' ? 'col-start-2 mt-[7.5px]' : '[grid-column:6] mt-[13.5px]'}`}>
      {[teamA, teamB].map((team, index) => (
        <button
          key={index}
          type="button"
          className="box-border p-[3px] m-0 bg-[rgba(255,255,255,0.02)] cursor-pointer text-center transition-[opacity,transform] duration-[120ms] ease-linear w-[44px] border border-[rgba(255,255,255,0.1)] rounded-[9px] hover:enabled:scale-[1.04] disabled:cursor-default disabled:opacity-[0.32]"
          onClick={() => {
            if (!teamA || !teamB) return;
            onPick(gameIndex, index);
          }}
          disabled={!teamA || !teamB}
        >
          <span
            className="box-border flex items-center justify-center w-full h-6 px-px rounded-md text-[11px] font-semibold tracking-[0.88px] uppercase whitespace-nowrap leading-none"
            style={{
              fontFamily: GRAPHIK_FONT,
              fontFeatureSettings: FEATURE_SETTINGS,
              background: team?.bgColor ?? 'rgba(255,255,255,0.04)',
              color: team ? textColorForBg(team.bgColor) : 'rgba(255,255,255,0.18)',
            }}
          >
            {team?.name ?? '?'}
          </span>
        </button>
      ))}
    </div>
  );
}

export function BracketPreview({ config, onPick, view = 'r32' }: Props) {
  const champion = getWinner(config, 62);
  const [champA, champB] = getMatchupParticipants(config, 62);
  const championPick = config.picks[62];
  const f4LeftWinner = getWinner(config, 60);
  const f4RightWinner = getWinner(config, 61);

  return (
    <div
      className={`${view === 'r64' ? 'w-[800px]' : 'w-[590px]'} bg-[#0b0d0c] flex flex-col items-center pt-[24px] pb-[72px] relative overflow-hidden box-border`}
      style={{ fontFamily: GRAPHIK_FONT }}
      id={BRACKET_PREVIEW_ID}
    >
      {/* Green glow overlay (replaces ::before pseudo-element) */}
      <div className="absolute inset-x-0 top-0 h-[300px] pointer-events-none z-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(11,13,12,1) 100%), linear-gradient(90deg, rgba(10,194,133,0.08) 10%, rgba(10,194,133,0.5) 50%, rgba(10,194,133,0.08) 90%)' }} />

      {/* Header */}
      <div className="text-center w-full mb-[-48px] relative z-[2] flex flex-col">
        <p
          className="text-[16.5px] font-semibold tracking-[1.32px] uppercase text-[rgba(255,255,255,0.55)] leading-[27px] m-0"
          style={{ fontFamily: GRAPHIK_FONT, fontFeatureSettings: FEATURE_SETTINGS }}
        >{DEFAULT_BRACKET_SUBTITLE}</p>
        <p
          className="text-[45px] font-medium leading-[54px] text-white/90 uppercase m-0 whitespace-pre-line"
          style={{ fontFamily: GRAPHIK_CONDENSED_FONT, fontFeatureSettings: FEATURE_SETTINGS_ALT }}
        >{DEFAULT_BRACKET_TITLE}</p>
      </div>

      <div className={`flex flex-col items-center p-0 ${view === 'r64' ? 'w-[800px]' : 'w-[590px]'}`}>
        <div className="w-full relative flex flex-col">
          <div className={`flex w-full justify-center ${view === 'r64' ? 'h-[560px]' : 'h-[477px]'} items-start`}>
            <RegionBracket config={config} regionIndex={0} onPick={onPick} view={view} />
            <RegionBracket config={config} regionIndex={2} mirrored onPick={onPick} view={view} />
          </div>

          <div className="w-full h-[81px] grid grid-cols-[1fr_44px_36px_201px_36px_44px_1fr] items-center relative z-[3]">
            <FinalFourLabels config={config} onPick={onPick} gameIndex={60} side="left" />

            <div className="[grid-column:4] w-[201px] h-[81px] relative flex items-center justify-center">
              <div className="relative z-[3] flex items-center justify-center w-[201px] h-[81px]">
                {f4LeftWinner ? (
                  <TeamSquare team={f4LeftWinner} />
                ) : (
                  <div className="w-[48px] h-[48px] shrink-0" />
                )}
                <div className="h-0 w-3 shrink-0 relative"><div className="absolute -top-px inset-x-0 h-px bg-[rgba(255,255,255,0.1)]" /></div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] z-[1] pointer-events-none">
                  <div className="w-[240px] h-[240px] rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(128,128,128,0.02)] flex flex-col items-center justify-center gap-[108px] pt-[6px] box-border">
                    <span
                      className="text-[16.5px] font-semibold tracking-[1.32px] uppercase text-[#0AC285] leading-[27px]"
                      style={{ fontFamily: GRAPHIK_FONT, fontFeatureSettings: FEATURE_SETTINGS }}
                    >Champion</span>
                    <div className="text-[#0AC285] flex items-center justify-center">
                      <svg className="w-[81px] h-[24px]" viewBox="0 0 772 226" fill="none">
                        <path
                          d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <TeamSquare
                  team={champion}
                  size="lg"
                  onClick={() => {
                    if (!champA || !champB) return;
                    onPick(62, getNextPick(championPick));
                  }}
                />

                <div className="h-0 w-3 shrink-0 relative"><div className="absolute -top-px inset-x-0 h-px bg-[rgba(255,255,255,0.1)]" /></div>
                {f4RightWinner ? (
                  <TeamSquare team={f4RightWinner} />
                ) : (
                  <div className="w-[48px] h-[48px] shrink-0" />
                )}
              </div>
            </div>

            <FinalFourLabels config={config} onPick={onPick} gameIndex={61} side="right" />
          </div>

          <div className={`flex w-full justify-center ${view === 'r64' ? 'h-[560px]' : 'h-[477px]'} items-end`}>
            <RegionBracket config={config} regionIndex={1} onPick={onPick} view={view} />
            <RegionBracket config={config} regionIndex={3} mirrored onPick={onPick} view={view} />
          </div>
        </div>
      </div>
    </div>
  );
}
