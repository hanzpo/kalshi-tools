/**
 * Kalshi API utilities for fetching market data
 * API Docs: https://docs.kalshi.com/api-reference/market/get-market
 */

// Use local proxy path - works in both dev (Vite proxy) and prod (Cloudflare Pages Function)
const KALSHI_API_PROXY = '/api/kalshi';

function getApiUrl(endpoint: string): string {
  return `${KALSHI_API_PROXY}${endpoint}`;
}

export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: 'binary' | 'scalar';
  title: string;
  subtitle: string;
  yes_sub_title: string;
  no_sub_title: string;
  status: string;
  last_price_dollars: string;
  yes_bid_dollars: string;
  yes_ask_dollars: string;
  volume: number;
  volume_24h: number;
  open_interest: number;
  close_time: string;
  result?: string;
}

export interface KalshiEvent {
  event_ticker: string;
  title: string;
  sub_title: string;
  category: string;
  mutually_exclusive: boolean;
  series_ticker?: string;
}

export interface KalshiEventResponse {
  event: KalshiEvent;
  markets: KalshiMarket[];
}

export interface KalshiImportResult {
  title: string;
  image: string | null;
  marketType: 'binary' | 'multi' | 'forecast';
  currentOdds: number;
  volume: number;
  outcomes?: Array<{
    name: string;
    currentOdds: number;
  }>;
  mutuallyExclusive?: boolean;
  forecastValue?: number;
  forecastUnit?: string;
}

/**
 * Parse a Kalshi URL to extract the event ticker
 * Supports formats:
 * - https://kalshi.com/markets/kxsb/super-bowl/kxsb-26
 * - https://kalshi.com/markets/TICKER
 * - https://kalshi.com/events/TICKER
 * - https://www.kalshi.com/markets/kxsb/super-bowl/kxsb-26
 */
