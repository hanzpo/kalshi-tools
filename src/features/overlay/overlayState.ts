import { OverlayConfig, OverlayElement } from './types';
import { getElementDef } from './elements';

/**
 * Encode overlay config to a URL-safe string.
 */
export function encodeOverlayState(config: OverlayConfig): string {
  try {
    const json = JSON.stringify(config);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    console.error('Failed to encode overlay state:', e);
    return '';
  }
}

/**
 * Decode overlay config from a URL-safe string.
 */
export function decodeOverlayState(encoded: string): OverlayConfig | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const json = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(json) as OverlayConfig;
  } catch (e) {
    console.error('Failed to decode overlay state:', e);
    return null;
  }
}

let nextId = 1;
export function generateId(): string {
  return `el_${Date.now()}_${nextId++}`;
}

export function createDefaultConfig(): OverlayConfig {
  return {
    width: 1920,
    height: 1080,
    background: { type: 'transparent' },
    elements: [],
  };
}

/**
 * Create a new element instance from the registry by type key.
 */
export function createElement(type: string, x = 100, y = 100): OverlayElement | null {
  const def = getElementDef(type);
  if (!def) return null;
  return {
    id: generateId(),
    type: def.type,
    x,
    y,
    width: def.defaults.width,
    height: def.defaults.height,
    zIndex: def.defaults.zIndex,
    props: { ...def.defaults.props },
  };
}
