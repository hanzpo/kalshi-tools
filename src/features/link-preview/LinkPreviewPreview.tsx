import { useRef } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { AxisBottom, AxisRight } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { curveLinear } from '@visx/curve';
import { MarketConfig, DataPoint } from '../../types';
import { generateChange, formatVolume, getDateRangeForTimeHorizon, generateDateLabels } from '../../lib/dataGenerator';
import { ImageIcon } from '../../components/ui/Icons';
import './LinkPreviewPreview.css';

interface LinkPreviewPreviewProps {
  config: MarketConfig;
  data: DataPoint[];
  leftImage: string | null;
  onTimeHorizonChange?: (timeHorizon: string) => void;
}

function formatNumberWithUnit(value: number, unit: string): string {
  return `${value.toFixed(0)}${unit}`;
}

function formatNumberForDisplay(value: number, unit: string): string {
  return `${value.toFixed(0)}${unit}`;
}

export function LinkPreviewPreview({ config, data, leftImage, onTimeHorizonChange }: LinkPreviewPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  
  const change = generateChange(data);
  const changeValue = parseFloat(change);
  const isPositive = changeValue >= 0;
  
  const chartColor = isPositive ? '#09C285' : '#D91616';
  const bgColor = '#ffffff';
  const textColor = '#000000';
  const secondaryTextColor = '#6b7280';
  const gridColor = '#e5e7eb';
  
  const { startDate: axisStart, endDate: axisEnd } = config.timeHorizon === 'ALL'
    ? { startDate: config.startDate, endDate: config.endDate }
    : getDateRangeForTimeHorizon(config.timeHorizon, config.endDate);

  const generatedLabels = generateDateLabels(axisStart, axisEnd, config.timeHorizon);
  const xAxisTicks = generatedLabels.filter((label, index) => generatedLabels.indexOf(label) === index);

  // Calculate Y-axis domain for forecast type
  const isForecast = config.marketType === 'forecast';
  let yAxisDomain: [number, number] = [0, 100];
  let yAxisTicks: number[] = [0, 20, 40, 60, 80, 100];
  let yAxisFormatter = (value: number) => `${value}%`;
  
  if (isForecast && data.length > 0) {
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    const domainMin = Math.max(0, minValue - padding);
    const domainMax = maxValue + padding;
    
    yAxisDomain = [domainMin, domainMax];
    
    const tickCount = 5;
    const tickStep = (domainMax - domainMin) / (tickCount - 1);
    yAxisTicks = [];
    for (let i = 0; i < tickCount; i++) {
      const tickValue = domainMin + tickStep * i;
      const roundedTick = Math.round(tickValue * 100) / 100;
      yAxisTicks.push(roundedTick);
    }
    
    yAxisTicks = Array.from(new Set(yAxisTicks)).sort((a, b) => a - b);
    
    const unit = config.forecastUnit || 'K';
    yAxisFormatter = (value: number) => formatNumberWithUnit(value, unit);
  } else if (isForecast) {
    yAxisTicks = [0, 20, 40, 60, 80, 100];
  }
  
  return (
    <div
      ref={previewRef}
      id="link-preview"
      className="link-preview-container"
      style={{ backgroundColor: bgColor }}
    >
      {/* Left Side - Image */}
      <div className="link-preview-left">
        {leftImage ? (
          <>
            <img 
              src={leftImage} 
              alt="Preview" 
              className="link-preview-image"
            />
          </>
        ) : (
          <div className="link-preview-placeholder">
            <ImageIcon size={40} />
          </div>
        )}
      </div>

      {/* Right Side - Chart */}
      <div className="link-preview-right" style={{ color: textColor }}>
        {/* Header */}
        <div className="link-preview-chart-header">
          <div className="link-preview-title-section">
            {config.image && (
              <img
                src={config.image}
                alt="Market"
                className="link-preview-chart-image"
              />
            )}
            <h2 className="link-preview-chart-title">{config.title || 'Untitled Market'}</h2>
          </div>
        </div>

        {/* Odds Display */}
        <div className="link-preview-odds-section">
          {config.marketType === 'binary' ? (
            <>
              <div className="link-preview-odds-main">
                <div className="link-preview-odds-group">
                  <span
                    className="link-preview-odds-value"
                    style={{
                      color: config.currentOdds === 0 ? '#cccccc' : textColor
                    }}
                  >
                    {config.currentOdds === 0 ? '<1' : Math.min(config.currentOdds, 99)}%
                  </span>
                  <span className="link-preview-odds-label">chance</span>
                </div>
                <span
                  className="link-preview-odds-change"
                  style={{
                    color: isPositive ? chartColor : '#D91616',
                  }}
                >
                  {isPositive ? '▲' : '▼'} {Math.abs(changeValue).toFixed(1)}
                </span>
              </div>
              <div className="link-preview-platform-logo">
                <svg width="44" height="13" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#28CC95' }}>
                  <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="currentColor"></path>
                </svg>
              </div>
            </>
          ) : config.marketType === 'forecast' ? (
            <>
              <div className="link-preview-odds-main">
                <div className="link-preview-odds-group">
                  <span
                    className="link-preview-odds-value"
                    style={{ color: textColor }}
                  >
                    {formatNumberForDisplay(config.forecastValue ?? 128000, config.forecastUnit || 'K')}
                  </span>
                  <span className="link-preview-odds-label">forecast</span>
                </div>
                <span
                  className="link-preview-odds-change"
                  style={{
                    color: isPositive ? chartColor : '#D91616',
                  }}
                >
                  {isPositive ? '▲' : '▼'} {Math.abs(changeValue).toFixed(1)}
                </span>
              </div>
              <div className="link-preview-platform-logo">
                <svg width="44" height="13" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#28CC95' }}>
                  <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="currentColor"></path>
                </svg>
              </div>
            </>
          ) : (
            <>
              <div className="link-preview-odds-main" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {config.outcomes.map((outcome) => (
                  <div key={outcome.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: outcome.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: '500', color: secondaryTextColor }}>
                      {outcome.name}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: textColor }}>
                      {outcome.currentOdds === 0 ? '1' : Math.min(outcome.currentOdds, 99)}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="link-preview-platform-logo">
                <svg width="44" height="13" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#28CC95' }}>
                  <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="currentColor"></path>
                </svg>
              </div>
            </>
          )}
        </div>

        {/* Chart */}
        <div className="link-preview-chart-container">
          <ParentSize>
            {({ width, height }) => {
              if (width === 0 || height === 0) return null;

              const margin = { top: 5, right: 40, left: 10, bottom: 22 };

              const xScale = scaleLinear<number>({
                domain: [0, data.length - 1],
                range: [margin.left, width - margin.right],
              });

              const yScale = scaleLinear<number>({
                domain: yAxisDomain,
                range: [height - margin.bottom, margin.top],
              });

              const innerWidth = width - margin.left - margin.right;

              const xTickIndices = xAxisTicks
                .map(tick => data.findIndex(d => d.time === tick))
                .filter(idx => idx >= 0);

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
                    top={height - margin.bottom}
                    hideAxisLine
                    hideTicks
                    tickValues={xTickIndices}
                    tickFormat={(idx) => data[idx as number]?.time ?? ''}
                    tickLabelProps={() => ({
                      fill: secondaryTextColor,
                      fontSize: 10,
                      textAnchor: 'middle' as const,
                    })}
                  />
                  <AxisRight
                    scale={yScale}
                    left={width - margin.right}
                    hideAxisLine
                    hideTicks
                    tickValues={yAxisTicks}
                    tickFormat={(v) => yAxisFormatter(v as number)}
                    tickLabelProps={() => ({
                      fill: secondaryTextColor,
                      fontSize: 10,
                      textAnchor: 'start' as const,
                      dx: 6,
                      dy: 4,
                    })}
                  />
                  {(config.marketType === 'binary' || config.marketType === 'forecast') ? (
                    <>
                      <LinePath
                        data={data}
                        x={(_d, i) => xScale(i) ?? 0}
                        y={d => yScale(d.value) ?? 0}
                        stroke={chartColor}
                        strokeWidth={2}
                        curve={curveLinear}
                      />
                      {data.length > 0 && (() => {
                        const lastIdx = data.length - 1;
                        return (
                          <circle
                            cx={xScale(lastIdx) ?? 0}
                            cy={yScale(data[lastIdx].value) ?? 0}
                            r={4}
                            fill={chartColor}
                            stroke={chartColor}
                            strokeWidth={2}
                          />
                        );
                      })()}
                    </>
                  ) : (
                    <>
                      {config.outcomes.map((outcome) => (
                        <g key={outcome.id}>
                          <LinePath
                            data={data}
                            x={(_d, i) => xScale(i) ?? 0}
                            y={d => yScale(d[`value_${outcome.id}`] as number) ?? 0}
                            stroke={outcome.color}
                            strokeWidth={2}
                            curve={curveLinear}
                          />
                          {data.length > 0 && (() => {
                            const lastIdx = data.length - 1;
                            return (
                              <circle
                                cx={xScale(lastIdx) ?? 0}
                                cy={yScale(data[lastIdx][`value_${outcome.id}`] as number) ?? 0}
                                r={4}
                                fill={outcome.color}
                                stroke={outcome.color}
                                strokeWidth={2}
                              />
                            );
                          })()}
                        </g>
                      ))}
                    </>
                  )}
                </svg>
              );
            }}
          </ParentSize>
        </div>

        {/* Footer */}
        <div className="link-preview-chart-footer">
          <div className="link-preview-volume" style={{ color: secondaryTextColor }}>
            {formatVolume(config.volume)}
          </div>
          <div className="link-preview-timeframes">
            {['6H', '1D', '1W', '1M', 'ALL'].map((tf) => (
              <button
                key={tf}
                className="link-preview-timeframe-btn"
                onClick={() => onTimeHorizonChange?.(tf)}
                style={{
                  color: config.timeHorizon === tf ? textColor : secondaryTextColor,
                  backgroundColor: config.timeHorizon === tf ? '#f3f4f6' : 'transparent',
                  fontWeight: config.timeHorizon === tf ? '600' : '500',
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

