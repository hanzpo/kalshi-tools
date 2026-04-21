export type MarketType = 'binary' | 'multi' | 'forecast';
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
  darkMode?: boolean; // Enable dark mode for the chart
  category?: string; // First half of breadcrumb above title (e.g., "Sports")
  subcategory?: string; // Second half of breadcrumb above title (e.g., "Basketball")
  showCategoryLabel?: boolean; // Whether to display the category breadcrumb
}

export interface DataPoint {
  time: string;
  value: number;
  [key: string]: string | number; // Allow dynamic outcome keys like value_outcome1, value_outcome2
}
