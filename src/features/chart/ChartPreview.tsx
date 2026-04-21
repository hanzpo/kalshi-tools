import { useRef } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { AxisBottom, AxisRight } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { curveLinear } from '@visx/curve';
import {
  CalendarDays,
  Download,
  MessageCircle,
  Share2,
  Triangle,
} from 'lucide-react';
import { MarketConfig, DataPoint, Outcome } from '../../types';
import {
  formatVolume,
  generateChange,
  generateDateLabels,
  getDateRangeForTimeHorizon,
} from '../../lib/dataGenerator';
import {
  adjustOutcomeColor,
  formatNumberWithUnit,
} from '../../lib/chartHelpers';
import { KalshiLogo } from '../../components/ui/KalshiLogo';

interface ChartPreviewProps {
  config: MarketConfig;
  data: DataPoint[];
  onTimeHorizonChange?: (timeHorizon: string) => void;
}

const BODY_FONT = "'Graphik', 'Inter', sans-serif";
const TITLE_FONT = "'Graphik Condensed App', 'Graphik', 'Inter', sans-serif";

function getNiceOddsStep(range: number): number {
  if (range <= 10) return 5;
  if (range <= 20) return 10;
  if (range <= 40) return 10;
  return 20;
}

function buildOddsAxis(config: MarketConfig, data: DataPoint[]) {
  const values = config.marketType === 'multi'
    ? config.outcomes.flatMap((outcome) =>
        data
          .map((point) => point[`value_${outcome.id}`])
          .filter((value): value is number => typeof value === 'number'),
      )
    : data.map((point) => point.value);

  if (values.length === 0) {
    return {
      domain: [0, 100] as [number, number],
      ticks: [0, 25, 50, 75, 100],
    };
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const rawRange = Math.max(maxValue - minValue, config.marketType === 'multi' ? 8 : 18);
  const step = getNiceOddsStep(rawRange);
  const padding = Math.max(step, Math.ceil(rawRange * 0.35));

  let domainMin = Math.max(0, Math.floor((minValue - padding) / step) * step);
  let domainMax = Math.min(100, Math.ceil((maxValue + padding) / step) * step);

  while (domainMax - domainMin < step * 4) {
    if (domainMin > 0) {
      domainMin = Math.max(0, domainMin - step);
    }
    if (domainMax - domainMin >= step * 4) {
      break;
    }
    if (domainMax < 100) {
      domainMax = Math.min(100, domainMax + step);
    } else {
      break;
    }
  }

  const ticks: number[] = [];
  for (let value = domainMin; value <= domainMax; value += step) {
    ticks.push(value);
  }

  return {
    domain: [domainMin, domainMax] as [number, number],
    ticks,
  };
}

function buildForecastAxis(config: MarketConfig, data: DataPoint[]) {
  if (data.length === 0) {
    return {
      domain: [0, 100] as [number, number],
      ticks: [0, 25, 50, 75, 100],
      formatter: (value: number) => formatNumberWithUnit(value, config.forecastUnit || 'K'),
    };
  }

  const values = data.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, maxValue * 0.08, 1);
  const padding = range * 0.18;
  const domainMin = Math.max(0, minValue - padding);
  const domainMax = maxValue + padding;
  const tickCount = 5;
  const tickStep = (domainMax - domainMin) / (tickCount - 1);

  const ticks = Array.from({ length: tickCount }, (_, index) =>
    Math.round((domainMin + tickStep * index) * 100) / 100,
  );

  return {
    domain: [domainMin, domainMax] as [number, number],
    ticks,
    formatter: (value: number) => formatNumberWithUnit(value, config.forecastUnit || 'K'),
  };
}

function getOutcomeValue(point: DataPoint, outcome: Outcome) {
  const value = point[`value_${outcome.id}`];
  return typeof value === 'number' ? value : point.value;
}

function getOutcomeLabel(name: string) {
  const shortName = name.trim();
  if (shortName.length <= 4) {
    return shortName.toUpperCase();
  }

  const parts = shortName.split(/\s+/);
  if (parts.length > 1) {
    const first = parts[0];
    if (first.length <= 4) {
      return first.toUpperCase();
    }

    return first.slice(0, 3).toUpperCase();
  }

  return shortName.slice(0, 3).toUpperCase();
}

