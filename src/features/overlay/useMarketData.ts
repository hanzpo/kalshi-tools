import { useEffect, useRef, useState, useCallback } from 'react';
import { MarketLiveData, LiveTrade } from './types';
import { parseKalshiUrl, fetchKalshiMarket, fetchKalshiEvent, fetchKalshiTrades, KalshiTrade, KalshiMarket } from '../../lib/kalshiApi';
import { kalshiWs, WsTrade, WsTicker } from '../../lib/kalshiWebSocket';

/** Fallback poll interval for trades when WebSocket is unavailable (seconds) */
const TRADE_POLL_INTERVAL = 10;

/** Delay between staggered initial requests to avoid rate limits (ms) */
const STAGGER_DELAY = 300;

export interface TickerRequest {
  ticker: string;
  pollInterval: number;
  /** If true, also fetch recent trades for this ticker */
  fetchTrades?: boolean;
}

/**
 * Merge new trades into existing list, deduplicating by trade ID.
 * Returns trades sorted newest-first, capped at `max`.
 */
function mergeTrades(existing: LiveTrade[] | undefined, incoming: LiveTrade[], max: number): LiveTrade[] {
  const seen = new Set<string>();
  const merged: LiveTrade[] = [];
  for (const t of [...incoming, ...(existing || [])]) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      merged.push(t);
    }
  }
  merged.sort((a, b) => b.timestamp - a.timestamp);
  return merged.slice(0, max);
}

function convertRawTrades(rawTrades: KalshiTrade[]): LiveTrade[] {
  return rawTrades.map(t => {
    const contracts = parseFloat(t.count_fp) || 1;
    const priceCents = Math.round(parseFloat(t.yes_price_dollars) * 100) || 1;
    const costDollars = Math.round(contracts * parseFloat(t.yes_price_dollars) * 100) / 100;
    return {
      id: t.trade_id,
      ticker: t.ticker,
      side: t.taker_side,
      contracts,
      priceCents,
      costDollars,
      timestamp: new Date(t.created_time).getTime(),
    };
  });
}

/** Convert a WebSocket trade message to a LiveTrade */
function wsTradeToLiveTrade(wt: WsTrade): LiveTrade {
  const contracts = parseFloat(wt.count_fp) || 1;
  const priceCents = Math.round(parseFloat(wt.yes_price_dollars) * 100) || 1;
  const costDollars = Math.round(contracts * parseFloat(wt.yes_price_dollars) * 100) / 100;
  return {
    id: wt.trade_id,
    ticker: wt.market_ticker,
    side: wt.taker_side,
    contracts,
    priceCents,
    costDollars,
    timestamp: wt.ts * 1000, // seconds -> ms
  };
}

/**
 * Fetch trades for an event's markets using already-fetched market list.
 * Avoids re-fetching the event data.
 */
async function fetchEventTradesFromMarkets(markets: KalshiMarket[], limit: number): Promise<KalshiTrade[]> {
  const tickers = markets
    .filter(m => m.status !== 'finalized')
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 5)
    .map(m => m.ticker);

  if (tickers.length === 0) return [];

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

  allTrades.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime());
  return allTrades.slice(0, limit);
}

/**
 * Hook to fetch and poll live market data for overlay elements.
 *
 * When Kalshi WebSocket is connected:
 *   - Trades arrive in real-time via WebSocket
 *   - Ticker updates (price/volume) arrive via WebSocket
 *   - REST is used ONLY ONCE for initial market info (title, type, outcomes, initial trades)
 *   - No periodic REST polling
 *
 * Fallback (no WebSocket):
 *   - Market info polls at configured interval
 *   - Trades poll at TRADE_POLL_INTERVAL
 */
