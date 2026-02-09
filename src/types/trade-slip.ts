export type TradeSlipMode = 'single' | 'combo' | 'single-old' | 'combo-old' | 'prizepick' | 'coinbase' | 'horizontal' | 'biggame' | 'biggame-combo';

export interface ComboLeg {
  id: string;
  question: string;
  answer: 'Yes' | 'No';
  image: string | null;
}

export interface ComboMarket {
  id: string;
  text: string; // e.g., "Philadelphia" or "Total game point is 47 or more"
  prefix?: string; // e.g., "No" or "Yes" - optional prefix shown before the text
  resolved?: boolean; // Whether this market has been resolved (shows green check vs grey circle)
}

export interface ComboEvent {
  id: string;
  name: string; // e.g., "Kansas City @ Philadelphia"
  markets: ComboMarket[];
  color1?: string; // First team/side color
  color2?: string; // Second team/side color
}

export interface ComboCategory {
  id: string;
  name: string; // e.g., "Pro Football"
  events: ComboEvent[];
}

export interface PrizePickPlayer {
  id: string;
  playerName: string;
  team: string;
  position: string;
  number: string;
  opponent: string;
  homeScore: string;
  awayScore: string;
  statType: string;
  statValue: number;
  image: string | null;
  league: string;
  gameStatus: string;
}

export interface CoinbasePrediction {
  id: string;
  assetName: string;
  ticker: string;
  predictionType: string;
  targetValue: number;
  currentValue: number;
  timeframe: string;
  status: string;
  percentChange: number;
  image: string | null;
}

export interface TradeSlipConfig {
  mode: TradeSlipMode;
  title: string;
  marketName: string;
  outcome: string;
  image: string | null;
  wager: number;
  odds: number;
  tradeSide: 'Yes' | 'No' | 'Custom';
  customSideColor?: string;
  customSideText?: string;
  showWatermark: boolean;
  showTimestamp: boolean;
  showCashedOut: boolean;
  backgroundColor: string;
  // Single trade slip additional fields
  timestamp?: string;
  comboOdds: number;
  comboLegs: ComboLeg[];
  comboCashOut?: number;
  // New combo slip structure
  comboCategories: ComboCategory[];
  comboPayout: number;
  comboCost: number;
  prizePickPlayers: PrizePickPlayer[];
  prizePickWager: number;
  prizePickPayout: number;
  prizePickType: string;
  prizePickShowTeam: boolean;
  prizePickShowPosition: boolean;
  prizePickShowNumber: boolean;
  prizePickShowScore: boolean;
  coinbasePredictions: CoinbasePrediction[];
  coinbaseWager: number;
  coinbasePayout: number;
  coinbasePlayType: string;
  // Big Game fields
  bigGameTeam1: string;
  bigGameTeam2: string;
  bigGameTitle: string;
  bigGameColor1: string;
  bigGameColor2: string;
  isPaidOut: boolean;
}

export interface CoinbaseConfig {
  coinbasePredictions: CoinbasePrediction[];
  coinbaseWager: number;
  coinbasePayout: number;
  coinbasePlayType: string;
  showWatermark: boolean;
}
