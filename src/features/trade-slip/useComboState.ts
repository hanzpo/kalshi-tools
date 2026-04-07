import { ChangeEvent, useState, DragEvent } from 'react';
import { TradeSlipConfig, ComboCategory, ComboEvent, ComboMarket, ComboLeg } from '../../types';
import { trackEvent } from '../../lib/analytics';

export function createComboMarket(): ComboMarket {
  return {
    id: `market-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: '',
    prefix: undefined,
  };
}

export function createComboEvent(): ComboEvent {
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    markets: [createComboMarket()],
  };
}

export function createComboCategory(): ComboCategory {
  return {
    id: `category-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    events: [createComboEvent()],
  };
}

export function createLeg(): ComboLeg {
  return {
    id: `leg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: '',
    answer: 'Yes',
    image: null,
  };
}

export function computeComboPayout(config: TradeSlipConfig): number {
  const allMarkets = config.comboCategories?.flatMap(c => c.events.flatMap(e => e.markets)) ?? [];
  const marketsWithOdds = allMarkets.filter(m => m.odds && m.odds > 0 && m.odds < 100);
  if (marketsWithOdds.length === 0) return config.comboPayout;
  const combinedProb = marketsWithOdds.reduce((acc, m) => acc * (m.odds! / 100), 1);
  if (combinedProb <= 0) return config.comboPayout;
  const fairPayout = config.comboCost / combinedProb;
  return Math.round(fairPayout * (1 - config.comboSpread / 100) * 100) / 100;
}

interface UseComboStateOptions {
  config: TradeSlipConfig;
  onConfigChange: (config: Partial<TradeSlipConfig>) => void;
}

export function useComboState({ config, onConfigChange }: UseComboStateOptions) {
  const [draggingLegId, setDraggingLegId] = useState<string | null>(null);

  // Old combo leg handlers
  function handleLegChange(legId: string, updates: Partial<ComboLeg>) {
    const updatedLegs = config.comboLegs.map((leg) =>
      leg.id === legId ? { ...leg, ...updates } : leg
    );
    onConfigChange({ comboLegs: updatedLegs });
  }

  function handleLegImageInput(legId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        handleLegChange(legId, { image: result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddLeg() {
    onConfigChange({ comboLegs: [...config.comboLegs, createLeg()] });
  }

  function handleRemoveLeg(legId: string) {
    if (config.comboLegs.length <= 1) return;
    onConfigChange({
      comboLegs: config.comboLegs.filter((leg) => leg.id !== legId),
    });
  }

  function handleLegDragOver(legId: string, e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDraggingLegId(legId);
  }

  function handleLegDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDraggingLegId(null);
  }

  function handleLegDrop(legId: string, e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDraggingLegId(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result;
          if (typeof result === 'string') {
            handleLegChange(legId, { image: result });
            trackEvent('image_upload', {
              tool: 'trade-slip',
              mode: config.mode,
              method: 'drop',
              target: 'combo-leg',
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Combo category handlers
  function handleCategoryChange(categoryId: string, updates: Partial<ComboCategory>) {
    const updatedCategories = config.comboCategories.map((cat) =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleAddCategory() {
    onConfigChange({ comboCategories: [...config.comboCategories, createComboCategory()] });
  }

  function handleRemoveCategory(categoryId: string) {
    if (config.comboCategories.length <= 1) return;
    onConfigChange({
      comboCategories: config.comboCategories.filter((cat) => cat.id !== categoryId),
    });
  }

  // Combo event handlers
  function handleEventChange(categoryId: string, eventId: string, updates: Partial<ComboEvent>) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: cat.events.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event
        ),
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleAddEvent(categoryId: string) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: [...cat.events, createComboEvent()],
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleRemoveEvent(categoryId: string, eventId: string) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      if (cat.events.length <= 1) return cat;
      return {
        ...cat,
        events: cat.events.filter((event) => event.id !== eventId),
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  // Combo market handlers
  function handleMarketChange(categoryId: string, eventId: string, marketId: string, updates: Partial<ComboMarket>) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: cat.events.map((event) => {
          if (event.id !== eventId) return event;
          return {
            ...event,
            markets: event.markets.map((market) =>
              market.id === marketId ? { ...market, ...updates } : market
            ),
          };
        }),
      };
    });
    const changes: Partial<TradeSlipConfig> = { comboCategories: updatedCategories };
    if (config.comboAutoCompute && 'odds' in updates) {
      changes.comboPayout = computeComboPayout({ ...config, comboCategories: updatedCategories });
    }
    onConfigChange(changes);
  }

  function handleAddMarket(categoryId: string, eventId: string) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: cat.events.map((event) => {
          if (event.id !== eventId) return event;
          return {
            ...event,
            markets: [...event.markets, createComboMarket()],
          };
        }),
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  function handleRemoveMarket(categoryId: string, eventId: string, marketId: string) {
    const updatedCategories = config.comboCategories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        events: cat.events.map((event) => {
          if (event.id !== eventId) return event;
          if (event.markets.length <= 1) return event;
          return {
            ...event,
            markets: event.markets.filter((market) => market.id !== marketId),
          };
        }),
      };
    });
    onConfigChange({ comboCategories: updatedCategories });
  }

  return {
    draggingLegId,
    // Leg handlers
    handleLegChange,
    handleLegImageInput,
    handleAddLeg,
    handleRemoveLeg,
    handleLegDragOver,
    handleLegDragLeave,
    handleLegDrop,
    // Category handlers
    handleCategoryChange,
    handleAddCategory,
    handleRemoveCategory,
    // Event handlers
    handleEventChange,
    handleAddEvent,
    handleRemoveEvent,
    // Market handlers
    handleMarketChange,
    handleAddMarket,
    handleRemoveMarket,
  };
}
