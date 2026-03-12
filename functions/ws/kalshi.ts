/**
 * Cloudflare Pages Function: WebSocket proxy for Kalshi.
 * Auth credentials come from environment variables (set in Cloudflare dashboard):
 *   KALSHI_API_KEY_ID, KALSHI_PRIVATE_KEY
 *
 * The client connects to /ws/kalshi with no credentials — the proxy handles auth.
 */

const KALSHI_WS_URL = 'https://api.elections.kalshi.com/trade-api/ws/v2';
const WS_PATH = '/trade-api/ws/v2';

interface Env {
  KALSHI_API_KEY_ID: string;
  KALSHI_PRIVATE_KEY: string;
}

/**
 * RSA-PSS signing using Web Crypto (available in Cloudflare Workers runtime).
 */
async function signWsAuth(privateKeyPem: string, keyId: string): Promise<{ key: string; sig: string; ts: string }> {
  const ts = String(Date.now());
  const message = ts + 'GET' + WS_PATH;

  // Import PEM key
  const b64 = privateKeyPem
    .replace(/-----[A-Z ]+-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\s/g, '');
  const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binary.buffer,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sigBuf = await crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    cryptoKey,
    new TextEncoder().encode(message),
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  return { key: keyId, sig, ts };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const upgradeHeader = context.request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  const keyId = context.env.KALSHI_API_KEY_ID;
  const privateKey = context.env.KALSHI_PRIVATE_KEY;

  if (!keyId || !privateKey) {
    return new Response('KALSHI_API_KEY_ID and KALSHI_PRIVATE_KEY env vars not configured', { status: 500 });
  }

  let auth: { key: string; sig: string; ts: string };
  try {
    auth = await signWsAuth(privateKey, keyId);
  } catch {
    return new Response('Failed to compute auth signature', { status: 500 });
  }

  // Connect to Kalshi with auth headers
  const upstreamResp = await fetch(KALSHI_WS_URL, {
    headers: {
      'Upgrade': 'websocket',
      'KALSHI-ACCESS-KEY': auth.key,
      'KALSHI-ACCESS-SIGNATURE': auth.sig,
      'KALSHI-ACCESS-TIMESTAMP': auth.ts,
    },
  });

  const upstream = (upstreamResp as any).webSocket;
  if (!upstream) {
    return new Response('Failed to connect to Kalshi WebSocket', { status: 502 });
  }
  upstream.accept();

  // Create client-facing WebSocket pair
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  server.accept();

  // Relay: client <-> upstream
  server.addEventListener('message', (event: MessageEvent) => {
    try { upstream.send(event.data); } catch { /* closed */ }
  });
  upstream.addEventListener('message', (event: MessageEvent) => {
    try { server.send(event.data); } catch { /* closed */ }
  });
  server.addEventListener('close', () => { try { upstream.close(); } catch {} });
  upstream.addEventListener('close', () => { try { server.close(); } catch {} });

  return new Response(null, { status: 101, webSocket: client });
};
