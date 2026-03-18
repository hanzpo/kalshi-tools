import { BracketPlayInId } from '../../types/bracket';
import { encodeBracketState } from './bracketStateCodec';

const REGION_KEYS = ['south', 'east', 'west', 'midwest'] as const;
type RegionKey = typeof REGION_KEYS[number];

type KalshiGameNode = {
  is_game: true;
  user_structured_target_id: string;
};

type KalshiLeafNode = {
  is_game: false;
  user_structured_target_id?: string;
  candidate_structured_target_ids?: string[];
};

type KalshiNode = KalshiGameNode | KalshiLeafNode | null;

type StructuredTargetInfo = {
  name?: string;
};

export interface KalshiBracketPayload {
  bracket: Record<RegionKey | 'final_four', KalshiNode[]>;
  details?: {
    structured_targets_info?: Record<string, { seed?: number }>;
  };
  hydrated_data?: {
    structured_targets?: Record<string, StructuredTargetInfo>;
  };
  playInPicks?: Partial<Record<BracketPlayInId, 0 | 1 | '0' | '1'>>;
}

const PLAY_IN_IDS_BY_REGION_AND_SEED: Partial<Record<RegionKey, Partial<Record<number, BracketPlayInId>>>> = {
  south: { 16: 'south-16' },
  west: { 11: 'west-11' },
  midwest: { 11: 'midwest-11', 16: 'midwest-16' },
};

const PLAY_IN_NAME_ALIASES: Record<BracketPlayInId, [string[], string[]]> = {
  'south-16': [['prairieviewam'], ['lehigh']],
  'west-11': [['texas'], ['ncstate', 'ncst']],
  'midwest-11': [['miamioh', 'miamiohio'], ['smu']],
  'midwest-16': [['umbc'], ['howard']],
};

function normalizeTeamName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function coercePlayInPick(value: unknown): 0 | 1 | null {
  if (value === 0 || value === '0') return 0;
  if (value === 1 || value === '1') return 1;
  return null;
}

function isCandidateLeaf(node: KalshiNode): node is KalshiLeafNode & { candidate_structured_target_ids: string[] } {
  return Boolean(node && !node.is_game && node.candidate_structured_target_ids?.length);
}

function getNodeWinnerId(node: KalshiNode): string | null {
  if (!node) return null;
  return 'user_structured_target_id' in node ? node.user_structured_target_id ?? null : null;
}

function getStructuredTargetName(payload: KalshiBracketPayload, structuredTargetId: string): string {
  return payload.hydrated_data?.structured_targets?.[structuredTargetId]?.name ?? structuredTargetId;
}

function getPlayInIdForLeaf(payload: KalshiBracketPayload, region: RegionKey, leaf: KalshiLeafNode): BracketPlayInId | null {
  const candidateIds = leaf.candidate_structured_target_ids;
  if (!candidateIds?.length) return null;

  const firstSeed = payload.details?.structured_targets_info?.[candidateIds[0]]?.seed;
  if (!firstSeed) return null;
  return PLAY_IN_IDS_BY_REGION_AND_SEED[region]?.[firstSeed] ?? null;
}

function getCandidateIdByOptionIndex(
  payload: KalshiBracketPayload,
  playInId: BracketPlayInId,
  candidateIds: string[],
  optionIndex: 0 | 1,
): string {
  const aliases = PLAY_IN_NAME_ALIASES[playInId][optionIndex];
  const matched = candidateIds.find((candidateId) => {
    const normalizedName = normalizeTeamName(getStructuredTargetName(payload, candidateId));
    return aliases.includes(normalizedName);
  });

  return matched ?? candidateIds[optionIndex] ?? candidateIds[0];
}

function inferPlayInPicks(
  payload: KalshiBracketPayload,
  overrides: Partial<Record<BracketPlayInId, 0 | 1>>,
): Record<BracketPlayInId, 0 | 1> {
  const winners = new Set<string>();

  for (const region of REGION_KEYS) {
    for (const node of payload.bracket[region] ?? []) {
      const winnerId = getNodeWinnerId(node);
      if (winnerId) winners.add(winnerId);
    }
  }

  for (const node of payload.bracket.final_four ?? []) {
    const winnerId = getNodeWinnerId(node);
    if (winnerId) winners.add(winnerId);
  }

  const picks: Record<BracketPlayInId, 0 | 1> = {
    'south-16': overrides['south-16'] ?? 0,
    'west-11': overrides['west-11'] ?? 0,
    'midwest-11': overrides['midwest-11'] ?? 0,
    'midwest-16': overrides['midwest-16'] ?? 0,
  };

  for (const region of REGION_KEYS) {
    for (const node of payload.bracket[region].slice(16)) {
      if (!isCandidateLeaf(node)) continue;

      const playInId = getPlayInIdForLeaf(payload, region, node);
      if (!playInId || overrides[playInId] !== undefined) continue;

      const selectedCandidateId = node.candidate_structured_target_ids.find((candidateId) => winners.has(candidateId));
      if (!selectedCandidateId) continue;

      const selectedName = normalizeTeamName(getStructuredTargetName(payload, selectedCandidateId));
      const optionIndex = PLAY_IN_NAME_ALIASES[playInId].findIndex((aliases) => aliases.includes(selectedName));
      if (optionIndex === 0 || optionIndex === 1) {
        picks[playInId] = optionIndex;
      }
    }
  }

  return picks;
}

