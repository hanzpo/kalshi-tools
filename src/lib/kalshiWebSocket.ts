/**
 * Kalshi WebSocket client.
 * Connects to /ws/kalshi — the server-side proxy handles authentication
 * using env vars (KALSHI_API_KEY_ID, KALSHI_PRIVATE_KEY).
 *
 * Channels:
 *  - "trade": real-time trade notifications
 *  - "ticker": real-time price/volume updates
 *
 * IMPORTANT: Kalshi requires ONE subscribe command per channel with ALL
 * market tickers in a single `market_tickers` array. Sending individual
 * subscribe commands replaces the previous subscription for that channel.
 */

// ---- Message types from Kalshi WebSocket ----

export interface WsTrade {
  trade_id: string;
  market_ticker: string;
  yes_price_dollars: string;
  no_price_dollars: string;
  count_fp: string;
  taker_side: 'yes' | 'no';
  ts: number;
}

export interface WsTicker {
  market_ticker: string;
  market_id: string;
  price_dollars: string;
  yes_bid_dollars: string;
  yes_ask_dollars: string;
  volume_fp: string;
  open_interest_fp: string;
  dollar_volume: number;
  dollar_open_interest: number;
  ts: number;
  time: string;
}

type TradeHandler = (trade: WsTrade) => void;
type TickerHandler = (ticker: WsTicker) => void;
type StatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

// ---- WebSocket Manager ----

class KalshiWebSocketManager {
  private ws: WebSocket | null = null;
  private nextId = 1;

  private tradeHandlers = new Map<string, Set<TradeHandler>>();
  private tickerHandlers = new Map<string, Set<TickerHandler>>();
  private statusHandlers = new Set<StatusHandler>();

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 3000;
  private intentionalClose = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  private _status: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';

  get status() { return this._status; }

  private setStatus(s: typeof this._status) {
    this._status = s;
    this.statusHandlers.forEach(h => h(s));
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => { this.statusHandlers.delete(handler); };
  }

  connect(): void {
    this.intentionalClose = false;
    this.openConnection();
  }

  private openConnection(): void {
    this.setStatus('connecting');

    try {
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${location.host}/ws/kalshi`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[KalshiWS] Connected to', wsUrl);
        this.setStatus('connected');
        this.reconnectDelay = 3000;
        this.sendAllSubscriptions();
      };

      this.ws.onmessage = (e) => {
        try {
          this.handleMessage(JSON.parse(e.data));
        } catch { /* ignore parse errors */ }
      };

      this.ws.onclose = (e) => {
        console.log('[KalshiWS] Closed:', e.code, e.reason);
        this.ws = null;
        if (!this.intentionalClose) {
          // 4001 = no env vars configured, don't retry
          if (e.code === 4001) {
            this.setStatus('error');
            return;
          }
          this.setStatus('disconnected');
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.setStatus('error');
        this.ws?.close();
      };
    } catch {
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.intentionalClose) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.openConnection();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.ws?.close();
    this.ws = null;
    this.setStatus('disconnected');
  }

  // ---- Subscriptions ----

  /**
   * Register a handler for trade messages on a market ticker.
   * Does NOT immediately send a subscribe — call flush() after
   * registering all handlers, or it auto-flushes after a microtask.
   */
  subscribeTrades(ticker: string, handler: TradeHandler): () => void {
    if (!this.tradeHandlers.has(ticker)) {
      this.tradeHandlers.set(ticker, new Set());
    }
    this.tradeHandlers.get(ticker)!.add(handler);
    this.scheduleFlush();

    return () => {
      this.tradeHandlers.get(ticker)?.delete(handler);
      if (this.tradeHandlers.get(ticker)?.size === 0) {
        this.tradeHandlers.delete(ticker);
      }
    };
  }

  /**
   * Register a handler for ticker messages on a market ticker.
   * Does NOT immediately send a subscribe — call flush() after
   * registering all handlers, or it auto-flushes after a microtask.
   */
  subscribeTicker(ticker: string, handler: TickerHandler): () => void {
    if (!this.tickerHandlers.has(ticker)) {
      this.tickerHandlers.set(ticker, new Set());
    }
    this.tickerHandlers.get(ticker)!.add(handler);
    this.scheduleFlush();

    return () => {
      this.tickerHandlers.get(ticker)?.delete(handler);
      if (this.tickerHandlers.get(ticker)?.size === 0) {
        this.tickerHandlers.delete(ticker);
      }
    };
  }

  /**
   * Schedule a flush to send subscriptions after all handlers are registered.
   * Uses a microtask so that multiple subscribe calls in the same tick
   * result in a single batched subscribe command.
   */
  private scheduleFlush() {
    if (this.flushTimer) return; // Already scheduled
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.sendAllSubscriptions();
    }, 0);
  }

  /**
   * Send ONE subscribe command per channel with ALL registered market tickers.
   * Kalshi replaces subscriptions per channel, so we must always send the
   * complete set of tickers in each subscribe command.
   */
  private sendAllSubscriptions() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const tradeTickers = Array.from(this.tradeHandlers.keys());
    const tickerTickers = Array.from(this.tickerHandlers.keys());

    // Combine into one subscribe if tickers overlap (most common case)
    const allTickers = Array.from(new Set([...tradeTickers, ...tickerTickers]));
    const channels: string[] = [];
    if (tradeTickers.length > 0) channels.push('trade');
    if (tickerTickers.length > 0) channels.push('ticker');

    if (channels.length === 0 || allTickers.length === 0) return;

    const id = this.nextId++;
    console.log(`[KalshiWS] → subscribe ${channels.join(',')} for ${allTickers.length} tickers, id: ${id}`);
    this.ws.send(JSON.stringify({
      id,
      cmd: 'subscribe',
      params: {
        channels,
        market_tickers: allTickers,
        send_initial_snapshot: true,
      },
    }));
  }

  // ---- Message handling ----

  private handleMessage(data: any) {
    if (data.type === 'error') {
      console.warn('[KalshiWS] Error:', data.msg);
      return;
    }

    if (data.type === 'trade' && data.msg) {
      const trade = data.msg as WsTrade;
      this.tradeHandlers.get(trade.market_ticker)?.forEach(h => h(trade));
      // Parent ticker match (event ticker is prefix of market ticker)
      for (const [key, handlers] of this.tradeHandlers) {
        if (key !== trade.market_ticker && trade.market_ticker.toUpperCase().startsWith(key.toUpperCase())) {
          handlers.forEach(h => h(trade));
        }
      }
      return;
    }

    if (data.type === 'ticker' && data.msg) {
      const ticker = data.msg as WsTicker;
      this.tickerHandlers.get(ticker.market_ticker)?.forEach(h => h(ticker));
      for (const [key, handlers] of this.tickerHandlers) {
        if (key !== ticker.market_ticker && ticker.market_ticker.toUpperCase().startsWith(key.toUpperCase())) {
          handlers.forEach(h => h(ticker));
        }
      }
      return;
    }
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

/** Singleton WebSocket manager */
export const kalshiWs = new KalshiWebSocketManager();
