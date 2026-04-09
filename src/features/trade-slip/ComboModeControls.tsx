import { TradeSlipConfig } from '../../types';
import { ctrl } from '../../styles/controls';
import { computeComboPayout } from './useComboState';
import type { useComboState } from './useComboState';

type ComboHandlers = ReturnType<typeof useComboState>;

interface ComboModeControlsProps {
  config: TradeSlipConfig;
  onConfigChange: (config: Partial<TradeSlipConfig>) => void;
  handlers: ComboHandlers;
}

export function ComboModeControls({ config, onConfigChange, handlers }: ComboModeControlsProps) {
  const {
    handleCategoryChange,
    handleAddCategory,
    handleRemoveCategory,
    handleEventChange,
    handleAddEvent,
    handleRemoveEvent,
    handleMarketChange,
    handleAddMarket,
    handleRemoveMarket,
  } = handlers;

  return (
    <>
      {/* Financials Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Financials</div>

        <div className={ctrl.group}>
          <label htmlFor="combo-cost">Cost ($)</label>
          <input
            id="combo-cost"
            type="number"
            className={ctrl.input}
            placeholder="e.g., 99.84"
            value={config.comboCost || ''}
            onChange={(e) => {
              const cost = parseFloat(e.target.value) || 0;
              const changes: Partial<TradeSlipConfig> = { comboCost: cost };
              if (config.comboAutoCompute) {
                changes.comboPayout = computeComboPayout({ ...config, comboCost: cost });
              }
              onConfigChange(changes);
            }}
            min="0"
            step="0.01"
          />
        </div>

        <div className={ctrl.checkboxGroup}>
          <label className={ctrl.checkboxLabel}>
            <input
              type="checkbox"
              checked={config.comboAutoCompute}
              onChange={(e) => {
                const autoCompute = e.target.checked;
                if (autoCompute) {
                  const computedPayout = computeComboPayout(config);
                  onConfigChange({ comboAutoCompute: autoCompute, comboPayout: computedPayout });
                } else {
                  onConfigChange({ comboAutoCompute: autoCompute });
                }
              }}
              className={ctrl.checkboxInput}
            />
            Auto-compute Payout
          </label>


        </div>

        {config.comboAutoCompute && (
          <div className={ctrl.group}>
            <label htmlFor="combo-spread">Spread (%)</label>
            <div className={ctrl.sliderWrapper}>
              <input
                id="combo-spread"
                type="range"
                className="slider-input"
                value={config.comboSpread}
                onChange={(e) => {
                  const spread = Number(e.target.value);
                  const computedPayout = computeComboPayout({ ...config, comboSpread: spread });
                  onConfigChange({ comboSpread: spread, comboPayout: computedPayout });
                }}
                min="0"
                max="50"
                step="1"
              />
              <div className={ctrl.sliderValue}>{config.comboSpread}%</div>
            </div>
            <p className={ctrl.helpText}>
              Combined odds: {(() => {
                const allMarkets = config.comboCategories?.flatMap(c => c.events.flatMap(e => e.markets)) ?? [];
                const marketsWithOdds = allMarkets.filter(m => m.odds && m.odds > 0 && m.odds < 100);
                if (marketsWithOdds.length === 0) return 'set odds on each market';
                const combined = marketsWithOdds.reduce((acc, m) => acc * (m.odds! / 100), 1);
                return `${(combined * 100).toFixed(2)}% (${marketsWithOdds.length}/${allMarkets.length} legs)`;
              })()}
            </p>
          </div>
        )}

        <div className={ctrl.group}>
          <label htmlFor="combo-payout">Payout Amount ($)</label>
          <input
            id="combo-payout"
            type="number"
            className={ctrl.input}
            placeholder="e.g., 1920"
            value={config.comboPayout || ''}
            onChange={(e) => onConfigChange({ comboPayout: parseFloat(e.target.value) || 0 })}
            min="0"
            step="1"
            disabled={config.comboAutoCompute}
            style={config.comboAutoCompute ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          />
          {config.comboAutoCompute && (
            <p className={ctrl.helpText}>Computed from per-market odds and spread</p>
          )}
        </div>

        <div className={ctrl.group}>
          <label htmlFor="combo-timestamp">Purchase Date/Time (Optional)</label>
          <input
            id="combo-timestamp"
            type="datetime-local"
            className={ctrl.input}
            value={config.timestamp ?? ''}
            onChange={(e) => onConfigChange({ timestamp: e.target.value })}
          />


        </div>
      </div>

      {/* Categories & Markets Editor */}
      <div className={ctrl.group}>
        <label aria-hidden="true">Categories &amp; Markets</label>
        <div className={ctrl.comboLegs}>
          {config.comboCategories?.map((category, catIndex) => (
            <div key={category.id} className={`${ctrl.comboLeg} bg-dark-elevated`}>
              <div className={ctrl.comboLegHeader}>
                <span className={ctrl.comboLegTitle}>Category {catIndex + 1}</span>
                <button
                  type="button"
                  className={ctrl.comboLegRemove}
                  onClick={() => handleRemoveCategory(category.id)}
                  disabled={config.comboCategories.length <= 1}
                >
                  Remove
                </button>
              </div>
              <div className={ctrl.comboLegBody}>
                <label className={ctrl.comboLegLabel} htmlFor={`category-name-${category.id}`}>
                  Category Name
                </label>
                <input
                  id={`category-name-${category.id}`}
                  type="text"
                  className={ctrl.input}
                  placeholder="e.g., Pro Football"
                  value={category.name}
                  onChange={(e) => handleCategoryChange(category.id, { name: e.target.value })}
                />

                {/* Events within category */}
                <div className="mt-3 flex flex-col gap-3 border-l-2 border-dark-border-light pl-3">
                  {category.events.map((event, eventIndex) => (
                    <div key={event.id} className="flex flex-col gap-2 rounded-[6px] border border-dark-border-light bg-dark-surface p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-secondary">Event {eventIndex + 1}</span>
                        <button
                          type="button"
                          className={ctrl.comboLegRemove}
                          onClick={() => handleRemoveEvent(category.id, event.id)}
                          disabled={category.events.length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        className={ctrl.input}
                        placeholder="e.g., Kansas City @ Philadelphia"
                        value={event.name}
                        onChange={(e) => handleEventChange(category.id, event.id, { name: e.target.value })}
                      />

                      {/* Team colors */}
                      <div className="mt-2 flex gap-3">
                        <div className="flex items-center gap-1.5 [&_label]:mb-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:text-text-secondary">
                          <label>Color 1</label>
                          <input
                            type="color"
                            value={event.color1 || '#E31837'}
                            onChange={(e) => handleEventChange(category.id, event.id, { color1: e.target.value })}
                            className={ctrl.colorInput}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 [&_label]:mb-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:text-text-secondary">
                          <label>Color 2</label>
                          <input
                            type="color"
                            value={event.color2 || '#004C54'}
                            onChange={(e) => handleEventChange(category.id, event.id, { color2: e.target.value })}
                            className={ctrl.colorInput}
                          />
                        </div>
                      </div>

                      {/* Markets within event */}
                      <div className="mt-2 flex flex-col gap-2 border-l-2 border-dark-border pl-2.5">
                        {event.markets.map((market, marketIndex) => (
                          <div key={market.id} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-medium uppercase tracking-[0.04em] text-text-secondary">Market {marketIndex + 1}</span>
                              <button
                                type="button"
                                className={ctrl.comboLegRemove}
                                onClick={() => handleRemoveMarket(category.id, event.id, market.id)}
                                disabled={event.markets.length <= 1}
                              >
                                Remove
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Prefix"
                                value={market.prefix || ''}
                                onChange={(e) => handleMarketChange(category.id, event.id, market.id, { prefix: e.target.value || undefined })}
                                className={`${ctrl.inputInline} w-16 shrink-0`}
                              />
                              <input
                                type="text"
                                className={`${ctrl.inputInline} min-w-0 flex-1`}
                                placeholder="Market text (e.g., Philadelphia)"
                                value={market.text}
                                onChange={(e) => handleMarketChange(category.id, event.id, market.id, { text: e.target.value })}
                              />
                              <label
                                title="Resolved"
                                className="flex items-center cursor-pointer shrink-0"
                              >
                                <input
                                  type="checkbox"
                                  checked={market.resolved || false}
                                  onChange={(e) => handleMarketChange(category.id, event.id, market.id, { resolved: e.target.checked })}
                                  className="size-4 cursor-pointer accent-[#00DD94]"
                                />
                              </label>
                            </div>
                            {config.comboAutoCompute && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-medium text-text-secondary shrink-0">Odds</span>
                                <input
                                  type="number"
                                  className={`${ctrl.inputInline} w-16 shrink-0 text-center`}
                                  placeholder="%"
                                  value={market.odds ?? ''}
                                  onChange={(e) => handleMarketChange(category.id, event.id, market.id, { odds: parseFloat(e.target.value) || undefined })}
                                  min="1"
                                  max="99"
                                  step="1"
                                />
                                <span className="text-[10px] text-text-muted">%</span>
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className={ctrl.comboLegAdd}
                          onClick={() => handleAddMarket(category.id, event.id)}
                        >
                          + Add Market
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={ctrl.comboLegAdd}
                    onClick={() => handleAddEvent(category.id)}
                  >
                    + Add Event
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className={ctrl.comboLegAdd} onClick={handleAddCategory}>
            + Add Category
          </button>
        </div>
      </div>
    </>
  );
}
