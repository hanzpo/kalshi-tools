export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type SeoContent = {
  heading: string;
  intro: string;
  sections: SeoSection[];
  faqs?: SeoFaq[];
};

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  indexable: boolean;
  content?: SeoContent;
};

export const siteName = 'Kalshi Tools';
export const siteUrl = 'https://kalshi.tools';
export const defaultOgImagePath = '/og-image.png';

export const seoPages: Record<string, SeoPage> = {
  '/': {
    path: '/',
    title: 'Kalshi Tools | Chart, Trade Slip, Market Page, and Banner Generators',
    description:
      'Create realistic Kalshi-style charts, trade slips, market pages, banners, brackets, and social graphics for prediction market content.',
    indexable: true,
    content: {
      heading: 'Prediction market design tools built for charts, slips, and shareable graphics',
      intro:
        'Kalshi Tools gives creators, traders, analysts, and social accounts a fast way to make realistic prediction market visuals without rebuilding the same layout from scratch each time.',
      sections: [
        {
          title: 'What you can make',
          paragraphs: [
            'The app includes dedicated builders for chart screenshots, trade slips, full market pages, banners, bracket graphics, search cards, and link previews.',
            'Each tool is optimized for exporting clean PNG assets that are ready for X posts, Discord updates, livestream overlays, article embeds, and internal mocks.',
          ],
        },
        {
          title: 'Why these pages are useful',
          paragraphs: [
            'Most prediction market content workflows need speed, consistency, and enough control to match a real market state. These tools focus on that practical use case rather than generic design software features.',
          ],
          bullets: [
            'Build realistic market visuals without opening Figma or Photoshop',
            'Export graphics sized for social posts, thumbnails, and community updates',
            'Mock market ideas before publishing or sharing them with a team',
          ],
        },
      ],
      faqs: [
        {
          question: 'What is Kalshi Tools used for?',
          answer:
            'Kalshi Tools is used to generate prediction market visuals such as charts, trade slips, market pages, banners, and brackets for content, analysis, and social sharing.',
        },
        {
          question: 'Do I need a design tool to use these generators?',
          answer:
            'No. The builders are made to handle the common layout, typography, and export flow directly in the browser so you can produce images without a separate design workflow.',
        },
        {
          question: 'Which pages are best for search visitors?',
          answer:
            'The chart, trade slip, market page, banner, link preview, search card, and bracket builders are the main indexable pages because they target distinct use cases and search intent.',
        },
      ],
    },
  },
  '/chart': {
    path: '/chart',
    title: 'Kalshi Chart Generator | Create Prediction Market Chart Images',
    description:
      'Create realistic Kalshi-style chart images with binary or multi-outcome markets, custom trend drawing, volume controls, and PNG export.',
    indexable: true,
    content: {
      heading: 'Kalshi chart generator for realistic prediction market screenshots',
      intro:
        'Use the chart builder to create shareable prediction market chart graphics with custom titles, odds, volume, outcomes, and trend data.',
      sections: [
        {
          title: 'What the chart builder does',
          paragraphs: [
            'The chart generator is designed for realistic market chart screenshots rather than generic financial charts. It supports binary, forecast, and multi-outcome layouts so you can match the market format you need.',
          ],
          bullets: [
            'Edit market title, odds, volume, labels, and time range',
            'Draw custom price movement instead of relying on random data',
            'Export clean PNGs for posts, threads, and recap graphics',
          ],
        },
        {
          title: 'Best use cases',
          paragraphs: [
            'This page works well for commentary posts, strategy explainers, market recaps, newsletter graphics, and quick mockups before a live market goes up.',
          ],
        },
      ],
      faqs: [
        {
          question: 'Can I make a realistic Kalshi chart image?',
          answer:
            'Yes. The chart builder is specifically made to generate realistic Kalshi-style chart screenshots with adjustable outcomes, odds, and trend lines.',
        },
        {
          question: 'Can I create multi-outcome prediction market charts?',
          answer:
            'Yes. The chart page supports multi-outcome configurations in addition to binary and forecast market styles.',
        },
        {
          question: 'Can I export the chart as a PNG?',
          answer:
            'Yes. The chart builder includes export and copy actions so the final image can be used in social posts, articles, or chats.',
        },
      ],
    },
  },
  '/trade-slip': {
    path: '/trade-slip',
    title: 'Kalshi Trade Slip Generator | Create Realistic Trade Slip Images',
    description:
      'Build realistic Kalshi-style trade slip images with custom questions, wager amounts, odds, combo legs, and payout calculations.',
    indexable: true,
    content: {
      heading: 'Kalshi trade slip generator for single bets, combos, and payout graphics',
      intro:
        'The trade slip builder lets you mock up realistic betting and prediction market slips with editable questions, sides, wagers, and payout states.',
      sections: [
        {
          title: 'What you can customize',
          paragraphs: [
            'You can build single slips, combo tickets, and more stylized championship layouts depending on the kind of post or mockup you need to produce.',
          ],
          bullets: [
            'Set wager size, odds, side, market title, and outcome',
            'Create combo legs and grouped card layouts',
            'Show timestamps, payout states, or cashed-out variations',
          ],
        },
        {
          title: 'Where this is useful',
          paragraphs: [
            'Trade slip graphics are useful for announcing positions, recapping results, teasing picks, showing hypothetical plays, or preparing social assets for a market-focused account.',
          ],
        },
      ],
      faqs: [
        {
          question: 'Can I create a Kalshi trade slip image?',
          answer:
            'Yes. The trade slip generator creates realistic trade slip visuals with editable market details, pricing, wagers, and payout information.',
        },
        {
          question: 'Does the trade slip page support combo slips?',
          answer:
            'Yes. The builder supports combo configurations and grouped legs so you can create more complex slip layouts.',
        },
        {
          question: 'Is this useful for mock trades and social posts?',
          answer:
            'Yes. The page is designed for realistic mockups, promotional graphics, and shareable screenshots rather than live order execution.',
        },
      ],
    },
  },
  '/search': {
    path: '/search',
    title: 'Kalshi Search Result Generator | Create Prediction Market Search Cards',
    description:
      'Create Kalshi-style search result graphics and market listing cards for prediction market posts, search mockups, and promotional visuals.',
    indexable: true,
    content: {
      heading: 'Prediction market search card generator for discovery and social previews',
      intro:
        'The search builder creates Kalshi-style search result and listing graphics that look appropriate for product mockups, launch posts, and ranking screenshots.',
      sections: [
        {
          title: 'Why use a search result layout',
          paragraphs: [
            'Search-style cards are useful when you want to show multiple market ideas, announce a discoverable theme, or create visuals that look closer to an in-product browse experience.',
          ],
        },
      ],
      faqs: [
        {
          question: 'What is the search builder for?',
          answer:
            'The search builder is for generating search-style market cards and browse views that can be used in promotional posts, product mockups, or concept visuals.',
        },
      ],
    },
  },
  '/link-preview': {
    path: '/link-preview',
    title: 'Prediction Market Link Preview Generator | Create Social Preview Cards',
    description:
      'Create prediction market link preview cards with charts, images, headlines, and social-friendly layouts for posts and embeds.',
    indexable: true,
    content: {
      heading: 'Link preview generator for prediction market articles, posts, and embeds',
      intro:
        'The link preview builder helps you create shareable social cards that combine a chart, image, and headline into a compact preview format.',
      sections: [
        {
          title: 'Typical use cases',
          paragraphs: [
            'This page is useful for newsletter promos, article graphics, social embeds, research posts, and announcement cards where a standard chart alone is not enough context.',
          ],
          bullets: [
            'Pair a chart with a supporting image',
            'Write a stronger headline for social distribution',
            'Export a preview-sized image for threads and shares',
          ],
        },
      ],
      faqs: [
        {
          question: 'Can I make a social card for a prediction market post?',
          answer:
            'Yes. The link preview generator is made for compact social cards that combine text, visuals, and chart context in a preview-style format.',
        },
      ],
    },
  },
  '/market-page': {
    path: '/market-page',
    title: 'Kalshi Market Page Generator | Create Full Prediction Market Page Images',
    description:
      'Generate realistic Kalshi-style market page screenshots with charts, outcomes, rules, buying panels, and related market sections.',
    indexable: true,
    content: {
      heading: 'Market page generator for full prediction market screenshots',
      intro:
        'The market page builder creates full-page Kalshi-style layouts with the structure people expect from a real market detail page, not just a standalone chart.',
      sections: [
        {
          title: 'What is included in the page layout',
          paragraphs: [
            'You can configure the market question, event status, outcome list, trading panel, chart, rules block, and related markets so the final image feels like a complete product screenshot.',
          ],
          bullets: [
            'Multi-outcome and binary-style market configurations',
            'Rules text, related markets, and sidebar state controls',
            'A more complete visual than a simple chart or banner',
          ],
        },
        {
          title: 'Who this page is for',
          paragraphs: [
            'This builder is useful for product demos, blog posts, launch announcements, market concept testing, and any situation where a full-page market mockup communicates more than a cropped chart.',
          ],
        },
      ],
      faqs: [
        {
          question: 'Can I generate a full Kalshi market page image?',
          answer:
            'Yes. The market page generator is designed to create realistic full-page market screenshots with charts, outcomes, rules, and sidebar states.',
        },
        {
          question: 'Does this page support rules and related markets?',
          answer:
            'Yes. The builder includes controls for rules text, related markets, review states, and other page-level details.',
        },
        {
          question: 'When should I use the market page instead of the chart page?',
          answer:
            'Use the market page when you need a complete product-style screenshot. Use the chart page when a simpler, chart-first graphic is enough.',
        },
      ],
    },
  },
  '/banner': {
    path: '/banner',
    title: 'Kalshi Banner Generator | Create Prediction Market Banner Graphics',
    description:
      'Create shareable Kalshi-style market banners with custom titles, outcome images, positions, odds, and movement indicators.',
    indexable: true,
    content: {
      heading: 'Banner generator for fast prediction market graphics',
      intro:
        'The banner builder is the fastest way to create a compact prediction market graphic when you need something lighter than a full market page or chart.',
      sections: [
        {
          title: 'What banners are good for',
          paragraphs: [
            'Banners work well for social posts, thumbnails, recap images, Discord announcements, and lightweight promotional graphics where speed matters more than detailed market context.',
          ],
          bullets: [
            'Add a title, image, side, odds, and price move',
            'Choose a compact format that reads well in feeds',
            'Export a clean PNG for rapid posting',
          ],
        },
      ],
      faqs: [
        {
          question: 'What is the banner generator best used for?',
          answer:
            'The banner generator is best for small, fast-turnaround graphics such as social posts, recap cards, and thumbnail-style prediction market visuals.',
        },
        {
          question: 'Can I add an outcome image and price movement?',
          answer:
            'Yes. The builder supports custom images, outcome labels, sides, odds, and movement indicators.',
        },
      ],
    },
  },
  '/bracket': {
    path: '/bracket',
    title: 'Prediction Market Bracket Generator | Create Shareable Bracket Images',
    description:
      'Create shareable bracket images for prediction market content, tournament picks, and community contests with export and share links.',
    indexable: true,
    content: {
      heading: 'Bracket generator for tournament picks and prediction market content',
      intro:
        'The bracket builder helps you create clean tournament bracket visuals that can be shared as images or links, making it easier to run community contests and themed prediction content.',
      sections: [
        {
          title: 'What makes this page useful',
          paragraphs: [
            'Unlike a static image editor, the bracket page handles bracket state, randomization, share links, and export in the same workflow so you can move quickly from pick selection to distribution.',
          ],
          bullets: [
            'Build and export a completed bracket image',
            'Share a bracket state with a generated URL',
            'Use it for tournament prediction content and community games',
          ],
        },
      ],
      faqs: [
        {
          question: 'Can I create a shareable bracket image?',
          answer:
            'Yes. The bracket page supports both image export and shareable URLs so bracket states can be distributed easily.',
        },
        {
          question: 'Is the bracket page only for one tournament format?',
          answer:
            'No. The current implementation is optimized for the included college basketball bracket flow, but the page is broadly useful for bracket-style prediction content.',
        },
      ],
    },
  },
};

