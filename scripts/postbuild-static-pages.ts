import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildStructuredData,
  bracketRenderSeoPage,
  defaultOgImagePath,
  getAbsoluteUrl,
  notFoundSeoPage,
  overlayViewerSeoPage,
  seoPages,
  SeoPage,
  siteName,
} from '../src/seo/routes';

function replaceTag(html: string, pattern: RegExp, replacement: string) {
  if (!pattern.test(html)) {
    throw new Error(`Unable to find expected tag for pattern: ${pattern}`);
  }

  return html.replace(pattern, replacement);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildNoscriptContent(page: SeoPage) {
  if (!page.content) {
    return '';
  }

  const otherLinks = Object.values(seoPages)
    .filter((entry) => entry.indexable && entry.path !== page.path)
    .map((entry) => `<li><a href="${escapeHtml(entry.path)}">${escapeHtml(entry.title)}</a></li>`)
    .join('');

  const sections = page.content.sections
    .map((section) => {
      const paragraphs = section.paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');
      const bullets = section.bullets?.length
        ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
        : '';

      return `<section><h2>${escapeHtml(section.title)}</h2>${paragraphs}${bullets}</section>`;
    })
    .join('');

  const faqs = page.content.faqs?.length
    ? `<section><h2>Frequently asked questions</h2>${page.content.faqs
        .map(
          (faq) =>
            `<article><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`,
        )
        .join('')}</section>`
    : '';

  return [
    '<noscript>',
    '<section style="max-width:960px;margin:0 auto;padding:32px 24px;font-family:Inter,Arial,sans-serif;color:#111827;line-height:1.6;">',
    `<h1>${escapeHtml(page.content.heading)}</h1>`,
    `<p>${escapeHtml(page.content.intro)}</p>`,
    sections,
    faqs,
    otherLinks ? `<section><h2>Related tools</h2><ul>${otherLinks}</ul></section>` : '',
    '</section>',
    '</noscript>',
  ].join('');
}

function applySeoToHtml(html: string, page: SeoPage) {
  const canonicalUrl = getAbsoluteUrl(page.path === '/404' ? '/' : page.path);
  const ogImageUrl = getAbsoluteUrl(defaultOgImagePath);
  const robotsContent = page.indexable ? 'index, follow' : 'noindex, nofollow';
  const structuredData = JSON.stringify(buildStructuredData(page));

  let nextHtml = html;
  nextHtml = replaceTag(nextHtml, /<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`);
  nextHtml = replaceTag(
    nextHtml,
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${page.description}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<meta name="robots" content="[^"]*" \/>/,
    `<meta name="robots" content="${robotsContent}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<meta property="og:site_name" content="[^"]*" \/>/,
    `<meta property="og:site_name" content="${siteName}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${page.title}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${page.description}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${ogImageUrl}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${page.title}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${page.description}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${ogImageUrl}" />`,
  );
  nextHtml = replaceTag(
    nextHtml,
    /<script id="seo-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="seo-structured-data" type="application/ld+json">${structuredData}</script>`,
  );
  nextHtml = nextHtml.replace(
    '</body>',
    `${buildNoscriptContent(page)}\n  </body>`,
  );

  return nextHtml;
}

async function main() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const baseHtml = await readFile(path.join(distDir, 'index.html'), 'utf8');

  await writeFile(path.join(distDir, 'index.html'), applySeoToHtml(baseHtml, seoPages['/']), 'utf8');

  for (const page of Object.values(seoPages)) {
    if (!page.indexable || page.path === '/') {
      continue;
    }

    const routeDir = path.join(distDir, page.path.slice(1));
    await mkdir(routeDir, { recursive: true });
    await writeFile(path.join(routeDir, 'index.html'), applySeoToHtml(baseHtml, page), 'utf8');
  }

  const utilityPages = [
    { page: overlayViewerSeoPage, outputDir: path.join(distDir, 'overlay', 'index.html') },
    { page: bracketRenderSeoPage, outputDir: path.join(distDir, 'bracket', 'render', 'index.html') },
  ];

  for (const entry of utilityPages) {
    await mkdir(path.dirname(entry.outputDir), { recursive: true });
    await writeFile(entry.outputDir, applySeoToHtml(baseHtml, entry.page), 'utf8');
  }

  await writeFile(path.join(distDir, '404.html'), applySeoToHtml(baseHtml, notFoundSeoPage), 'utf8');
}

main().catch((error) => {
  console.error('Failed to create route-specific HTML files');
  console.error(error);
  process.exit(1);
});