export function parseKalshiUrl(url: string): string | null {
  try {
    // Normalize the URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const parsed = new URL(normalizedUrl);

    // Check if it's a Kalshi domain
    if (!parsed.hostname.includes('kalshi.com')) {
      return null;
    }

    // Extract ticker from path
    // Paths can be:
    // - /markets/TICKER (simple)
    // - /markets/series/slug/event-ticker (full path like /markets/kxsb/super-bowl/kxsb-26)
    // - /events/TICKER
    const pathParts = parsed.pathname.split('/').filter(Boolean);

    if (pathParts.length === 0) {
      return null;
    }

    if (pathParts[0] === 'markets' || pathParts[0] === 'events') {
      if (pathParts.length >= 2) {
        // For full paths like /markets/kxsb/super-bowl/kxsb-26, get the last part
        // For simple paths like /markets/TICKER, get the second part
        const ticker = pathParts[pathParts.length - 1];
        // Convert to uppercase for the API
        return ticker.toUpperCase();
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a string is a valid Kalshi URL
 */
export function isKalshiUrl(text: string): boolean {
  return parseKalshiUrl(text) !== null;
}

/**
 * Fetch event data from Kalshi API
 */
export async function fetchKalshiEvent(eventTicker: string): Promise<KalshiEventResponse> {
  const url = getApiUrl(`/events/${eventTicker}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Fetch market data from Kalshi API
 */
export async function fetchKalshiMarket(ticker: string): Promise<KalshiMarket> {
  const url = getApiUrl(`/markets/${ticker}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch market: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.market;
}

/**
 * Import a Kalshi market from URL
 * Tries to fetch as event first, then falls back to market
 */
export async function importKalshiMarket(url: string): Promise<KalshiImportResult> {
  const ticker = parseKalshiUrl(url);
  if (!ticker) {
    throw new Error('Invalid Kalshi URL');
  }

  // Try to fetch as event first (which includes all markets)
  try {
    const eventResponse = await fetchKalshiEvent(ticker);
    return eventToImportResult(eventResponse);
  } catch {
    // If event fetch fails, try as a direct market ticker
    try {
      const market = await fetchKalshiMarket(ticker);
      return marketToImportResult(market);
    } catch {
      // Re-throw if both fail
      throw new Error(`Could not find market or event with ticker: ${ticker}`);
    }
  }
}

/**
 * Convert a Kalshi event response to import result
 */
function eventToImportResult(response: KalshiEventResponse): KalshiImportResult {
  const { event, markets } = response;

  // If single market, treat as binary
  if (markets.length === 1) {
    const market = markets[0];
    const odds = getMarketOdds(market);

    return {
      title: event.title || market.title,
      image: null,
      marketType: market.market_type === 'scalar' ? 'forecast' : 'binary',
      currentOdds: odds,
      volume: market.volume || 0,
      forecastValue: market.market_type === 'scalar' ? odds : undefined,
      forecastUnit: market.market_type === 'scalar' ? '' : undefined,
    };
  }

  // Multi-outcome market - filter to active markets with meaningful odds
  const activeMarkets = markets
    .filter(m => m.status !== 'finalized' || getMarketOdds(m) > 0)
    .sort((a, b) => getMarketOdds(b) - getMarketOdds(a)); // Sort by odds descending

  // Take top outcomes (limit to reasonable number for display)
  const topMarkets = activeMarkets.slice(0, 10);

  const totalVolume = markets.reduce((sum, m) => sum + (m.volume || 0), 0);

  // Build title with subtitle if available
  const title = event.sub_title
    ? `${event.title} ${event.sub_title}`
    : event.title;

  return {
    title,
    image: null,
    marketType: 'multi',
    currentOdds: 50, // Not used for multi
    volume: totalVolume,
    mutuallyExclusive: event.mutually_exclusive !== false,
    outcomes: topMarkets.map((market) => ({
      name: market.yes_sub_title || market.title || market.ticker,
      currentOdds: getMarketOdds(market),
    })),
  };
}

/**
 * Convert a single Kalshi market to import result
 */
function marketToImportResult(market: KalshiMarket): KalshiImportResult {
  const odds = getMarketOdds(market);

  return {
    title: market.title || market.ticker,
    image: null,
    marketType: market.market_type === 'scalar' ? 'forecast' : 'binary',
    currentOdds: odds,
    volume: market.volume || 0,
    forecastValue: market.market_type === 'scalar' ? odds : undefined,
    forecastUnit: market.market_type === 'scalar' ? '' : undefined,
  };
}

// ---- Trades ----

export interface KalshiTrade {
  trade_id: string;
  ticker: string;
  count_fp: string;
  yes_price_dollars: string;
  no_price_dollars: string;
  taker_side: 'yes' | 'no';
  created_time: string;
}

export interface KalshiTradesResponse {
  trades: KalshiTrade[];
  cursor: string;
}

/**
 * Fetch recent trades for a market ticker.
 */
export async function fetchKalshiTrades(ticker: string, limit = 20): Promise<KalshiTrade[]> {
  const url = getApiUrl(`/markets/trades?ticker=${encodeURIComponent(ticker)}&limit=${limit}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`);
  }
  const data: KalshiTradesResponse = await response.json();
  return data.trades || [];
}

/**
 * Fetch recent trades for an event by fetching the event's markets
 * and then querying trades for each market ticker individually.
 * The /markets/trades?event_ticker= param does NOT filter correctly.
 */
export async function fetchKalshiEventTrades(eventTicker: string, limit = 20): Promise<KalshiTrade[]> {
  // Get all market tickers in this event
  const { markets } = await fetchKalshiEvent(eventTicker);
  const tickers = markets
    .filter(m => m.status !== 'finalized')
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 5) // Limit to top 5 markets by volume to avoid rate limits
    .map(m => m.ticker);

  if (tickers.length === 0) return [];

  // Fetch trades for each market sequentially to avoid rate limits
  const allTrades: KalshiTrade[] = [];
  const perMarket = Math.max(3, Math.ceil(limit / tickers.length));
  for (const ticker of tickers) {
    try {
      const trades = await fetchKalshiTrades(ticker, perMarket);
      allTrades.push(...trades);
    } catch {
      // Skip failed fetches
    }
  }

  // Sort by time descending and limit
  allTrades.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime());
  return allTrades.slice(0, limit);
}

/**
 * Get the current odds from a market (0-100 scale)
 * Kalshi API returns prices in dollars (e.g., "0.13" = 13 cents = 13%)
 */
function getMarketOdds(market: KalshiMarket): number {
  // Prefer last price, then midpoint of bid/ask
  if (market.last_price_dollars) {
    const price = parseFloat(market.last_price_dollars);
    if (!isNaN(price) && price > 0) {
      return Math.round(price * 100);
    }
  }

  if (market.yes_bid_dollars && market.yes_ask_dollars) {
    const bid = parseFloat(market.yes_bid_dollars);
    const ask = parseFloat(market.yes_ask_dollars);
    if (!isNaN(bid) && !isNaN(ask)) {
      const midpoint = (bid + ask) / 2;
      return Math.round(midpoint * 100);
    }
  }

  if (market.yes_ask_dollars) {
    const ask = parseFloat(market.yes_ask_dollars);
    if (!isNaN(ask)) {
      return Math.round(ask * 100);
    }
  }

  return 1; // Minimum fallback (1%)
}
