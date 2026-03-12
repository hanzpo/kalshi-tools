export interface OverlayConfig {
  width: number;
  height: number;
  background: BackgroundConfig;
  elements: OverlayElement[];
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'transparent';
  color?: string;
  gradient?: string;
}

export interface OverlayElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  props: Record<string, any>;
}

// Live data fetched from the API (not stored in URL)
export interface MarketLiveData {
  title: string;
  odds: number; // 0-100
  volume: number;
  status: 'active' | 'closed' | 'error';
  outcomes?: Array<{ name: string; odds: number }>;
  /** Maps market ticker -> human-readable outcome name (from yes_sub_title) */
  tickerToName?: Record<string, string>;
  marketType: 'binary' | 'multi' | 'forecast';
  lastUpdated: number;
  trades?: LiveTrade[];
}

export interface LiveTrade {
  id: string;
  ticker: string;
  side: 'yes' | 'no';
  contracts: number;
  priceCents: number; // 0-100
  costDollars: number;
  timestamp: number;
}
