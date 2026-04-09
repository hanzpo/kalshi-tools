import { useRef } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { AxisBottom, AxisRight } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { curveLinear } from '@visx/curve';
import { MarketConfig, DataPoint } from '../../types';
import { generateChange, formatVolume, getDateRangeForTimeHorizon, generateDateLabels } from '../../lib/dataGenerator';
import { formatNumberWithUnit, adjustOutcomeColor } from '../../lib/chartHelpers';

interface ChartPreviewProps {
  config: MarketConfig;
  data: DataPoint[];
  onTimeHorizonChange?: (timeHorizon: string) => void;
}

export function ChartPreview({ config, data, onTimeHorizonChange }: ChartPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const change = generateChange(data);
  const changeValue = parseFloat(change);
  const isPositive = changeValue >= 0;

  const isDark = config.darkMode === true;
  const chartColor = isPositive ? '#00DD94' : '#D91616';
  const bgColor = isDark ? '#141414' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#2a2a2a' : '#e5e7eb';
  
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
    const padding = range * 0.1; // 10% padding
    
    const domainMin = Math.max(0, minValue - padding);
    const domainMax = maxValue + padding;
    
    yAxisDomain = [domainMin, domainMax];
    
    // Generate nice ticks with proper rounding to avoid overlapping labels
    const tickCount = 5;
    const tickStep = (domainMax - domainMin) / (tickCount - 1);
    yAxisTicks = [];
    for (let i = 0; i < tickCount; i++) {
      const tickValue = domainMin + tickStep * i;
      // Round to 2 decimal places to avoid floating point precision issues
      const roundedTick = Math.round(tickValue * 100) / 100;
      yAxisTicks.push(roundedTick);
    }
    
    // Remove duplicates that might cause overlapping labels
    yAxisTicks = Array.from(new Set(yAxisTicks)).sort((a, b) => a - b);
    
    const unit = config.forecastUnit || 'K';
    yAxisFormatter = (value: number) => formatNumberWithUnit(value, unit);
  } else if (isForecast) {
    // Reset ticks for forecast when data is empty to prevent stale values
    yAxisTicks = [0, 20, 40, 60, 80, 100];
  }
  
  return (
    <div
      ref={previewRef}
      id="chart-preview"
      className={`w-full max-w-[1200px] rounded-xl px-8 py-7 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.1)] transition-[background-color,color,border-color] duration-200 ${isDark ? 'border border-dark-border' : 'border border-gray-100'}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {/* Google Search Bar - Only show if searchQuery is defined */}
      {config.searchQuery !== undefined && (
        <div className={`mb-6 border-b pb-4 ${isDark ? 'border-dark-border-light' : 'border-border-light'}`}>
        <div className={`flex h-11 w-full max-w-full items-center rounded-3xl border px-4 transition-shadow duration-200 ${isDark ? 'border-dark-border-light bg-[#1a1a1a] shadow-none hover:shadow-[0_1px_4px_rgba(255,255,255,0.1)]' : 'border-[#dfe1e5] bg-white shadow-[0_2px_5px_1px_rgba(64,60,67,0.16)] hover:shadow-[0_2px_8px_1px_rgba(64,60,67,0.24)]'}`}>
          <div className="mr-3 flex shrink-0 items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.83 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.23-.7-.36-1.43-.36-2.18s.13-1.48.36-2.18V6.89H2.18C1.43 8.15 1 9.6 1 11.25s.43 3.1 1.18 4.36l3.66-2.52z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.89l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div className="flex min-w-0 flex-1 items-center">
            <span className={`truncate text-base ${isDark ? 'text-text-primary' : 'text-[#202124]'}`}>{config.searchQuery || 'Untitled search'}</span>
          </div>
          <div className="ml-3 flex shrink-0 items-center gap-3">
            <svg className={`size-5 cursor-pointer transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            <svg className={`size-5 cursor-pointer transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="1" width="22" height="22" rx="3"/>
              <circle cx="8" cy="8" r="2"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <svg className={`size-5 cursor-pointer transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-0">
          <button className={`cursor-pointer border-b-2 border-transparent bg-none px-3 py-2 font-inherit text-sm transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`}>AI Mode</button>
          <button className={`cursor-pointer border-b-2 px-3 py-2 font-inherit text-sm font-medium bg-none transition-colors duration-200 ${isDark ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-[#1a73e8] text-[#1a73e8]'}`}>All</button>
          <button className={`cursor-pointer border-b-2 border-transparent bg-none px-3 py-2 font-inherit text-sm transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`}>News</button>
          <button className={`cursor-pointer border-b-2 border-transparent bg-none px-3 py-2 font-inherit text-sm transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`}>Images</button>
          <button className={`cursor-pointer border-b-2 border-transparent bg-none px-3 py-2 font-inherit text-sm transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`}>Videos</button>
          <button className={`cursor-pointer border-b-2 border-transparent bg-none px-3 py-2 font-inherit text-sm transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`}>Shopping</button>
          <button className={`cursor-pointer border-b-2 border-transparent bg-none px-3 py-2 font-inherit text-sm transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`}>Short videos</button>
          <button className={`cursor-pointer border-b-2 border-transparent bg-none px-3 py-2 font-inherit text-sm transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`}>More &#9662;</button>
          <button className={`cursor-pointer border-b-2 border-transparent bg-none px-3 py-2 font-inherit text-sm transition-colors duration-200 ${isDark ? 'text-text-secondary hover:text-text-primary' : 'text-[#5f6368] hover:text-[#202124]'}`}>Tools &#9662;</button>
        </div>
      </div>
      )}

      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex flex-1 items-center gap-3">
          {config.image && (
            <img
              src={config.image}
              alt="Market"
              className="size-[53px] shrink-0 rounded-lg object-cover"
            />
          )}
          <h2 className={`max-w-[650px] text-[25px] font-semibold leading-[1.4] tracking-[-0.2px] ${isDark ? 'text-white' : 'text-[#111827]'}`}>{config.title || 'Untitled Market'}</h2>
        </div>
        <div className="ml-3 flex gap-1">
          <button className="flex cursor-pointer items-center justify-center rounded-[6px] border-none bg-none p-1.5 opacity-50 transition-opacity duration-200 hover:opacity-80" style={{ color: textColor }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 11h2v2H7zm14-5v14c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2l.01-14c0-1.1.88-2 1.99-2h1V2h2v2h8V2h2v2h1c1.1 0 2 .9 2 2M5 8h14V6H5zm14 12V10H5v10zm-4-7h2v-2h-2zm-4 0h2v-2h-2z" />
            </svg>
          </button>
          <button className="flex cursor-pointer items-center justify-center rounded-[6px] border-none bg-none p-1.5 opacity-50 transition-opacity duration-200 hover:opacity-80" style={{ color: textColor }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1.75098 10.15C1.75098 5.72999 5.33498 2.14999 9.75598 2.14999H14.122C18.612 2.14999 22.251 5.78999 22.251 10.28C22.251 13.24 20.644 15.96 18.055 17.39L10.001 21.85V18.16H9.93398C5.44398 18.26 1.75098 14.65 1.75098 10.15ZM9.75598 4.14999C6.43898 4.14999 3.75098 6.83999 3.75098 10.15C3.75098 13.52 6.52098 16.23 9.88898 16.16L10.24 16.15H12.001V18.45L17.088 15.64C19.039 14.56 20.251 12.51 20.251 10.28C20.251 6.88999 17.507 4.14999 14.122 4.14999H9.75598Z" />
            </svg>
          </button>
          <button className="flex cursor-pointer items-center justify-center rounded-[6px] border-none bg-none p-1.5 opacity-50 transition-opacity duration-200 hover:opacity-80" style={{ color: textColor }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.59L17.7 8.29L16.29 9.71L13 6.41V16H11V6.41L7.7 9.71L6.29 8.29L12 2.59ZM21 15L20.98 18.51C20.98 19.89 19.86 21 18.48 21H5.5C4.11 21 3 19.88 3 18.5V15H5V18.5C5 18.78 5.22 19 5.5 19H18.48C18.76 19 18.98 18.78 18.98 18.5L19 15H21Z" />
            </svg>
          </button>
          <button className="flex cursor-pointer items-center justify-center rounded-[6px] border-none bg-none p-1.5 opacity-50 transition-opacity duration-200 hover:opacity-80" style={{ color: textColor }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 16L7.5 11L8.9 9.55L11.5 12.15V4H13.5V12.15L16.1 9.55L17.5 11L12.5 16ZM6.5 20C5.95 20 5.47917 19.8042 5.0875 19.4125C4.69583 19.0208 4.5 18.55 4.5 18V15H6.5V18H18.5V15H20.5V18C20.5 18.55 20.3042 19.0208 19.9125 19.4125C19.5208 19.8042 19.05 20 18.5 20H6.5Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Odds Display */}
      <div className="mb-6 flex items-center justify-between">
        {config.marketType === 'binary' ? (
          <>
            <div className="flex flex-nowrap items-center gap-3">
              <div className="flex shrink-0 items-center gap-2.5">
                <span
                  className="text-5xl font-semibold leading-none tracking-[-1px]"
                  style={{
                    color: config.currentOdds === 0 ? '#cccccc' : textColor
                  }}
                >
                  {config.currentOdds === 0 ? '<1' : Math.min(config.currentOdds, 99)}%
                </span>
                <span className="mt-0.5 whitespace-nowrap text-lg font-normal text-text-muted">chance</span>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-base font-semibold"
                style={{
                  color: isPositive ? chartColor : '#D91616',
                }}
              >
                {isPositive ? '▲' : '▼'} {Math.abs(changeValue).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center">
              <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">
                <svg width="55" height="16" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#28CC95]">
                  <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </>
        ) : config.marketType === 'forecast' ? (
          <>
            <div className="flex flex-nowrap items-center gap-3">
              <div className="flex shrink-0 items-center gap-2.5">
                <span
                  className="text-5xl font-semibold leading-none tracking-[-1px]"
                  style={{
                    color: textColor
                  }}
                >
                  {formatNumberWithUnit(config.forecastValue ?? 128000, config.forecastUnit || 'K')}
                </span>
                <span className="mt-0.5 whitespace-nowrap text-lg font-normal text-text-muted">forecast</span>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-base font-semibold"
                style={{
                  color: isPositive ? chartColor : '#D91616',
                }}
              >
                {isPositive ? '▲' : '▼'} {Math.abs(changeValue).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center">
              <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">
                <svg width="55" height="16" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#28CC95]">
                  <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-4">
              {config.outcomes.map((outcome) => (
                <div key={outcome.id} className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: adjustOutcomeColor(outcome.color, isDark),
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                    {outcome.name}
                  </span>
                  <span className="text-base font-semibold" style={{ color: textColor }}>
                    {outcome.currentOdds === 0 ? '1' : Math.min(outcome.currentOdds, 99)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">
                <svg width="55" height="16" viewBox="0 0 772 226" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#28CC95]">
                  <path d="M255.677 58.1911C210.683 58.1911 183.381 78.5114 181.206 113.922H228.062C229.924 100.374 238.611 93.2917 253.814 93.2917C269.018 93.2917 277.396 100.064 277.088 110.842C276.775 119.156 271.501 122.852 258.16 124.7L238.923 127.164C195.484 132.398 175.002 148.717 175.002 177.967C175.002 207.218 195.48 226 229.611 226C251.331 226 267.776 218.302 278.017 203.522V222.61H326.422V117.924C326.422 78.5114 302.532 58.1911 255.677 58.1911ZM245.44 192.437C231.478 192.437 223.72 186.281 223.72 174.887C223.72 164.109 230.545 158.875 249.473 156.105L258.16 154.873C265.845 153.8 272.17 152.274 277.396 150.131V166.267C277.396 181.663 264.368 192.437 245.44 192.437ZM343.488 3.38607H393.135V222.61H343.488V3.38607ZM105.23 105.628L179.66 222.61H115.118L54.3009 121.934V222.61H0V3.38607H54.3009V99.102L119.464 3.38607H177.489L105.23 105.628ZM716.145 26.1705C716.145 12.0062 728.557 0 744.073 0C759.588 0 772 12.0062 772 26.1705C772 40.3347 759.588 52.3409 744.073 52.3409C728.557 52.3409 716.145 40.6407 716.145 26.1705ZM544.868 172.423C544.868 208.446 518.494 225.996 474.743 225.996C430.991 225.996 403.997 206.908 402.447 172.113H448.369C450.232 185.351 456.435 192.743 474.434 192.743C489.95 192.743 497.395 186.587 497.395 177.347C497.395 168.107 488.396 163.489 465.747 160.107C422.616 154.257 405.242 141.631 405.242 109.304C405.242 75.1293 436.582 58.1911 471.643 58.1911C509.186 58.1911 536.493 71.4293 540.218 108.688H495.225C493.054 96.9877 486.225 91.1376 471.951 91.1376C458.61 91.1376 451.161 97.2937 451.161 105.608C451.161 114.844 458.61 118.23 480.638 121.31C523.148 127.16 544.868 137.934 544.868 172.423ZM719.249 61.5771H768.896V222.61H719.249V61.5771ZM702.183 115.77V222.61H652.536V124.39C652.536 107.146 645.399 98.2197 629.884 98.2197C614.368 98.2197 603.51 108.072 603.51 127.47V222.61H553.863V3.38607H603.51V85.5617C611.32 70.1734 627.761 58.1911 651.603 58.1911C681.393 58.1911 702.179 76.9734 702.179 115.766L702.183 115.77Z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <div className="mb-4 h-[300px] w-full">
        <ParentSize>
          {({ width, height }) => {
            if (width === 0 || height === 0) return null;

            const margin = { top: 10, right: 50, left: 15, bottom: 30 };

            const xScale = scaleLinear<number>({
              domain: [0, data.length - 1],
              range: [margin.left, width - margin.right],
            });

            const yScale = scaleLinear<number>({
              domain: yAxisDomain,
              range: [height - margin.bottom, margin.top],
            });

            const innerWidth = width - margin.left - margin.right;

            // Map tick labels to data indices for axis rendering
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
                    fontSize: 13,
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
                    fontSize: 13,
                    textAnchor: 'start' as const,
                    dx: 8,
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
                      strokeWidth={2.5}
                      curve={curveLinear}
                    />
                    {data.length > 0 && (() => {
                      const lastIdx = data.length - 1;
                      return (
                        <circle
                          cx={xScale(lastIdx) ?? 0}
                          cy={yScale(data[lastIdx].value) ?? 0}
                          r={5}
                          fill={chartColor}
                          stroke={chartColor}
                          strokeWidth={3}
                        />
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {config.outcomes.map((outcome) => {
                      const color = adjustOutcomeColor(outcome.color, isDark);
                      return (
                        <g key={outcome.id}>
                          <LinePath
                            data={data}
                            x={(_d, i) => xScale(i) ?? 0}
                            y={d => yScale(d[`value_${outcome.id}`] as number) ?? 0}
                            stroke={color}
                            strokeWidth={2.5}
                            curve={curveLinear}
                          />
                          {data.length > 0 && (() => {
                            const lastIdx = data.length - 1;
                            return (
                              <circle
                                cx={xScale(lastIdx) ?? 0}
                                cy={yScale(data[lastIdx][`value_${outcome.id}`] as number) ?? 0}
                                r={5}
                                fill={color}
                                stroke={color}
                                strokeWidth={3}
                              />
                            );
                          })()}
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            );
          }}
        </ParentSize>
      </div>

      {/* Volume and Timeframes */}
      <div className="flex items-center justify-between pt-1">
        <div className="inline-block whitespace-nowrap text-sm font-medium" style={{ color: secondaryTextColor }}>
          {formatVolume(config.volume)}
        </div>
        <div className="flex gap-1.5">
          {['6H', '1D', '1W', '1M', 'ALL'].map((tf) => (
            <button
              key={tf}
              className="cursor-pointer rounded-[6px] border-none bg-none px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-all duration-150 hover:bg-gray-50"
              onClick={() => onTimeHorizonChange?.(tf)}
              style={{
                color: config.timeHorizon === tf ? textColor : secondaryTextColor,
                backgroundColor: config.timeHorizon === tf ? (isDark ? '#1a1a1a' : '#f3f4f6') : 'transparent',
                fontWeight: config.timeHorizon === tf ? '600' : '500',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Watermark */}
      {config.showWatermark && (
        <div
          className="text-center pt-2 pb-3 text-[11px] font-normal tracking-wide"
          style={{
            color: isDark ? 'rgba(156, 163, 175, 0.4)' : '#9ca3af',
          }}
        >
          kalshi.tools
        </div>
      )}
    </div>
  );
}
