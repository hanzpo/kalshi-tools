import React from 'react';
import { MarketLiveData } from '../types';

/**
 * Every overlay element type must implement this interface.
 * To add a new element type (e.g. "super-bowl"), create a file that
 * calls `registerElement(...)` with a definition conforming to this shape.
 */
export interface ElementDefinition<P extends { type: string } = any> {
  /** Unique type key — stored in the serialized config */
  type: string;
  /** Human-readable label shown in the editor */
  label: string;
  /** Short label for the layer list */
  layerLabel: (props: P) => string;
  /** SVG icon as a React node (16x16 viewBox) */
  icon: React.ReactNode;
  /** Default element dimensions and props */
  defaults: {
    width: number;
    height: number;
    zIndex: number;
    props: P;
  };
  /** The component that renders the element on the canvas */
  Renderer: React.ComponentType<{
    props: P;
    width: number;
    height: number;
    liveData?: MarketLiveData;
  }>;
  /** The component that renders property controls in the editor sidebar */
  PropsEditor: React.ComponentType<{
    props: P;
    onChange: (props: P) => void;
  }>;
  /**
   * If true, this element type uses live market data.
   * The system will look for `ticker` and `pollInterval` on props.
   */
  usesMarketData?: boolean;
  /**
   * If true, also fetch live trades for the market.
   * The trades will be available on liveData.trades.
   */
  usesTradeData?: boolean;
}

// ---- Registry ----

const registry = new Map<string, ElementDefinition>();

export function registerElement<P extends { type: string }>(def: ElementDefinition<P>) {
  registry.set(def.type, def as ElementDefinition);
}

export function getElementDef(type: string): ElementDefinition | undefined {
  return registry.get(type);
}

export function getAllElementDefs(): ElementDefinition[] {
  return Array.from(registry.values());
}
