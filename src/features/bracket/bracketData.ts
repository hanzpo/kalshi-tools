import {
  BracketConfig,
  BracketPlayInId,
  BracketPlayInOption,
  BracketRegion,
  BracketTeam,
} from '../../types/bracket';
import { decodeBracketState, encodeBracketState } from './bracketStateCodec';

export const DEFAULT_BRACKET_TITLE = '$1 BILLION\nBRACKET';
export const DEFAULT_BRACKET_SUBTITLE = "Men's College Basketball";

function team(name: string, seed: number, fullName: string, bgColor: string, textColor: string = 'rgba(255,255,255,0.95)'): BracketTeam {
  return { name, seed, fullName, bgColor, textColor };
}

function playInOption(
  name: string,
  fullName: string,
  bgColor: string,
  textColor: string = 'rgba(255,255,255,0.95)',
): BracketPlayInOption {
  return { name, fullName, bgColor, textColor };
}

function playInTeam(seed: number, playInId: BracketPlayInId, options: [BracketPlayInOption, BracketPlayInOption]): BracketTeam {
  const [firstOption] = options;
  return {
    ...team(firstOption.name, seed, firstOption.fullName, firstOption.bgColor, firstOption.textColor),
    playInId,
    playInOptions: options,
  };
}

export const PLAY_IN_IDS: BracketPlayInId[] = ['south-16', 'west-11', 'midwest-11', 'midwest-16'];

// South Region — Bottom Left
const southTeams: BracketTeam[] = [
  team('FLA', 1, 'Florida', '#0021A5', 'rgba(250,70,22,0.9)'),
  team('HOU', 2, 'Houston', '#C8102E', 'rgba(255,255,255,0.9)'),
  team('ILL', 3, 'Illinois', '#13294B', 'rgba(232,74,39,0.9)'),
  team('NEB', 4, 'Nebraska', '#E41C38', 'rgba(255,255,255,0.9)'),
  team('VAN', 5, 'Vanderbilt', '#1A1A1A', 'rgba(197,167,111,0.9)'),
  team('UNC', 6, 'North Carolina', '#4B9CD3', 'rgba(255,255,255,0.9)'),
  team('SMC', 7, "St. Mary's", '#AC1A2F', 'rgba(255,255,255,0.9)'),
  team('CLE', 8, 'Clemson', '#F56600', 'rgba(255,255,255,0.9)'),
  team('IOW', 9, 'Iowa', '#000000', 'rgba(255,205,0,0.9)'),
  team('TAM', 10, 'Texas A&M', '#500000', 'rgba(255,255,255,0.9)'),
  team('VCU', 11, 'VCU', '#F7B71D', 'rgba(0,0,0,0.9)'),
  team('MCN', 12, 'McNeese', '#005CA9', 'rgba(255,212,0,0.9)'),
  team('TRY', 13, 'Troy', '#8B2332', 'rgba(255,255,255,0.9)'),
  team('PEN', 14, 'Penn', '#011F5B', 'rgba(204,0,0,0.9)'),
  team('IDA', 15, 'Idaho', '#666666', 'rgba(255,204,0,0.9)'),
  playInTeam(16, 'south-16', [
    playInOption('PV', 'Prairie View A&M', '#5F249F', 'rgba(255,212,0,0.9)'),
    playInOption('LEH', 'Lehigh', '#653819', 'rgba(255,255,255,0.9)'),
  ]),
];