export const overlayEditorSeoPage: SeoPage = {
  path: '/overlay',
  title: 'Kalshi OBS Overlay Builder | Editor',
  description: 'Build and configure live OBS overlays for prediction market streams and broadcasts.',
  indexable: false,
};

export const overlayViewerSeoPage: SeoPage = {
  path: '/overlay',
  title: 'Kalshi OBS Overlay Viewer',
  description: 'Overlay output for live prediction market broadcasts.',
  indexable: false,
};

export const bracketRenderSeoPage: SeoPage = {
  path: '/bracket/render',
  title: 'Bracket Render Output',
  description: 'Rendered bracket output.',
  indexable: false,
};

export const notFoundSeoPage: SeoPage = {
  path: '/404',
  title: 'Page Not Found | Kalshi Tools',
  description: 'The requested Kalshi Tools page could not be found.',
  indexable: false,
};

export function getAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function resolveSeoPage(pathname: string, isOverlayEditMode: boolean) {
  if (pathname === '/overlay') {
    return isOverlayEditMode ? overlayEditorSeoPage : overlayViewerSeoPage;
  }

  if (pathname === '/bracket/render') {
    return bracketRenderSeoPage;
  }

  return seoPages[pathname] ?? notFoundSeoPage;
}

export function buildStructuredData(page: SeoPage) {
  const pageUrl = getAbsoluteUrl(page.path === '/404' ? '/' : page.path);

  if (page.path === '/') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        description: page.description,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Kalshi Tools Pages',
        itemListElement: Object.values(seoPages)
          .filter((entry) => entry.path !== '/')
          .map((entry, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: entry.title,
            url: getAbsoluteUrl(entry.path),
          })),
      },
    ];
  }

  const graph: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: page.title,
      applicationCategory: 'FinancialApplication',
      operatingSystem: 'Web',
      url: pageUrl,
      description: page.description,
      isAccessibleForFree: true,
      creator: {
        '@type': 'Person',
        name: 'Hanz Po',
        url: 'https://x.com/hanzpo',
      },
    },
  ];

  if (page.path !== '/404' && page.path !== '/overlay' && page.path !== '/bracket/render') {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: siteName,
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.title,
          item: pageUrl,
        },
      ],
    });
  }

  if (page.content?.faqs?.length) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.content.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return graph;
}
