export interface MarketOutcome {
  id: string;
  name: string;
  yesPrice: number; // 0-100 representing cents
  noPrice: number;
  volume: number;
}

export interface ChartDataPoint {
  time: number; // timestamp
  value: number; // 0-100 representing probability
}

export interface MarketPageConfig {
  // Market header
  category: string;
  title: string;
  subtitle: string;
  image: string | null;

  // Market outcomes
  outcomes: MarketOutcome[];

  // Chart configuration
  chartData: ChartDataPoint[];
  chartTimeRange: '1H' | '6H' | '1D' | '1W' | '1M' | 'ALL';

  // Order form state (for fake orders)
  selectedOutcome: string | null;
  selectedSide: 'Yes' | 'No';
  orderAmount: number;
  limitPrice: number;

  // Display options
  showWatermark: boolean;
  showRules: boolean;
  rulesText: string;

  // Submitted orders (fake)
  submittedOrders: SubmittedOrder[];
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