// East Region — Top Left
const eastTeams: BracketTeam[] = [
  team('DUK', 1, 'Duke', '#003087', 'rgba(255,255,255,0.9)'),
  team('UCN', 2, 'UConn', '#000E2F', 'rgba(255,255,255,0.9)'),
  team('MSU', 3, 'Mich. St.', '#18453B', 'rgba(255,255,255,0.9)'),
  team('KAN', 4, 'Kansas', '#0051BA', 'rgba(232,0,13,0.9)'),
  team('STJ', 5, "St. John's", '#D51032', 'rgba(255,255,255,0.9)'),
  team('LOU', 6, 'Louisville', '#AD0000', 'rgba(255,255,255,0.9)'),
  team('UCL', 7, 'UCLA', '#2D68C4', 'rgba(242,169,0,0.9)'),
  team('OSU', 8, 'Ohio St.', '#BB0000', 'rgba(255,255,255,0.9)'),
  team('TCU', 9, 'TCU', '#4D1979', 'rgba(255,255,255,0.9)'),
  team('UCF', 10, 'UCF', '#000000', 'rgba(186,155,55,0.9)'),
  team('USF', 11, 'S. Florida', '#006747', 'rgba(205,187,85,0.9)'),
  team('UNI', 12, 'N. Iowa', '#4B116F', 'rgba(255,204,0,0.9)'),
  team('CBU', 13, 'Cal Baptist', '#002F65', 'rgba(180,152,0,0.9)'),
  team('NDS', 14, 'North Dakota State', '#006633', 'rgba(255,204,0,0.9)'),
  team('FUR', 15, 'Furman', '#582C83', 'rgba(255,255,255,0.9)'),
  team('SIE', 16, 'Siena', '#007A33', 'rgba(255,204,0,0.9)'),
];

// West Region — Top Right
const westTeams: BracketTeam[] = [
  team('ARZ', 1, 'Arizona', '#002147', 'rgba(204,0,51,0.9)'),
  team('PUR', 2, 'Purdue', '#000000', 'rgba(207,184,124,0.9)'),
  team('GON', 3, 'Gonzaga', '#002366', 'rgba(200,16,46,0.9)'),
  team('ARK', 4, 'Arkansas', '#9D2235', 'rgba(255,255,255,0.9)'),
  team('WIS', 5, 'Wisconsin', '#C5050C', 'rgba(255,255,255,0.9)'),
  team('BYU', 6, 'BYU', '#002E5D', 'rgba(255,255,255,0.9)'),
  team('MIA', 7, 'Miami FL', '#005030', 'rgba(244,115,33,0.9)'),
  team('VIL', 8, 'Villanova', '#003366', 'rgba(255,255,255,0.9)'),
  team('USU', 9, 'Utah St.', '#00304D', 'rgba(140,197,221,0.9)'),
  team('MIZ', 10, 'Missouri', '#F1B300', 'rgba(0,0,0,0.9)'),
  playInTeam(11, 'west-11', [
    playInOption('TEX', 'Texas', '#BF5700', 'rgba(255,255,255,0.9)'),
    playInOption('NCS', 'NC State', '#CC0000', 'rgba(255,255,255,0.9)'),
  ]),
  team('HPU', 12, 'High Point', '#5C068C', 'rgba(255,255,255,0.9)'),
  team('HAW', 13, "Hawai'i", '#024731', 'rgba(255,255,255,0.9)'),
  team('KSU', 14, 'Kennesaw State', '#000000', 'rgba(193,153,0,0.9)'),
  team('QUE', 15, 'Queens', '#6E0C14', 'rgba(196,160,0,0.9)'),
  team('LIU', 16, 'LIU', '#003DA5', 'rgba(255,204,0,0.9)'),
];

