export const OUTCOME_COLORS = ['#00DD94', '#265CFF', '#000000', '#FF5A5A', '#9333EA', '#F59E0B'];

export interface MarketOutcome {
  id: string;
  name: string;
  subtitle: string; // e.g., "Republican", "Democratic"
  image: string | null; // avatar image for outcome
  yesPrice: number; // 0-100 representing cents
  noPrice: number;
  volume: number;
  change: number; // change value (e.g., -22)
  color: string; // line color for chart
  customTrendData: number[] | null; // custom trend data for this outcome (array of 0-100 values)
}

export interface ChartDataPoint {
  time: number; // timestamp
  value: number; // 0-100 representing probability
  [key: string]: number; // dynamic keys for multi-outcome (value_outcome-id)
}

export interface MarketPageConfig {
  // Market header
  category: string;
  subcategory: string; // e.g., "US Elections" for breadcrumb
  title: string;
  subtitle: string;
  image: string | null;

  // User profile (top right)
  profileImage: string | null;
  portfolioBalance: string; // e.g., "$1,250.00"

  // Market timing
  eventStatus: 'live' | 'upcoming' | 'closed';
  eventDate: string; // e.g., "Jan 21, 6:00pm EST"
  countdownText: string; // e.g., "Begins in 28m 40s"

  // Market outcomes
  outcomes: MarketOutcome[];

  // Chart configuration
  chartData: ChartDataPoint[];
  chartTimeRange: '1D' | '1W' | '1M' | 'ALL';
  volume: string; // e.g., "$5.9M" - displayed volume

  // Order form state (for fake orders)
  selectedOutcome: string | null;
  selectedSide: 'Yes' | 'No';
  orderAmount: number;
  limitPrice: number;
  sidebarState: 'trading' | 'review' | 'confirmation';

  // Display options
  showWatermark: boolean;
  showRules: boolean;
  rulesText: string;
  showRelatedMarkets: boolean;
  showReviewPage: boolean;

  // Related markets
  relatedMarkets: RelatedMarket[];

  // Submitted orders (fake)
  submittedOrders: SubmittedOrder[];

  // Payout indicator
  payoutAmount: string; // e.g., "+$5"

  // Theme
  darkMode?: boolean; // Enable dark mode for the market page
}

export interface RelatedMarket {
  id: string;
  title: string;
  image: string | null;
}

export interface SubmittedOrder {
  id: string;
  outcomeName: string;
  side: 'Yes' | 'No';
  amount: number;
  price: number;
  timestamp: Date;
  status: 'pending' | 'filled' | 'cancelled';
}
