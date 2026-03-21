export type BannerVariant = 'classic' | 'horizontal' | 'horizontal-dark';

export interface BannerConfig {
  title: string;
  image: string | null;
  outcome: string;
  tradeSide: 'Yes' | 'No';
  odds: number;
  trendDirection: 'up' | 'down';
  change: string;
  variant: BannerVariant;
  cardWidth: number;
  cardHeight: number;
  cardBorderRadius: number;
}
