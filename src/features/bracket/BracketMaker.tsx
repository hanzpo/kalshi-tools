import { useState } from 'react';
import { BracketConfig, BracketPlayInId } from '../../types/bracket';
import type { BracketView } from './BracketBuilder';
import { ArrowLeft as ArrowLeftIcon, Download as DownloadIcon, Copy as CopyIcon } from 'lucide-react';
import { ctrl } from '../../styles/controls';

function textColorForBg(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.35 ? '#0a1128' : 'rgba(255,255,255,0.95)';
}

interface Props {
  config: BracketConfig;
  onPlayInPick: (playInId: BracketPlayInId, pick: 0 | 1) => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onShare: () => void;
  onRandomize: () => void;
  onBack: () => void;
  shareUrl: string | null;
  bracketView: BracketView;
  onViewChange: (view: BracketView) => void;
}

export function BracketMaker({
  config,
  onPlayInPick,
  onExport,
  onCopyToClipboard,
  onShare,
  onRandomize,
  onBack,
  shareUrl,
  bracketView,
  onViewChange,
}: Props) {
  const [hintDismissed, setHintDismissed] = useState(
    () => localStorage.getItem('bracket-hint-dismissed') === '1'
  );
  const picksCount = config.picks.filter((p) => p !== null).length;
  const playInTeams = config.regions.flatMap((region) =>
    region.teams
      .filter((team) => team.playInId && team.playInOptions)
      .map((team) => ({
        regionName: region.name,
        seed: team.seed,
        playInId: team.playInId as BracketPlayInId,
        options: team.playInOptions!,
      }))
  );

  return (
    <div className={ctrl.panel}>
      <button onClick={onBack} className={ctrl.backBtn}>
        <ArrowLeftIcon size={14} />
        Back
      </button>
      <h1 className={ctrl.title}>Men&apos;s College Basketball Bracket</h1>
      <p className={ctrl.subtitle}>
        Randomized bracket loaded. Tap any game slot to switch the winner. {picksCount}/63 picks set.
      </p>

      {/* View toggle */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>View</div>
        <div className={ctrl.segmented}>
          {([['r32', 'Round of 32'], ['r64', 'Round of 64']] as const).map(([view, label]) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`${ctrl.segmentedOption} ${bracketView === view ? ctrl.segmentedOptionActive : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Progress</div>
        <div className="flex flex-col gap-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-dark">
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{ width: `${(picksCount / 63) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-text-secondary">
            <span>R64</span>
            <span>R32</span>
            <span>S16</span>
            <span>E8</span>
            <span>F4</span>
            <span>Champ</span>
          </div>
        </div>
      </div>

      {!hintDismissed && (
        <div className="mb-3 flex items-start gap-3 rounded-lg border border-dark-border bg-dark-elevated px-4 py-3">
          <p className="flex-1 text-xs leading-relaxed text-text-secondary">
            All 64 teams are available — tap any first-round matchup on the bracket to toggle the winner.
          </p>
          <button
            onClick={() => {
              setHintDismissed(true);
              localStorage.setItem('bracket-hint-dismissed', '1');
            }}
            className="shrink-0 text-text-muted transition-colors hover:text-text-secondary"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* First Four */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>First Four</div>
        <p className="mb-3 text-xs text-text-secondary">
          Pick the play-in winner and the bracket tree updates automatically.
        </p>

        <div className="flex flex-col gap-3">
          {playInTeams.map(({ regionName, seed, playInId, options }) => (
            <div key={playInId} className="flex flex-col gap-2">
              <div className="text-xs font-medium text-text-secondary">
                {regionName} {seed}-seed play-in
              </div>
              <div className="flex gap-2">
                {options.map((option, index) => {
                  const isSelected = config.playInPicks[playInId] === index;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => onPlayInPick(playInId, index as 0 | 1)}
                      className={`flex-1 rounded-[5px] border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                        isSelected ? 'border-brand ring-1 ring-brand/35' : 'border-dark-border-light'
                      }`}
                      style={{
                        background: option.bgColor,
                        color: textColorForBg(option.bgColor),
                      }}
                    >
                      {option.fullName}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={ctrl.actionsColumn}>
        <button onClick={onShare} className={ctrl.btnExport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share Bracket
        </button>

        {shareUrl && (
          <div className="flex items-center gap-2 rounded-[5px] border border-dark-border-light bg-dark px-3 py-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-xs text-text-secondary outline-none"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
              }}
              className="text-xs font-medium text-brand hover:text-brand-light"
            >
              Copy
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onExport}
            className={`${ctrl.btnRegen} flex-1`}
          >
            <DownloadIcon size={14} />
            Download
          </button>
          <button
            onClick={onCopyToClipboard}
            className={`${ctrl.btnRegen} flex-1`}
          >
            <CopyIcon size={14} />
            Copy
          </button>
        </div>

        <button
          onClick={onRandomize}
          className={ctrl.btnRegen}
        >
          Randomize
        </button>
      </div>
    </div>
  );
}
