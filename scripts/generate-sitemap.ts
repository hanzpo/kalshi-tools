import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getAbsoluteUrl, seoPages } from '../src/seo/routes';

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = Object.values(seoPages)
    .filter((page) => page.indexable)
    .map((page) => {
      const priority = page.path === '/' ? '1.0' : '0.8';
      return [
        '  <url>',
        `    <loc>${getAbsoluteUrl(page.path)}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  const publicDir = path.resolve(process.cwd(), 'public');
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
}

main().catch((error) => {
  console.error('Failed to generate sitemap.xml');
  console.error(error);
  process.exit(1);
});
