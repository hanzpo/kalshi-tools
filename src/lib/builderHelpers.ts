/**
 * Shared helper functions for ChartBuilder and SearchBuilder
 */

export function getDefaultStartDate(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date;
}

export function createFileName(title: string): string {
  const safeName = title.slice(0, 50).replace(/[^a-z0-9]/gi, '-') || 'kalshi-chart';
  return `${safeName}.png`;
}

export function generateDefaultTrend(targetOdds: number): number[] {
  const defaultTrend: number[] = [];
  let currentValue = 40 + Math.random() * 20;

  for (let i = 0; i < 100; i++) {
    const drift = ((targetOdds - currentValue) / (100 - i)) * 0.2;
    const randomStep = (Math.random() - 0.5) * 8;
    currentValue += drift + randomStep;
    currentValue = Math.max(0, Math.min(100, currentValue));
    defaultTrend.push(currentValue);
  }

  defaultTrend[99] = targetOdds;
  return defaultTrend;
}

export function generateDefaultForecastTrend(targetValue: number): number[] {
  const defaultTrend: number[] = [];
  // Start from a value that's somewhat below the target
  const startValue = targetValue * (0.7 + Math.random() * 0.2);
  let currentValue = startValue;

  for (let i = 0; i < 100; i++) {
    const drift = ((targetValue - currentValue) / (100 - i)) * 0.2;
    const randomStep = (Math.random() - 0.5) * (targetValue * 0.1); // Scale noise to target value
    currentValue += drift + randomStep;
    currentValue = Math.max(0, currentValue); // Only enforce minimum, no maximum
    defaultTrend.push(currentValue);
  }

  defaultTrend[99] = targetValue;
  return defaultTrend;
}
