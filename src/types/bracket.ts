export type BracketPlayInId =
  | 'south-16'
  | 'west-11'
  | 'midwest-11'
  | 'midwest-16';

export interface BracketPlayInOption {
  name: string;
  fullName: string;
  bgColor: string;
  textColor: string;
}

export interface BracketTeam {
  name: string; // 3-letter abbreviation
  seed: number;
  fullName: string;
  bgColor: string;
  textColor: string;
  playInId?: BracketPlayInId;
  playInOptions?: [BracketPlayInOption, BracketPlayInOption];
}

export interface BracketRegion {
  name: string;
  teams: BracketTeam[]; // 16 teams in seed order (1-16)
}

export interface BracketConfig {
  regions: [BracketRegion, BracketRegion, BracketRegion, BracketRegion]; // [topLeft, topRight, bottomLeft, bottomRight]
  picks: (number | null)[]; // 63 picks: index 0-31=R64, 32-47=R32, 48-55=S16, 56-59=E8, 60-61=F4, 62=Championship. Value is 0 or 1 (which team in the matchup wins), null = not picked
  playInPicks: Record<BracketPlayInId, 0 | 1>;
}
