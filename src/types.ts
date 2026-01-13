export type MarketType = 'binary' | 'multi' | 'forecast';
export type TradeSlipMode = 'single' | 'parlay' | 'prizepick' | 'coinbase';
export type TimeHorizon = '6H' | '1D' | '1W' | '1M' | 'ALL';

export interface Outcome {
  id: string;
  name: string;
  color: string;
  currentOdds: number;
  customTrendData: number[] | null;
}

export interface MarketConfig {
  title: string;
  image: string | null;
  marketType: MarketType;
  currentOdds: number;
  volume: number;
  volatility: number;
  customTrendData: number[] | null;
  outcomes: Outcome[];
  startDate: Date;
  endDate: Date;
  timeHorizon: TimeHorizon;
  showWatermark: boolean;
  forecastValue?: number;
  forecastUnit?: string;
  mutuallyExclusive?: boolean; // For multi-outcome markets: true = odds sum to 100%, false = independent odds
  searchQuery?: string; // For Google search result builder
}

export interface DataPoint {
  time: string;
  value: number;
  [key: string]: string | number; // Allow dynamic outcome keys like value_outcome1, value_outcome2
}

export interface ParlayLeg {
  id: string;
  question: string;
  answer: 'Yes' | 'No';
  image: string | null;
}

export interface ComboMarket {
  id: string;
  text: string; // e.g., "Philadelphia" or "Total game point is 47 or more"
  prefix?: string; // e.g., "No" or "Yes" - optional prefix shown before the text
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

export interface TradeSlipConfig {
  mode: TradeSlipMode;
  title: string;
  marketName: string;
  outcome: string;
  image: string | null;
  wager: number;
  odds: number;
  tradeSide: 'Yes' | 'No';
  showWatermark: boolean;
  // Single trade slip additional fields
  timestamp?: string;
  parlayOdds: number;
  parlayLegs: ParlayLeg[];
  parlayCashOut?: number;
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

export interface CoinbaseConfig {
  coinbasePredictions: CoinbasePrediction[];
  coinbaseWager: number;
  coinbasePayout: number;
  coinbasePlayType: string;
  showWatermark: boolean;
}
