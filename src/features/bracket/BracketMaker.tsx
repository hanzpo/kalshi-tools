import { BracketConfig } from '../../types/bracket';

interface Props {
  config: BracketConfig;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onShare: () => void;
  onRandomize: () => void;
  onBack: () => void;
  shareUrl: string | null;
}

export function BracketMaker({
  config,
  onExport,
  onCopyToClipboard,
  onShare,
  onRandomize,
  onBack,
  shareUrl,
}: Props) {
  const picksCount = config.picks.filter((p) => p !== null).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-100">Men&apos;s College Basketball Bracket</h1>
        <p className="text-sm text-text-secondary">
          Randomized bracket loaded. Tap any game slot to switch the winner. {picksCount}/63 picks set.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-dark-elevated">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${(picksCount / 63) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted">
          <span>R64</span>
          <span>R32</span>
          <span>S16</span>
          <span>E8</span>
          <span>F4</span>
          <span>Champ</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
        >
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
          <div className="flex items-center gap-2 rounded-md border border-dark-border bg-dark-elevated px-3 py-2">
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
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-dark-hover"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
          <button
            onClick={onCopyToClipboard}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dark-border bg-dark-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-dark-hover"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>
        </div>

        <button
          onClick={onRandomize}
          className="mt-2 text-sm font-medium text-text-muted transition-colors hover:text-no"
        >
          Randomize
        </button>
      </div>
    </div>
  );
}
