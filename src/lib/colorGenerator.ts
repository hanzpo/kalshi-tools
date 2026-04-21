const OUTCOME_COLORS = ['#2AD39C', '#4B73FF', '#191919'];

function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 65 + Math.floor(Math.random() * 20); // 65-85%
  const lightness = 45 + Math.floor(Math.random() * 15); // 45-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getOutcomeColor(index: number): string {
  if (index < OUTCOME_COLORS.length) {
    return OUTCOME_COLORS[index];
  }
  return generateRandomColor();
}
