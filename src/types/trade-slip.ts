export type TradeSlipMode = 'single' | 'combo' | 'single-old' | 'combo-old' | 'horizontal' | 'championship';

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
  isPaidOut: boolean;
  customPayout?: number;
  championshipSecondaryColor: string;
}

