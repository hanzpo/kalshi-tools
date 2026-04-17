import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BracketConfig, BracketPlayInId } from '../../types/bracket';
import {
  clearDownstreamPicks,
  createDefaultConfig,
  createRandomPicks,
  createRandomPlayInPicks,
  decodeBracket,
  encodeBracket,
  fillMissingPicks,
} from './bracketData';
import { BracketMaker } from './BracketMaker';
import { BracketPreview, BRACKET_PREVIEW_ID } from './BracketPreview';
import { SeoContentBlock } from '../../components/seo/SeoContentBlock';
import { Toast } from '../../components/ui/Toast';
import { captureElementAsPng, copyDataUrlToClipboard, downloadDataUrl } from '../../lib/imageExport';
import { createFileName } from '../../lib/chartHelpers';
import { useToast } from '../../hooks/useToast';
import { trackEvent } from '../../lib/analytics';
import { seoPages } from '../../seo/routes';
import { layout } from '../../styles/layout';

export type BracketView = 'r32' | 'r64';

export default function BracketBuilder() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = useState<BracketConfig>(() => {
    const encoded = searchParams.get('b');
    if (encoded) {
      const decoded = decodeBracket(encoded);
      if (decoded) return decoded;
    }
    return createDefaultConfig();
  });
  const [bracketView, setBracketView] = useState<BracketView>(() => {
    return searchParams.get('v') === '64' ? 'r64' : 'r32';
  });
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const { message: toastMessage, showToast } = useToast();

  // Sync URL when config changes from a shared link
  useEffect(() => {
    const encoded = searchParams.get('b');
    if (encoded) {
      const decoded = decodeBracket(encoded);
      if (decoded) setConfig(decoded);
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePick(gameIndex: number, pick: number) {
    setConfig((prev) => {
      if (prev.picks[gameIndex] === pick) {
        return prev;
      }
      const newPicks = clearDownstreamPicks(prev.picks, gameIndex);
      newPicks[gameIndex] = pick;
      return { ...prev, picks: fillMissingPicks(newPicks, prev.playInPicks) };
    });
    setShareUrl(null);
    trackEvent('bracket_pick', { game: gameIndex, pick });
  }

  function handlePlayInPick(playInId: BracketPlayInId, pick: 0 | 1) {
    setConfig((prev) => ({
      ...prev,
      playInPicks: {
        ...prev.playInPicks,
        [playInId]: pick,
      },
    }));
    setShareUrl(null);
    trackEvent('bracket_play_in_pick', { play_in_id: playInId, pick });
  }

  function handleRandomize() {
    const playInPicks = createRandomPlayInPicks();
    setConfig((prev) => ({
      ...prev,
      playInPicks,
      picks: createRandomPicks(playInPicks),
    }));
    setShareUrl(null);
    trackEvent('bracket_randomize');
  }

  function handleShare() {
    const encoded = encodeBracket(config);
    const params: Record<string, string> = { b: encoded };
    if (bracketView === 'r64') params.v = '64';
    const qs = new URLSearchParams(params).toString();
    const url = `${window.location.origin}${window.location.pathname}?${qs}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url).then(() => {
      showToast('Share link copied to clipboard!');
    });
    setSearchParams(params, { replace: true });
    trackEvent('bracket_share');
  }

  async function handleExport() {
    const element = document.getElementById(BRACKET_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      downloadDataUrl(dataUrl, createFileName('mens-college-basketball', 'kalshi-bracket'));
      trackEvent('export_image', { tool: 'bracket', method: 'download' });
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  }

  async function handleCopyToClipboard() {
    const element = document.getElementById(BRACKET_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      await copyDataUrlToClipboard(dataUrl);
      showToast('Bracket copied to clipboard!');
      trackEvent('copy_image', { tool: 'bracket', method: 'clipboard' });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard');
    }
  }

  return (
    <div className={layout.app}>
      <div className={layout.appContainer}>
        <BracketMaker
          config={config}
          onPlayInPick={handlePlayInPick}
          onExport={handleExport}
          onCopyToClipboard={handleCopyToClipboard}
          onShare={handleShare}
          onRandomize={handleRandomize}
          onBack={() => navigate('/')}
          shareUrl={shareUrl}
          bracketView={bracketView}
          onViewChange={setBracketView}
        />
        <div className={layout.previewSection}>
          <BracketPreview config={config} onPick={handlePick} view={bracketView} />
        </div>
      </div>

      <SeoContentBlock content={seoPages['/bracket'].content} />

      <Toast message={toastMessage} />
    </div>
  );
}