// Midwest Region — Bottom Right
const midwestTeams: BracketTeam[] = [
  team('MCH', 1, 'Michigan', '#00274C', 'rgba(255,203,5,0.9)'),
  team('ISU', 2, 'Iowa State', '#C8102E', 'rgba(241,190,72,0.9)'),
  team('UVA', 3, 'Virginia', '#232D4B', 'rgba(229,114,0,0.9)'),
  team('ALA', 4, 'Alabama', '#9E1B32', 'rgba(255,255,255,0.9)'),
  team('TTU', 5, 'Texas Tech', '#CC0000', 'rgba(255,255,255,0.9)'),
  team('TEN', 6, 'Tennessee', '#FF8200', 'rgba(255,255,255,0.9)'),
  team('UK', 7, 'Kentucky', '#0033A0', 'rgba(255,255,255,0.9)'),
  team('UGA', 8, 'Georgia', '#BA0C2F', 'rgba(255,255,255,0.9)'),
  team('SLU', 9, 'Saint Louis', '#003DA5', 'rgba(255,255,255,0.9)'),
  team('SCU', 10, 'Santa Clara', '#862633', 'rgba(255,255,255,0.9)'),
  playInTeam(11, 'midwest-11', [
    playInOption('MOH', 'Miami (OH)', '#B61E2E', 'rgba(255,255,255,0.9)'),
    playInOption('SMU', 'SMU', '#003057', 'rgba(204,0,53,0.9)'),
  ]),
  team('AKR', 12, 'Akron', '#002366', 'rgba(196,160,0,0.9)'),
  team('HOF', 13, 'Hofstra', '#0061FF', 'rgba(0,0,0,0.9)'),
  team('WSU', 14, 'Wright St.', '#006833', 'rgba(255,204,0,0.9)'),
  team('TNS', 15, 'Tenn. St.', '#003087', 'rgba(255,255,255,0.9)'),
  playInTeam(16, 'midwest-16', [
    playInOption('UMB', 'UMBC', '#000000', 'rgba(255,204,0,0.9)'),
    playInOption('HOW', 'Howard', '#003087', 'rgba(255,255,255,0.9)'),
  ]),
];

export const DEFAULT_REGIONS: [BracketRegion, BracketRegion, BracketRegion, BracketRegion] = [
  { name: 'East', teams: eastTeams },
  { name: 'South', teams: southTeams },
  { name: 'West', teams: westTeams },
  { name: 'Midwest', teams: midwestTeams },
];

export function createRandomPlayInPicks(): Record<BracketPlayInId, 0 | 1> {
  return {
    'south-16': Math.random() < 0.5 ? 0 : 1,
    'west-11': Math.random() < 0.5 ? 0 : 1,
    'midwest-11': Math.random() < 0.5 ? 0 : 1,
    'midwest-16': Math.random() < 0.5 ? 0 : 1,
  };
}

export function fillMissingPicks(
  existingPicks: (number | null)[],
  playInPicks: Record<BracketPlayInId, 0 | 1>,
): (number | null)[] {
  const picks = [...existingPicks];
  const tempConfig: BracketConfig = {
    regions: DEFAULT_REGIONS,
    picks,
    playInPicks,
  };

  for (let gameIndex = 0; gameIndex < 63; gameIndex += 1) {
    const [teamA, teamB] = getMatchupParticipants(tempConfig, gameIndex);
    if (!teamA || !teamB) continue;
    if (picks[gameIndex] === null) {
      picks[gameIndex] = Math.random() < 0.5 ? 0 : 1;
    }
  }

  return picks;
}

export function createRandomPicks(playInPicks: Record<BracketPlayInId, 0 | 1>): (number | null)[] {
  return fillMissingPicks(new Array(63).fill(null), playInPicks);
}

export function createDefaultConfig(): BracketConfig {
  const playInPicks = createRandomPlayInPicks();
  return {
    regions: DEFAULT_REGIONS,
    picks: createRandomPicks(playInPicks),
    playInPicks,
  };
}

// Standard bracket matchup order: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
export const SEED_MATCHUPS: [number, number][] = [
  [0, 15],  // 1 vs 16
  [7, 8],   // 8 vs 9
  [4, 11],  // 5 vs 12
  [3, 12],  // 4 vs 13
  [5, 10],  // 6 vs 11
  [2, 13],  // 3 vs 14
  [6, 9],   // 7 vs 10
  [1, 14],  // 2 vs 15
];