export function useMarketData(
  tickers: TickerRequest[],
  enabled: boolean = true
) {
  const [data, setData] = useState<Record<string, MarketLiveData>>({});
  const [wsConnected, setWsConnected] = useState(kalshiWs.isConnected);
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const wsUnsubsRef = useRef<Array<() => void>>([]);

  // Cache: ticker -> { isEvent, markets } from the initial fetch
  const eventCacheRef = useRef<Record<string, { isEvent: boolean; markets: KalshiMarket[] }>>({});

  // Track WS connection status so the effect re-runs when WS connects/disconnects
  useEffect(() => {
    return kalshiWs.onStatus((status) => {
      setWsConnected(status === 'connected');
    });
  }, []);

  /**
   * Fetch market info AND initial trades in one pass.
   * Only makes 1 fetchKalshiEvent call (or 1 fetchKalshiMarket fallback).
   * Caches whether the ticker is an event for later trade polling.
   */
  const fetchInitialData = useCallback(async (ticker: string, includeTrades: boolean) => {
    if (!ticker) return;
    try {
      let marketData: Omit<MarketLiveData, 'trades'> | null = null;
      let initialTrades: LiveTrade[] | undefined;
      let isEvent = false;
      let markets: KalshiMarket[] = [];

      try {
        const eventResp = await fetchKalshiEvent(ticker);
        const { event, markets: eventMarkets } = eventResp;
        isEvent = true;
        markets = eventMarkets;

        if (eventMarkets.length === 1) {
          const m = eventMarkets[0];
          const odds = getOdds(m.last_price_dollars, m.yes_bid_dollars, m.yes_ask_dollars);
          marketData = {
            title: event.title || m.title,
            odds,
            volume: m.volume || 0,
            status: 'active',
            marketType: m.market_type === 'scalar' ? 'forecast' : 'binary',
            lastUpdated: Date.now(),
          };
        } else {
          const activeMarkets = eventMarkets
            .filter(m => m.status !== 'finalized' || getOdds(m.last_price_dollars, m.yes_bid_dollars, m.yes_ask_dollars) > 0)
            .sort((a, b) => getOdds(b.last_price_dollars, b.yes_bid_dollars, b.yes_ask_dollars) - getOdds(a.last_price_dollars, a.yes_bid_dollars, a.yes_ask_dollars))
            .slice(0, 8);

          const totalVolume = eventMarkets.reduce((sum, m) => sum + (m.volume || 0), 0);
          const tickerToName: Record<string, string> = {};
          eventMarkets.forEach(m => {
            if (m.yes_sub_title || m.title) {
              tickerToName[m.ticker] = m.yes_sub_title || m.title;
            }
          });
          marketData = {
            title: event.title,
            odds: 0,
            volume: totalVolume,
            status: 'active',
            marketType: 'multi',
            tickerToName,
            outcomes: activeMarkets.map(m => ({
              name: m.yes_sub_title || m.title,
              odds: getOdds(m.last_price_dollars, m.yes_bid_dollars, m.yes_ask_dollars),
            })),
            lastUpdated: Date.now(),
          };
        }

        // Fetch initial trades using the already-fetched market list
        if (includeTrades && eventMarkets.length > 0) {
          try {
            const rawTrades = eventMarkets.length === 1
              ? await fetchKalshiTrades(eventMarkets[0].ticker, 20)
              : await fetchEventTradesFromMarkets(eventMarkets, 20);
            initialTrades = convertRawTrades(rawTrades);
          } catch {
            // Trades are optional
          }
        }
      } catch {
        const m = await fetchKalshiMarket(ticker);
        const odds = getOdds(m.last_price_dollars, m.yes_bid_dollars, m.yes_ask_dollars);
        marketData = {
          title: m.title || ticker,
          odds,
          volume: m.volume || 0,
          status: 'active',
          marketType: m.market_type === 'scalar' ? 'forecast' : 'binary',
          lastUpdated: Date.now(),
        };

        if (includeTrades) {
          try {
            const rawTrades = await fetchKalshiTrades(ticker, 20);
            initialTrades = convertRawTrades(rawTrades);
          } catch {
            // Trades are optional
          }
        }
      }

      // Cache event info for later trade polling
      eventCacheRef.current[ticker] = { isEvent, markets };

      if (marketData) {
        setData(prev => ({
          ...prev,
          [ticker]: {
            ...marketData!,
            trades: initialTrades ? mergeTrades(prev[ticker]?.trades, initialTrades, 30) : prev[ticker]?.trades,
          },
        }));
      }
    } catch {
      setData(prev => ({
        ...prev,
        [ticker]: {
          title: ticker,
          odds: 0,
          volume: 0,
          status: 'error',
          marketType: 'binary',
          lastUpdated: Date.now(),
          trades: prev[ticker]?.trades,
        },
      }));
    }
  }, []);

  /**
   * Fetch only market info (no trades) — used for polling mode refresh.
   * Uses cached event info to avoid re-detecting.
   */
  const fetchMarketInfoOnly = useCallback(async (ticker: string) => {
    if (!ticker) return;
    try {
      let marketData: Omit<MarketLiveData, 'trades'> | null = null;
      const cached = eventCacheRef.current[ticker];

      if (cached?.isEvent) {
        try {
          const eventResp = await fetchKalshiEvent(ticker);
          const { event, markets } = eventResp;
          eventCacheRef.current[ticker] = { isEvent: true, markets };

          if (markets.length === 1) {
            const m = markets[0];
            marketData = {
              title: event.title || m.title,
              odds: getOdds(m.last_price_dollars, m.yes_bid_dollars, m.yes_ask_dollars),
              volume: m.volume || 0,
              status: 'active',
              marketType: m.market_type === 'scalar' ? 'forecast' : 'binary',
              lastUpdated: Date.now(),
            };
          } else {
            const activeMarkets = markets
              .filter(m => m.status !== 'finalized' || getOdds(m.last_price_dollars, m.yes_bid_dollars, m.yes_ask_dollars) > 0)
              .sort((a, b) => getOdds(b.last_price_dollars, b.yes_bid_dollars, b.yes_ask_dollars) - getOdds(a.last_price_dollars, a.yes_bid_dollars, a.yes_ask_dollars))
              .slice(0, 8);

            const totalVolume = markets.reduce((sum, m) => sum + (m.volume || 0), 0);
            const tickerToName: Record<string, string> = {};
            markets.forEach(m => {
              if (m.yes_sub_title || m.title) {
                tickerToName[m.ticker] = m.yes_sub_title || m.title;
              }
            });
            marketData = {
              title: event.title,
              odds: 0,
              volume: totalVolume,
              status: 'active',
              marketType: 'multi',
              tickerToName,
              outcomes: activeMarkets.map(m => ({
                name: m.yes_sub_title || m.title,
                odds: getOdds(m.last_price_dollars, m.yes_bid_dollars, m.yes_ask_dollars),
              })),
              lastUpdated: Date.now(),
            };
          }
        } catch {
          // Event fetch failed, try as market
          const m = await fetchKalshiMarket(ticker);
          marketData = {
            title: m.title || ticker,
            odds: getOdds(m.last_price_dollars, m.yes_bid_dollars, m.yes_ask_dollars),
            volume: m.volume || 0,
            status: 'active',
            marketType: m.market_type === 'scalar' ? 'forecast' : 'binary',
            lastUpdated: Date.now(),
          };
        }
      } else {
        const m = await fetchKalshiMarket(ticker);
        marketData = {
          title: m.title || ticker,
          odds: getOdds(m.last_price_dollars, m.yes_bid_dollars, m.yes_ask_dollars),
          volume: m.volume || 0,
          status: 'active',
          marketType: m.market_type === 'scalar' ? 'forecast' : 'binary',
          lastUpdated: Date.now(),
        };
      }

      if (marketData) {
        setData(prev => ({
          ...prev,
          [ticker]: { ...marketData!, trades: prev[ticker]?.trades },
        }));
      }
    } catch {
      // Silently fail on refresh
    }
  }, []);

  /** Fetch trades only — uses cached market list for events */
  const fetchTradesOnly = useCallback(async (ticker: string) => {
    if (!ticker) return;
    try {
      const cached = eventCacheRef.current[ticker];
      let rawTrades: KalshiTrade[];

      if (cached?.isEvent && cached.markets.length > 1) {
        rawTrades = await fetchEventTradesFromMarkets(cached.markets, 20);
      } else {
        const marketTicker = cached?.markets?.[0]?.ticker || ticker;
        rawTrades = await fetchKalshiTrades(marketTicker, 20);
      }

      const incoming = convertRawTrades(rawTrades);
      setData(prev => {
        const existing = prev[ticker];
        if (!existing) return prev;
        return {
          ...prev,
          [ticker]: {
            ...existing,
            trades: mergeTrades(existing.trades, incoming, 30),
          },
        };
      });
    } catch {
      // Trades are optional
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Clean up previous
    Object.values(intervalsRef.current).forEach(clearInterval);
    intervalsRef.current = {};
    wsUnsubsRef.current.forEach(unsub => unsub());
    wsUnsubsRef.current = [];

    const staggerTimers: ReturnType<typeof setTimeout>[] = [];

    tickers.forEach(({ ticker, pollInterval, fetchTrades }, index) => {
      if (!ticker) return;

      const delay = index * STAGGER_DELAY;

      if (wsConnected) {
        // ---- WebSocket mode ----
        // 1. Fetch initial data via REST (discovers actual market tickers)
        // 2. Subscribe to each individual market ticker via WS
        //    (Kalshi WS requires individual market tickers, not event tickers)

        staggerTimers.push(setTimeout(async () => {
          await fetchInitialData(ticker, !!fetchTrades);

          // After initial fetch, we know the actual market tickers
          const cached = eventCacheRef.current[ticker];
          const marketTickers = cached?.isEvent && cached.markets.length > 0
            ? cached.markets.filter(m => m.status !== 'finalized').map(m => m.ticker)
            : [ticker]; // Single market or not an event — subscribe to ticker directly

          // Subscribe to each market ticker's channels, aggregate into event ticker's data
          for (const mt of marketTickers) {
            const unsubTicker = kalshiWs.subscribeTicker(mt, (msg: WsTicker) => {
              setData(prev => {
                const existing = prev[ticker];
                if (!existing) return prev;
                const odds = getOdds(msg.price_dollars, msg.yes_bid_dollars, msg.yes_ask_dollars);
                // For multi-outcome events, update the matching outcome's odds
                let updatedOutcomes = existing.outcomes;
                if (existing.outcomes && existing.tickerToName?.[msg.market_ticker]) {
                  const name = existing.tickerToName[msg.market_ticker];
                  updatedOutcomes = existing.outcomes.map(o =>
                    o.name === name ? { ...o, odds: odds || o.odds } : o
                  );
                }
                return {
                  ...prev,
                  [ticker]: {
                    ...existing,
                    // For binary/single markets, update top-level odds
                    odds: marketTickers.length === 1 ? (odds || existing.odds) : existing.odds,
                    volume: parseInt(msg.volume_fp) || existing.volume,
                    outcomes: updatedOutcomes,
                    lastUpdated: Date.now(),
                  },
                };
              });
            });
            wsUnsubsRef.current.push(unsubTicker);

            if (fetchTrades) {
              const unsubTrade = kalshiWs.subscribeTrades(mt, (wt: WsTrade) => {
                const trade = wsTradeToLiveTrade(wt);
                setData(prev => {
                  const existing = prev[ticker];
                  if (!existing) return prev;
                  return {
                    ...prev,
                    [ticker]: {
                      ...existing,
                      trades: mergeTrades(existing.trades, [trade], 30),
                    },
                  };
                });
              });
              wsUnsubsRef.current.push(unsubTrade);
            }
          }
        }, delay));

        // NO periodic REST polling in WS mode — WS handles price/volume/trades

      } else {
        // ---- Polling fallback mode ----

        // Initial fetch with trades
        staggerTimers.push(setTimeout(() => fetchInitialData(ticker, !!fetchTrades), delay));

        // Periodic market info refresh
        const marketInterval = setInterval(() => fetchMarketInfoOnly(ticker), pollInterval * 1000);
        intervalsRef.current[`market:${ticker}`] = marketInterval;

        // Periodic trade refresh
        if (fetchTrades) {
          const tradeInterval = setInterval(() => fetchTradesOnly(ticker), TRADE_POLL_INTERVAL * 1000);
          intervalsRef.current[`trades:${ticker}`] = tradeInterval;
        }
      }
    });

    return () => {
      staggerTimers.forEach(clearTimeout);
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
      wsUnsubsRef.current.forEach(unsub => unsub());
      wsUnsubsRef.current = [];
    };
  }, [tickers.map(t => `${t.ticker}:${t.pollInterval}:${t.fetchTrades}`).join(','), enabled, wsConnected, fetchInitialData, fetchMarketInfoOnly, fetchTradesOnly]);

  return data;
}

/**
 * Parse a Kalshi URL and return the ticker.
 */
export function extractTicker(url: string): string | null {
  return parseKalshiUrl(url);
}

function getOdds(lastPrice?: string, yesBid?: string, yesAsk?: string): number {
  if (lastPrice) {
    const p = parseFloat(lastPrice);
    if (!isNaN(p) && p > 0) return Math.round(p * 100);
  }
  if (yesBid && yesAsk) {
    const bid = parseFloat(yesBid);
    const ask = parseFloat(yesAsk);
    if (!isNaN(bid) && !isNaN(ask)) return Math.round(((bid + ask) / 2) * 100);
  }
  return 1;
}
