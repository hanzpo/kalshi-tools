/** Shared Tailwind class strings for builder page layouts */
export const layout = {
  /** Main page wrapper: dark bg, padding, flex-grows to fill space */
  app: 'flex-1 bg-dark px-6 pt-12 pb-20 font-sans text-text-primary max-lg:px-5 max-lg:pt-8 max-lg:pb-16 max-md:px-4 max-md:pt-5 max-md:pb-10',
  /** Two-column grid container (controls left, preview right) */
  appContainer: 'mx-auto grid w-[min(1200px,100%)] grid-cols-[minmax(320px,400px)_1fr] items-start gap-8 max-lg:grid-cols-[1fr] max-lg:gap-6 max-md:gap-5',
  /** Right-side preview column: sticky on desktop */
  previewSection: 'sticky top-6 flex w-full flex-col items-stretch gap-5 self-start max-lg:static [&>*]:w-full',
  /** Attribution block below preview */
  attribution: 'mt-5 text-center [&_p]:text-sm [&_p]:text-text-secondary [&_a]:font-medium [&_a]:text-brand [&_a]:no-underline hover:[&_a]:underline',
} as const;
