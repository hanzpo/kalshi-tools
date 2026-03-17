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

const STORAGE_KEY = 'kalshi_overlay_config';

export function saveOverlayState(config: OverlayConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadOverlayState(): OverlayConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OverlayConfig;
  } catch {
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
 * Proportionally rescale all elements from one canvas size to another.
 * Adjusts x, y, width, and height of every element.
 */
export function scaleElements(
  elements: OverlayElement[],
  fromW: number,
  fromH: number,
  toW: number,
  toH: number,
): OverlayElement[] {
  if (fromW === toW && fromH === toH) return elements;
  const sx = toW / fromW;
  const sy = toH / fromH;
  return elements.map(el => ({
    ...el,
    x: Math.round(el.x * sx),
    y: Math.round(el.y * sy),
    width: Math.round(el.width * sx),
    height: Math.round(el.height * sy),
  }));
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
