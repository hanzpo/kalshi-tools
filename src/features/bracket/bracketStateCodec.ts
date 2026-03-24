import { BracketPlayInId } from '../../types/bracket';

const PLAY_IN_IDS: BracketPlayInId[] = ['south-16', 'west-11', 'midwest-11', 'midwest-16'];

export interface EncodedBracketState {
  picks: (number | null)[];
  playInPicks: Record<BracketPlayInId, 0 | 1>;
}

type NodeBufferLike = {
  from(input: string, encoding: string): {
    toString(outputEncoding: string): string;
  };
};

function getNodeBuffer(): NodeBufferLike | null {
  return typeof globalThis === 'object' && 'Buffer' in globalThis
    ? (globalThis as typeof globalThis & { Buffer?: NodeBufferLike }).Buffer ?? null
    : null;
}

function toBase64Url(value: string): string {
  const buffer = getNodeBuffer();
  const base64 = typeof btoa === 'function'
    ? btoa(unescape(encodeURIComponent(value)))
    : buffer?.from(value, 'utf8').toString('base64');

  if (!base64) {
    throw new Error('No base64 encoder available in this environment');
  }

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64Url(value: string): string {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(base64)));
  }

  const buffer = getNodeBuffer();
  if (!buffer) {
    throw new Error('No base64 decoder available in this environment');
  }

  return buffer.from(base64, 'base64').toString('utf8');
}

export function encodeBracketState(state: EncodedBracketState): string {
  const picksStr = state.picks.map((pick) => (pick === null ? '_' : String(pick))).join('');
  const playInStr = PLAY_IN_IDS.map((id) => String(state.playInPicks[id])).join('');
  return toBase64Url(JSON.stringify({ p: picksStr, pi: playInStr }));
}

export function decodeBracketState(encoded: string): EncodedBracketState | null {
  try {
    const json = fromBase64Url(encoded);
    const data = JSON.parse(json);
    const picks: (number | null)[] = typeof data.p === 'string'
      ? data.p.split('').map((char: string) => (char === '_' ? null : Number(char)))
      : new Array(63).fill(null);

    const playInPicks = typeof data.pi === 'string' && data.pi.length === PLAY_IN_IDS.length
      ? PLAY_IN_IDS.reduce((acc, id, index) => {
        acc[id] = data.pi[index] === '1' ? 1 : 0;
        return acc;
      }, {} as Record<BracketPlayInId, 0 | 1>)
      : PLAY_IN_IDS.reduce((acc, id) => {
        acc[id] = 0;
        return acc;
      }, {} as Record<BracketPlayInId, 0 | 1>);

    return { picks, playInPicks };
  } catch {
    return null;
  }
}
