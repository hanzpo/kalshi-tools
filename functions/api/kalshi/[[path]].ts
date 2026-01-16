/**
 * Cloudflare Pages Function to proxy Kalshi API requests
 * This bypasses CORS restrictions by making server-side requests
 */

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

export const onRequest: PagesFunction = async (context) => {
  const { request, params } = context;

  // Get the path from the catch-all parameter
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || '';

  // Build the Kalshi API URL
  const kalshiUrl = `${KALSHI_API_BASE}/${path}`;

  // Forward the request to Kalshi API
  const response = await fetch(kalshiUrl, {
    method: request.method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Get the response body
  const data = await response.text();

  // Return with CORS headers
  return new Response(data, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
    },
  });
};
