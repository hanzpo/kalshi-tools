import { BracketConfig, BracketTeam } from '../../types/bracket';
import {
  DEFAULT_BRACKET_SUBTITLE,
  DEFAULT_BRACKET_TITLE,
  getMatchupParticipants,
  getWinner,
} from './bracketData';
import './BracketPreview.css';

export const BRACKET_PREVIEW_ID = 'bracket-preview';

interface Props {
  config: BracketConfig;
  onPick: (gameIndex: number, pick: number) => void;
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
  if (!team) {
    return (
      <div className={`bracket-team bracket-team--empty ${size === 'lg' ? 'bracket-team--champion' : ''}`}>
        <div className="bracket-team-inner" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <span className="bracket-team-name" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bracket-team ${size === 'lg' ? 'bracket-team--champion' : ''}`}
      onClick={onClick}
    >
      <div className="bracket-team-inner" style={{ background: team.bgColor }}>
        <span
          className={`bracket-team-name${team.isPlayIn ? ' bracket-team-name--play-in' : ''}`}
          style={{ color: team.textColor }}
        >
          {team.name}
        </span>
      </div>
    </div>
  );
}

function Connector({ height = 40, mirrored = false }: { height?: number; mirrored?: boolean }) {
  return (
    <div
      className={`bracket-connector ${mirrored ? 'bracket-connector--mirrored' : ''}`}
      style={{ height }}
    >
      <div className="bracket-connector-inner">
        <div className="bracket-connector-left">
          <div className="bracket-connector-top-left" />
          <div className="bracket-connector-bottom-left" />
        </div>
        <div className="bracket-connector-right">
          <div className="bracket-connector-top-right" />
          <div className="bracket-connector-bottom-right" />
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
}: {
  config: BracketConfig;
  regionIndex: number;
  mirrored?: boolean;
  onPick: (gameIndex: number, pick: number) => void;
}) {
  const regionName = config.regions[regionIndex].name;
  const baseGame = regionIndex * 8;

  const r64Col = (
    <div className="bracket-round-col">
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
  );

  const makeRoundCol = (
    count: number,
    gameBase: number,
    connectorHeight: number,
  ) => (
    <div className="bracket-round-col bracket-round-col--r32">
      {Array.from({ length: count }, (_, i) => {
        const gameIdx = gameBase + i;
        const [tA, tB] = getMatchupParticipants(config, gameIdx);
        const currentW = getWinner(config, gameIdx);
        const currentPick = config.picks[gameIdx];
        return (
          <div key={i} className={`bracket-matchup-row ${mirrored ? 'bracket-matchup-row--right' : ''}`}>
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
    <div className="bracket-round-col bracket-round-col--e8">
      <div className={`bracket-matchup-row ${mirrored ? 'bracket-matchup-row--right' : ''}`}>
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
      <div className="bracket-region-side bracket-region-side--right">
        <span className="bracket-region-name">{regionName}</span>
        {r64Col}
        {r32Col}
        {s16Col}
        {e8Col}
      </div>
    );
  }

  return (
    <div className="bracket-region-side">
      <span className="bracket-region-name">{regionName}</span>
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
  const currentWinner = getWinner(config, gameIndex);

  return (
    <div className={`bracket-semifinal-labels bracket-semifinal-labels--${side}`}>
      {[teamA, teamB].map((team, index) => (
        <button
          key={index}
          type="button"
          className={`bracket-semifinal-label bracket-semifinal-label--${side} ${team && currentWinner === team ? 'bracket-semifinal-label--selected' : ''}`}
          onClick={() => {
            if (!teamA || !teamB) return;
            onPick(gameIndex, index);
          }}
          disabled={!teamA || !teamB}
        >
          <span
            className="bracket-semifinal-label-inner"
            style={{
              background: team?.bgColor ?? 'rgba(255,255,255,0.04)',
              color: team?.textColor ?? 'rgba(255,255,255,0.18)',
            }}
          >
            {team?.name ?? '?'}
          </span>
        </button>
      ))}
    </div>
  );
}

export function BracketPreview({ config, onPick }: Props) {
  const champion = getWinner(config, 62);
  const [champA, champB] = getMatchupParticipants(config, 62);
  const championPick = config.picks[62];
  const f4LeftWinner = getWinner(config, 60);
  const f4RightWinner = getWinner(config, 61);

  return (
    <div className="bracket-preview" id={BRACKET_PREVIEW_ID}>
      {/* Header */}
      <div className="bracket-header">
        <p className="bracket-subtitle">{DEFAULT_BRACKET_SUBTITLE}</p>
        <p className="bracket-title">{DEFAULT_BRACKET_TITLE}</p>
      </div>

      <div className="bracket-container">
        <div className="bracket-body">
          <div className="bracket-half bracket-half--top">
            <RegionBracket config={config} regionIndex={0} onPick={onPick} />
            <RegionBracket config={config} regionIndex={1} mirrored onPick={onPick} />
          </div>

          <div className="bracket-center-row">
            <FinalFourLabels config={config} onPick={onPick} gameIndex={60} side="left" />

            <div className="bracket-center-matchup">
              <div className="bracket-championship-row">
                {f4LeftWinner ? (
                  <TeamSquare team={f4LeftWinner} />
                ) : (
                  <div className="bracket-center-slot" />
                )}
                <div className="bracket-championship-line" />

                <div className="bracket-champion-wrap">
                  <div className="bracket-champion-ring">
                    <span className="bracket-champion-label">Champion</span>
                    <div className="bracket-watermark">
                      <svg viewBox="0 0 772 226" fill="none">
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

                <div className="bracket-championship-line" />
                {f4RightWinner ? (
                  <TeamSquare team={f4RightWinner} />
                ) : (
                  <div className="bracket-center-slot" />
                )}
              </div>
            </div>

            <FinalFourLabels config={config} onPick={onPick} gameIndex={61} side="right" />
          </div>

          <div className="bracket-half bracket-half--bottom">
            <RegionBracket config={config} regionIndex={2} onPick={onPick} />
            <RegionBracket config={config} regionIndex={3} mirrored onPick={onPick} />
          </div>
        </div>
      </div>
    </div>
  );
}
