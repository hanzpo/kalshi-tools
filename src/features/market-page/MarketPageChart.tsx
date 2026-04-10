import type { ScaleLinear } from '@visx/vendor/d3-scale';
import { LinePath } from '@visx/shape';
import { GridRows } from '@visx/grid';
import { curveLinear } from '@visx/curve';
import { MarketPageConfig, OUTCOME_COLORS } from '../../types/market-page';
import { KalshiLogo } from '../../components/ui/KalshiLogo';
import { v } from './helpers';

// Get outcome color, swapping black for white in dark mode
export function adjustColorForDarkMode(color: string, isDarkMode: boolean): string {
  if (isDarkMode && color === '#000000') return '#ffffff';
  return color;
}

export interface ChartScales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  width: number;
  padding: { left: number; right: number; top: number; bottom: number };
}

interface MarketPageChartProps {
  chartScales: ChartScales | null;
  config: MarketPageConfig;
  isDark: boolean;
  volume: string;
  topOutcomes: MarketPageConfig['outcomes'];
}

export function MarketPageChart({ chartScales, config, isDark, volume, topOutcomes }: MarketPageChartProps) {
  return (
    <>
      {/* Chart Legend */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {topOutcomes.map((outcome, index) => (
            <div key={outcome.id} className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: adjustColorForDarkMode(outcome.color || OUTCOME_COLORS[index % OUTCOME_COLORS.length], isDark) }}
              />
              <span className="text-[15px] font-normal leading-[22px] text-[var(--kmp-text-primary)]">
                {outcome.name}
              </span>
              <span className="text-[16px] font-normal text-[var(--kmp-text-primary)]">
                {outcome.yesPrice}%
              </span>
            </div>
          ))}
        </div>
        <KalshiLogo style={{ color: v('brand'), height: 14, width: 'auto' }} />
      </div>

      {/* Chart */}
      <div className="mb-2 w-full">
        <svg className="block h-auto w-full" viewBox="0 0 650 180" preserveAspectRatio="xMidYMid meet">
          {chartScales && (
            <GridRows
              scale={chartScales.yScale}
              width={chartScales.width - chartScales.padding.right}
              left={chartScales.padding.left}
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              strokeDasharray="4 4"
              strokeWidth={1}
              tickValues={[0, 25, 50, 75, 100]}
            />
          )}

          {/* Y-axis labels */}
          <g>
            {['100%', '75%', '50%', '25%', '0%'].map((label, i) => (
              <text key={i} x="615" y={15 + i * 37} style={{ fontSize: 11, fill: v('text-tertiary'), fontFamily: "'Kalshi Sans', sans-serif" }}>
                {label}
              </text>
            ))}
          </g>

          {/* Chart lines */}
          {chartScales && config.outcomes.map((outcome) => (
            <LinePath
              key={outcome.id}
              data={config.chartData}
              x={(_d, i) => chartScales.xScale(i) ?? 0}
              y={(d) => chartScales.yScale(d[`value_${outcome.id}`] ?? d.value) ?? 0}
              stroke={adjustColorForDarkMode(outcome.color, isDark)}
              strokeWidth={2}
              curve={curveLinear}
            />
          ))}

          {/* X-axis month labels */}
          <g>
            {['Oct', 'Dec', 'Jan', 'Feb', 'Mar'].map((label, i) => (
              <text key={i} x={20 + i * 140} y="175" style={{ fontSize: 11, fill: v('text-tertiary'), fontFamily: "'Kalshi Sans', sans-serif" }}>
                {label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {/* Chart Footer */}
      <div
        className="flex items-center justify-between py-3"
        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
      >
        <span className="text-[13px] font-normal text-[var(--kmp-text-primary)]">
          {volume} vol
        </span>
        <div className="flex items-center gap-1">
          {['1D', '1W', '1M', 'ALL'].map((range) => (
            <button
              key={range}
              className={`cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-[13px] ${config.chartTimeRange === range ? 'font-semibold text-[var(--kmp-text-primary)]' : 'font-normal text-[var(--kmp-text-tertiary)]'}`}
            >
              {range}
            </button>
          ))}
          {/* Settings icon */}
          <button className="flex cursor-pointer items-center justify-center border-none bg-transparent p-1.5 text-[var(--kmp-text-secondary)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