function resolveLeafId(
  payload: KalshiBracketPayload,
  region: RegionKey,
  node: KalshiNode,
  playInPicks: Record<BracketPlayInId, 0 | 1>,
): string | null {
  if (!node) return null;
  if (node.is_game || node.user_structured_target_id) {
    return node.user_structured_target_id ?? null;
  }
  if (!node.candidate_structured_target_ids?.length) {
    return null;
  }

  const playInId = getPlayInIdForLeaf(payload, region, node);
  if (!playInId) {
    return node.candidate_structured_target_ids[0] ?? null;
  }

  return getCandidateIdByOptionIndex(payload, playInId, node.candidate_structured_target_ids, playInPicks[playInId]);
}

function getPickFromWinner(winnerId: string | null, participantIds: [string | null, string | null], label: string): 0 | 1 {
  if (winnerId === participantIds[0]) return 0;
  if (winnerId === participantIds[1]) return 1;
  throw new Error(`Unable to resolve winner for ${label}`);
}

function getRegionPicks(
  payload: KalshiBracketPayload,
  region: RegionKey,
  playInPicks: Record<BracketPlayInId, 0 | 1>,
): {
  r64: (0 | 1)[];
  r32: (0 | 1)[];
  s16: (0 | 1)[];
  e8: 0 | 1;
  championId: string;
} {
  const nodes = payload.bracket[region];
  if (!Array.isArray(nodes) || nodes.length < 32) {
    throw new Error(`Invalid ${region} region payload`);
  }

  const leafIds = nodes.slice(16).map((node) => resolveLeafId(payload, region, node, playInPicks));
  const r64WinnerIds = nodes.slice(8, 16).map((node) => getNodeWinnerId(node));
  const r32WinnerIds = nodes.slice(4, 8).map((node) => getNodeWinnerId(node));
  const s16WinnerIds = nodes.slice(2, 4).map((node) => getNodeWinnerId(node));
  const championId = getNodeWinnerId(nodes[1]);

  if (!championId) {
    throw new Error(`Missing regional champion for ${region}`);
  }

  const r64 = r64WinnerIds.map((winnerId, index) =>
    getPickFromWinner(winnerId, [leafIds[index * 2] ?? null, leafIds[index * 2 + 1] ?? null], `${region} R64 game ${index}`),
  );

  const r32 = r32WinnerIds.map((winnerId, index) =>
    getPickFromWinner(winnerId, [r64WinnerIds[index * 2] ?? null, r64WinnerIds[index * 2 + 1] ?? null], `${region} R32 game ${index}`),
  );

  const s16 = s16WinnerIds.map((winnerId, index) =>
    getPickFromWinner(winnerId, [r32WinnerIds[index * 2] ?? null, r32WinnerIds[index * 2 + 1] ?? null], `${region} S16 game ${index}`),
  ) as [0 | 1, 0 | 1];

  const e8 = getPickFromWinner(championId, [s16WinnerIds[0] ?? null, s16WinnerIds[1] ?? null], `${region} E8 game`);

  return { r64, r32, s16, e8, championId };
}

export function buildBracketStateFromKalshiPayload(input: unknown): {
  picks: (number | null)[];
  playInPicks: Record<BracketPlayInId, 0 | 1>;
} {
  const payload = input as KalshiBracketPayload;
  if (!payload?.bracket?.south || !payload?.bracket?.east || !payload?.bracket?.west || !payload?.bracket?.midwest || !payload?.bracket?.final_four) {
    throw new Error('Expected a Kalshi bracket payload with south/east/west/midwest/final_four arrays');
  }

  const overrideEntries = Object.entries(payload.playInPicks ?? {}).reduce((acc, [playInId, value]) => {
    const coerced = coercePlayInPick(value);
    if (coerced !== null) {
      acc[playInId as BracketPlayInId] = coerced;
    }
    return acc;
  }, {} as Partial<Record<BracketPlayInId, 0 | 1>>);

  const playInPicks = inferPlayInPicks(payload, overrideEntries);
  const south = getRegionPicks(payload, 'south', playInPicks);
  const east = getRegionPicks(payload, 'east', playInPicks);
  const west = getRegionPicks(payload, 'west', playInPicks);
  const midwest = getRegionPicks(payload, 'midwest', playInPicks);

  const finalFour = payload.bracket.final_four;
  const semifinalLeftWinnerId = getNodeWinnerId(finalFour[2]);
  const semifinalRightWinnerId = getNodeWinnerId(finalFour[3]);
  const championId = getNodeWinnerId(finalFour[1]);

  if (!semifinalLeftWinnerId || !semifinalRightWinnerId || !championId) {
    throw new Error('Missing Final Four winners in payload');
  }

  const picks = new Array<number | null>(63).fill(null);

  [east, south, west, midwest].forEach((regionPicks, regionIndex) => {
    regionPicks.r64.forEach((pick, index) => {
      picks[regionIndex * 8 + index] = pick;
    });

    regionPicks.r32.forEach((pick, index) => {
      picks[32 + regionIndex * 4 + index] = pick;
    });

    regionPicks.s16.forEach((pick, index) => {
      picks[48 + regionIndex * 2 + index] = pick;
    });

    picks[56 + regionIndex] = regionPicks.e8;
  });

  picks[60] = getPickFromWinner(semifinalLeftWinnerId, [east.championId, south.championId], 'Final Four left semifinal');
  picks[61] = getPickFromWinner(semifinalRightWinnerId, [west.championId, midwest.championId], 'Final Four right semifinal');
  picks[62] = getPickFromWinner(championId, [semifinalLeftWinnerId, semifinalRightWinnerId], 'Championship');

  return { picks, playInPicks };
}

export function encodeKalshiBracketPayload(input: unknown): string {
  return encodeBracketState(buildBracketStateFromKalshiPayload(input));
}