function resolveTeam(config: BracketConfig, team: BracketTeam): BracketTeam {
  if (!team.playInId || !team.playInOptions) {
    return team;
  }

  const selectedOption = team.playInOptions[config.playInPicks[team.playInId]];
  return {
    ...team,
    name: selectedOption.name,
    fullName: selectedOption.fullName,
    bgColor: selectedOption.bgColor,
    textColor: selectedOption.textColor,
  };
}

// Get the two teams in a given R64 matchup for a region
export function getR64Matchup(region: BracketRegion, matchupIndex: number): [BracketTeam, BracketTeam] {
  const [a, b] = SEED_MATCHUPS[matchupIndex];
  return [region.teams[a], region.teams[b]];
}

// Get the team that won a specific game, or null if not picked
export function getWinner(
  config: BracketConfig,
  gameIndex: number
): BracketTeam | null {
  const pick = config.picks[gameIndex];
  if (pick === null) return null;

  const participants = getMatchupParticipants(config, gameIndex);
  if (!participants[0] || !participants[1]) return null;
  return participants[pick];
}

// Get the two participants of any game
export function getMatchupParticipants(
  config: BracketConfig,
  gameIndex: number
): [BracketTeam | null, BracketTeam | null] {
  // R64: games 0-31 (8 per region)
  if (gameIndex < 32) {
    const regionIndex = Math.floor(gameIndex / 8);
    const matchupInRegion = gameIndex % 8;
    const [a, b] = getR64Matchup(config.regions[regionIndex], matchupInRegion);
    return [resolveTeam(config, a), resolveTeam(config, b)];
  }

  // Later rounds: participants are winners of two previous games
  const feederBase = getFeederGames(gameIndex);
  const teamA = getWinner(config, feederBase[0]);
  const teamB = getWinner(config, feederBase[1]);
  return [teamA, teamB];
}

function getFeederGames(gameIndex: number): [number, number] {
  if (gameIndex >= 32 && gameIndex < 48) {
    const offset = gameIndex - 32;
    return [offset * 2, offset * 2 + 1];
  }
  if (gameIndex >= 48 && gameIndex < 56) {
    const offset = gameIndex - 48;
    return [32 + offset * 2, 32 + offset * 2 + 1];
  }
  if (gameIndex >= 56 && gameIndex < 60) {
    const offset = gameIndex - 56;
    return [48 + offset * 2, 48 + offset * 2 + 1];
  }
  if (gameIndex >= 60 && gameIndex < 62) {
    const offset = gameIndex - 60;
    return [56 + offset * 2, 56 + offset * 2 + 1];
  }
  return [60, 61];
}

// Clear downstream picks when a pick changes
export function clearDownstreamPicks(picks: (number | null)[], gameIndex: number): (number | null)[] {
  const newPicks = [...picks];
  const queue = [gameIndex];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const nextGame = getNextGame(current);
    if (nextGame !== null && newPicks[nextGame] !== null) {
      newPicks[nextGame] = null;
      queue.push(nextGame);
    }
  }
  return newPicks;
}

function getNextGame(gameIndex: number): number | null {
  if (gameIndex < 32) return 32 + Math.floor(gameIndex / 2);
  if (gameIndex < 48) return 48 + Math.floor((gameIndex - 32) / 2);
  if (gameIndex < 56) return 56 + Math.floor((gameIndex - 48) / 2);
  if (gameIndex < 60) return 60 + Math.floor((gameIndex - 56) / 2);
  if (gameIndex < 62) return 62;
  return null;
}

// Encode bracket state to URL-safe base64 (compact: picks + play-in picks)
export function encodeBracket(config: BracketConfig): string {
  return encodeBracketState({
    picks: config.picks,
    playInPicks: config.playInPicks,
  });
}

// Decode bracket state from URL-safe base64
export function decodeBracket(encoded: string): BracketConfig | null {
  const decoded = decodeBracketState(encoded);
  if (!decoded) {
    return null;
  }

  return {
    regions: DEFAULT_REGIONS,
    picks: fillMissingPicks(decoded.picks, decoded.playInPicks),
    playInPicks: decoded.playInPicks,
  };
}
