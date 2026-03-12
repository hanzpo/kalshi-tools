import { defineConfig, type Plugin, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { WebSocket as NodeWebSocket, WebSocketServer } from 'ws'
import type { IncomingMessage } from 'http'
import type { Duplex } from 'stream'
import * as crypto from 'crypto'

const KALSHI_WS_URL = 'wss://api.elections.kalshi.com/trade-api/ws/v2'
const WS_PATH = '/trade-api/ws/v2'

/**
 * Compute RSA-PSS signature for Kalshi WebSocket auth.
 * Uses the private key from environment variables.
 */
function signWsAuth(privateKeyPem: string, keyId: string): { key: string; sig: string; ts: string } {
  const ts = String(Date.now())
  const message = ts + 'GET' + WS_PATH
  const signature = crypto.sign('sha256', Buffer.from(message), {
    key: privateKeyPem,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32,
  })
  return { key: keyId, sig: signature.toString('base64'), ts }
}

/**
 * Vite plugin that proxies WebSocket connections to Kalshi.
 * Auth credentials come from env vars KALSHI_API_KEY_ID and KALSHI_PRIVATE_KEY.
 * Client just connects to /ws/kalshi — no credentials needed client-side.
 */
function kalshiWsProxy(env: Record<string, string>): Plugin {
  return {
    name: 'kalshi-ws-proxy',
    configureServer(server) {
      const wss = new WebSocketServer({ noServer: true })

      server.httpServer?.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        if (!req.url?.startsWith('/ws/kalshi')) return

        wss.handleUpgrade(req, socket, head, (clientWs) => {
          const keyId = env.KALSHI_API_KEY_ID
          const privateKey = env.KALSHI_PRIVATE_KEY?.replace(/\\n/g, '\n')

          if (!keyId || !privateKey) {
            clientWs.close(4001, 'KALSHI_API_KEY_ID and KALSHI_PRIVATE_KEY env vars required')
            return
          }

          let auth: { key: string; sig: string; ts: string }
          try {
            auth = signWsAuth(privateKey, keyId)
            console.log('[KalshiWS] Auth signed, connecting upstream...')
          } catch (err: any) {
            console.error('[KalshiWS] Sign failed:', err.message)
            clientWs.close(4002, 'Failed to sign: ' + err.message)
            return
          }

          // Open authenticated connection to Kalshi
          const upstream = new NodeWebSocket(KALSHI_WS_URL, {
            headers: {
              'KALSHI-ACCESS-KEY': auth.key,
              'KALSHI-ACCESS-SIGNATURE': auth.sig,
              'KALSHI-ACCESS-TIMESTAMP': auth.ts,
            },
          })

          // Buffer client messages until upstream is ready
          const pendingMessages: { data: any; isBinary: boolean }[] = []
          clientWs.on('message', (data, isBinary) => {
            if (upstream.readyState === NodeWebSocket.OPEN) {
              upstream.send(data, { binary: isBinary })
            } else {
              pendingMessages.push({ data, isBinary })
            }
          })

          upstream.on('open', () => {
            console.log('[KalshiWS] Upstream connected')
            // Flush buffered messages
            for (const msg of pendingMessages) {
              upstream.send(msg.data, { binary: msg.isBinary })
            }
            pendingMessages.length = 0
          })

          upstream.on('message', (data, isBinary) => {
            if (clientWs.readyState === 1 /* OPEN */) {
              // Preserve frame type: Kalshi sends text (JSON) frames.
              // Without { binary: false }, ws sends Buffers as binary frames,
              // which the browser receives as Blobs instead of strings.
              clientWs.send(data, { binary: isBinary })
            }
          })

          upstream.on('close', (code, reason) => {
            console.log(`[KalshiWS] Upstream closed: ${code} ${reason.toString()}`)
            clientWs.close(code, reason.toString())
          })
          upstream.on('error', (err) => {
            console.error('[KalshiWS] Upstream error:', err.message)
            clientWs.close(4003, 'Upstream connection error')
          })
          clientWs.on('close', () => { upstream.close() })
          clientWs.on('error', () => { upstream.close() })
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_ prefixed) for server-side use
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), kalshiWsProxy(env)],
    server: {
      proxy: {
        '/api/kalshi': {
          target: 'https://api.elections.kalshi.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/kalshi/, '/trade-api/v2'),
        },
      },
    },
  }
})
