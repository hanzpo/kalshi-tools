import { DataPoint, TimeHorizon } from '../types';

const DATES_COUNT = 6;

function getDateRangeForTimeHorizon(
  timeHorizon: TimeHorizon,
  customEndDate?: Date
): { startDate: Date; endDate: Date } {
  const endDate = customEndDate ? new Date(customEndDate) : new Date();
  let startDate: Date;
  
  switch (timeHorizon) {
    case '6H':
      startDate = new Date(endDate.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
      break;
    case '1D':
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      break;
    case '1W':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
      break;
    case '1M':
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 1 month ago
      break;
    case 'ALL':
    default:
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // 3 months ago
      break;
  }
  
  return { startDate, endDate };
}

function generateDates(startDate: Date, endDate: Date, timeHorizon: TimeHorizon): string[] {
  const dates: string[] = [];
  
  // Calculate total milliseconds in the range
  const totalMs = endDate.getTime() - startDate.getTime();
  
  for (let i = 0; i < DATES_COUNT; i++) {
    const date = new Date(startDate.getTime() + (totalMs * i / (DATES_COUNT - 1)));
    
    // Format dates based on time horizon
    let formattedDate: string;
    switch (timeHorizon) {
      case '6H':
        formattedDate = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: true 
        });
        break;
      case '1D':
        formattedDate = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        break;
      case '1W':
        formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'short',
          day: 'numeric' 
        });
        break;
      case '1M':
        formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        break;
      case 'ALL':
      default:
        formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        break;
    }
    
    dates.push(formattedDate);
  }
  
  return dates;
}

function normalRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function applyMonteCarloToTrend(
  customTrend: number[],
  targetValue: number,
  volatility: number,
  startDate: Date,
  endDate: Date,
  timeHorizon: TimeHorizon,
  mode: 'forecast' | 'odds'
): DataPoint[] {
  const data: number[] = [];

  const lastValue = customTrend[customTrend.length - 1];
  const firstValue = customTrend[0];
  const scaleFactor = lastValue !== firstValue ? (targetValue - firstValue) / (lastValue - firstValue) : 1;

  for (let i = 0; i < customTrend.length; i++) {
    let scaledValue: number;

    if (i === 0) {
      scaledValue = customTrend[0];
    } else if (i === customTrend.length - 1) {
      scaledValue = targetValue;
    } else {
      scaledValue = firstValue + (customTrend[i] - firstValue) * scaleFactor;
    }

    const noise = mode === 'forecast'
      ? normalRandom() * targetValue * 0.05 * volatility
      : normalRandom() * 1.5 * volatility;
    let noisyValue = scaledValue + noise;

    noisyValue = mode === 'odds'
      ? Math.max(0, Math.min(100, noisyValue))
      : Math.max(0, noisyValue);
    data.push(noisyValue);
  }

  data[data.length - 1] = targetValue;

  const dates = generateDates(startDate, endDate, timeHorizon);
  const steps = Math.max(data.length - 1, 1);
  return data.map((value, i) => {
    const rawIndex = (i / steps) * (DATES_COUNT - 1);
    const dateIndex = Math.min(Math.floor(rawIndex), DATES_COUNT - 1);
    return {
      time: dates[Math.min(dateIndex, dates.length - 1)],
      value: Math.round(value * 10) / 10,
    };
  });
}

export function generateForecastData(
  targetValue: number,
  volatility: number = 1.5,
  customTrendData: number[] | null = null,
  startDate: Date = new Date(new Date().setMonth(new Date().getMonth() - 3)),
  endDate: Date = new Date(),
  timeHorizon: TimeHorizon = 'ALL'
): DataPoint[] {
  // Always use custom trend (or default if none provided)
  if (customTrendData && customTrendData.length > 0) {
    return applyMonteCarloToTrend(customTrendData, targetValue, volatility, startDate, endDate, timeHorizon, 'forecast');
  }
  
  // If no custom data, return empty data (should not happen in normal flow)
  return [];
}

export function generateMarketData(
  targetOdds: number,
  volatility: number = 1.5,
  customTrendData: number[] | null = null,
  startDate: Date = new Date(new Date().setMonth(new Date().getMonth() - 3)),
  endDate: Date = new Date(),
  timeHorizon: TimeHorizon = 'ALL'
): DataPoint[] {
  // Always use custom trend (or default if none provided)
  if (customTrendData && customTrendData.length > 0) {
    return applyMonteCarloToTrend(customTrendData, targetOdds, volatility, startDate, endDate, timeHorizon, 'odds');
  }
  
  // If no custom data, return empty data (should not happen in normal flow)
  return [];
}

export function generateVolume(): number {
  const min = 100000;
  const max = 10000000;
  return Math.floor(Math.random() * (max - min) + min);
}

export { getDateRangeForTimeHorizon };

export function generateDateLabels(startDate: Date, endDate: Date, timeHorizon: TimeHorizon): string[] {
  return generateDates(startDate, endDate, timeHorizon);
}

export function formatVolume(volume: number): string {
  return `$${volume.toLocaleString()} vol`;
}

export function generateChange(data: DataPoint[]): string {
  if (data.length < 2) return '+0';
  
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const change = last - first;
  const sign = change >= 0 ? '+' : '';
  
  return `${sign}${change.toFixed(1)}`;
}
