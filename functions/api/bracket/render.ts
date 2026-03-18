import { encodeKalshiBracketPayload } from '../../../src/features/bracket/kalshiBracket';

interface Env {
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_BROWSER_RENDERING_TOKEN: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

export const onRequestOptions: PagesFunction<Env> = async () => (
  new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_BROWSER_RENDERING_TOKEN) {
    return jsonResponse(
      { error: 'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_BROWSER_RENDERING_TOKEN' },
      500,
    );
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON' }, 400);
  }

  let encodedBracket: string;

  try {
    encodedBracket = encodeKalshiBracketPayload(requestBody);
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Failed to encode bracket payload' },
      400,
    );
  }

  const renderUrl = new URL('/bracket/render', request.url);
  renderUrl.searchParams.set('b', encodedBracket);

  const screenshotResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/screenshot`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_BROWSER_RENDERING_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: renderUrl.toString(),
        gotoOptions: {
          waitUntil: 'networkidle0',
        },
        selector: '#bracket-preview',
        waitForSelector: {
          selector: '#bracket-preview',
          timeout: 10000,
        },
        viewport: {
          width: 760,
          height: 1500,
          deviceScaleFactor: 2,
        },
        screenshotOptions: {
          type: 'png',
        },
      }),
    },
  );

  if (!screenshotResponse.ok) {
    const errorText = await screenshotResponse.text();
    return new Response(errorText, {
      status: screenshotResponse.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': screenshotResponse.headers.get('Content-Type') ?? 'application/json',
      },
    });
  }

  return new Response(await screenshotResponse.arrayBuffer(), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': 'no-store',
      'Content-Type': 'image/png',
    },
  });
};