export function ChartPreview({ config, data, onTimeHorizonChange }: ChartPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const isDark = config.darkMode === true;
  const isForecast = config.marketType === 'forecast';
  const isBinary = config.marketType === 'binary';
  const isMulti = config.marketType === 'multi';
  const change = generateChange(data);
  const changeValue = parseFloat(change);
  const isPositive = changeValue >= 0;

  const bgColor = isDark ? '#0B0D12' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.92)' : 'rgba(0, 0, 0, 0.92)';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.46)' : 'rgba(0, 0, 0, 0.55)';
  const mutedTextColor = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.34)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.14)';
  const binaryLineColor = isPositive ? '#29D3A0' : '#FF6B6B';
  const iconColor = isDark ? 'rgba(255, 255, 255, 0.68)' : 'rgba(0, 0, 0, 0.78)';

  const { startDate: axisStart, endDate: axisEnd } = config.timeHorizon === 'ALL'
    ? { startDate: config.startDate, endDate: config.endDate }
    : getDateRangeForTimeHorizon(config.timeHorizon, config.endDate);

  const generatedLabels = generateDateLabels(axisStart, axisEnd, config.timeHorizon);
  const xAxisTicks = generatedLabels.filter((label, index) => generatedLabels.indexOf(label) === index);

  const oddsAxis = buildOddsAxis(config, data);
  const forecastAxis = buildForecastAxis(config, data);
  const yAxisDomain = isForecast ? forecastAxis.domain : oddsAxis.domain;
  const yAxisTicks = isForecast ? forecastAxis.ticks : oddsAxis.ticks;
  const yAxisFormatter = isForecast
    ? forecastAxis.formatter
    : (value: number) => `${Math.round(value)}%`;

  const chartMetricLabel = isForecast ? 'forecast' : 'chance';
  const metricValue = isForecast
    ? formatNumberWithUnit(config.forecastValue ?? 128000, config.forecastUnit || 'K')
    : `${config.currentOdds === 0 ? '<1' : Math.min(config.currentOdds, 99)}%`;

  return (
    <div
      ref={previewRef}
      id="chart-preview"
      className="w-full max-w-[1220px] rounded-[22px] px-7 py-5 transition-[background-color,color,border-color] duration-200"
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        boxShadow: isDark ? '0 20px 60px rgba(0, 0, 0, 0.18)' : '0 18px 44px rgba(0, 0, 0, 0.08)',
        fontFamily: BODY_FONT,
      }}
    >
      <div className="mb-2.5 flex items-start justify-between gap-6">
        <div className="flex min-w-0 items-start gap-4">
          {config.image && (
            <img
              src={config.image}
              alt="Market"
              className="size-14 shrink-0 rounded-[14px] object-cover"
            />
          )}
          <div className="min-w-0">
            <div
              className="mb-2 text-[12px] font-medium tracking-[0.01em]"
              style={{ color: secondaryTextColor }}
            >
              Kalshi Market
            </div>
            <h2
              className="max-w-[720px] leading-[0.95] tracking-[-0.02em]"
              style={{
                color: textColor,
                fontFamily: TITLE_FONT,
                fontWeight: 500,
                fontSize: isMulti ? '42px' : '46px',
              }}
            >
              {config.title || 'Untitled Market'}
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <CalendarDays size={18} strokeWidth={1.75} color={iconColor} />
          <MessageCircle size={18} strokeWidth={1.75} color={iconColor} />
          <Share2 size={18} strokeWidth={1.75} color={iconColor} />
          <Download size={18} strokeWidth={1.75} color={iconColor} />
        </div>
      </div>

      <div
        className="mb-3.5 flex items-center justify-between border-b pb-3"
        style={{ borderColor }}
      >
        <div
          className="grid size-9 place-items-center rounded-xl"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
            border: `1px solid ${borderColor}`,
          }}
        >
          <div className="space-y-0.5">
            <div className="h-[2px] w-4 rounded-full" style={{ backgroundColor: iconColor }} />
            <div className="h-[2px] w-4 rounded-full" style={{ backgroundColor: iconColor }} />
            <div className="h-[2px] w-4 rounded-full" style={{ backgroundColor: iconColor }} />
          </div>
        </div>

        <KalshiLogo
          width={58}
          height={17}
          style={{ color: '#28CC95' }}
        />
      </div>

      {!isMulti && (
        <div className="mb-3.5 flex items-center gap-3">
          <div
            className="leading-none tracking-[-0.04em]"
            style={{
              color: textColor,
              fontFamily: TITLE_FONT,
              fontWeight: 500,
              fontSize: '50px',
            }}
          >
            {metricValue}
          </div>
          <div
            className="text-[17px] font-normal leading-none"
            style={{ color: secondaryTextColor }}
          >
            {chartMetricLabel}
          </div>
          <div
            className="flex items-center gap-1 text-[17px] font-medium leading-none"
            style={{ color: isPositive ? '#2AD39C' : '#FF6B6B' }}
          >
            <Triangle
              size={11}
              fill="currentColor"
              stroke="none"
              style={{
                transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            />
            <span>{Math.abs(changeValue).toFixed(1)}</span>
          </div>
        </div>
      )}

      <div
        className="mb-3 w-full"
        style={{
          aspectRatio: '4.15 / 1',
          minHeight: '170px',
          maxHeight: '205px',
        }}
      >
        <ParentSize>
          {({ width, height }) => {
            if (width === 0 || height === 0 || data.length === 0) {
              return null;
            }

            const margin = {
              top: 8,
              right: isMulti ? 98 : 52,
              bottom: 24,
              left: 8,
            };

            const xScale = scaleLinear<number>({
              domain: [0, Math.max(data.length - 1, 1)],
              range: [margin.left, width - margin.right],
            });

            const yScale = scaleLinear<number>({
              domain: yAxisDomain,
              range: [height - margin.bottom, margin.top],
            });

            const innerWidth = width - margin.left - margin.right;
            const xTickIndices = xAxisTicks
              .map((tick) => data.findIndex((point) => point.time === tick))
              .filter((index) => index >= 0);

            const labelledOutcomeIds = new Set(
              config.outcomes.slice(0, 4).map((outcome) => outcome.id),
            );

            return (
              <svg width={width} height={height} style={{ overflow: 'visible' }}>
                <GridRows
                  scale={yScale}
                  width={innerWidth}
                  left={margin.left}
                  stroke={gridColor}
                  strokeDasharray="1 4"
                  strokeWidth={1}
                  tickValues={yAxisTicks}
                />

                <AxisBottom
                  scale={xScale}
                  top={height - margin.bottom + 2}
                  hideAxisLine
                  hideTicks
                  tickValues={xTickIndices}
                  tickFormat={(index) => data[index as number]?.time ?? ''}
                  tickLabelProps={() => ({
                    fill: secondaryTextColor,
                    fontSize: 11,
                    textAnchor: 'middle' as const,
                    fontFamily: BODY_FONT,
                  })}
                />

                <AxisRight
                  scale={yScale}
                  left={width - (isMulti ? 52 : 34)}
                  hideAxisLine
                  hideTicks
                  tickValues={yAxisTicks}
                  tickFormat={(value) => yAxisFormatter(value as number)}
                  tickLabelProps={() => ({
                    fill: secondaryTextColor,
                    fontSize: 11,
                    textAnchor: 'start' as const,
                    dx: 8,
                    dy: 2,
                    fontFamily: BODY_FONT,
                  })}
                />

                {(isBinary || isForecast) && (
                  <>
                    <LinePath
                      data={data}
                      x={(_point, index) => xScale(index) ?? 0}
                      y={(point) => yScale(point.value) ?? 0}
                      stroke={binaryLineColor}
                      strokeWidth={2.2}
                      curve={curveLinear}
                    />
                    {(() => {
                      const lastIndex = data.length - 1;
                      const lastPoint = data[lastIndex];
                      const cx = xScale(lastIndex) ?? 0;
                      const cy = yScale(lastPoint.value) ?? 0;

                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={6} fill={binaryLineColor} opacity={0.18} />
                          <circle
                            cx={cx}
                            cy={cy}
                            r={3.5}
                            fill={binaryLineColor}
                            stroke={binaryLineColor}
                            strokeWidth={1.8}
                          />
                        </g>
                      );
                    })()}
                  </>
                )}

                {isMulti &&
                  config.outcomes.map((outcome) => {
                    const stroke = adjustOutcomeColor(outcome.color, isDark);
                    const lastIndex = data.length - 1;
                    const lastPoint = data[lastIndex];
                    const lastValue = getOutcomeValue(lastPoint, outcome);
                    const cx = xScale(lastIndex) ?? 0;
                    const cy = yScale(lastValue) ?? 0;

                    return (
                      <g key={outcome.id}>
                        <LinePath
                          data={data}
                          x={(_point, index) => xScale(index) ?? 0}
                          y={(point) => yScale(getOutcomeValue(point, outcome)) ?? 0}
                          stroke={stroke}
                          strokeWidth={2.1}
                          curve={curveLinear}
                        />

                        <circle cx={cx} cy={cy} r={6} fill={stroke} opacity={0.18} />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={3.5}
                          fill={stroke}
                          stroke={stroke}
                          strokeWidth={1.8}
                        />

                        {labelledOutcomeIds.has(outcome.id) && (
                          <g transform={`translate(${cx + 10}, ${cy})`}>
                            <text
                              y={-6}
                              fill={stroke}
                              fontSize={10}
                              fontWeight={500}
                              fontFamily={BODY_FONT}
                            >
                              {getOutcomeLabel(outcome.name)}
                            </text>
                            <text
                              y={16}
                              fill={stroke}
                              fontSize={15}
                              fontWeight={600}
                              fontFamily={BODY_FONT}
                            >
                              {Math.round(lastValue)}%
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
              </svg>
            );
          }}
        </ParentSize>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div
          className="text-[13px] font-medium"
          style={{ color: secondaryTextColor }}
        >
          {formatVolume(config.volume)}
        </div>

        <div className="flex items-center gap-1">
          {['6H', '1D', '1W', '1M', 'ALL'].map((timeframe) => {
            const active = config.timeHorizon === timeframe;
            return (
              <button
                key={timeframe}
                className="cursor-pointer rounded-[10px] border-none px-2 py-1 text-[11px] font-medium transition-colors duration-150"
                onClick={() => onTimeHorizonChange?.(timeframe)}
                style={{
                  color: active ? textColor : mutedTextColor,
                  backgroundColor: active
                    ? (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)')
                    : 'transparent',
                  fontFamily: BODY_FONT,
                }}
              >
                {timeframe}
              </button>
            );
          })}
        </div>
      </div>

      {config.showWatermark && (
        <div
          className="pt-4 text-center text-[12px]"
          style={{
            color: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.22)',
            fontFamily: BODY_FONT,
          }}
        >
          kalshi.tools
        </div>
      )}
    </div>
  );
}
