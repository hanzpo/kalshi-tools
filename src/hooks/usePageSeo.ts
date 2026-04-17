import { useEffect } from 'react';
import { buildStructuredData, defaultOgImagePath, getAbsoluteUrl, SeoPage, siteName } from '../seo/routes';

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let tag = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (!tag) {
    tag = document.createElement('link');
    tag.rel = 'canonical';
    document.head.appendChild(tag);
  }

  tag.href = href;
}

export function usePageSeo(page: SeoPage) {
  useEffect(() => {
    const canonicalUrl = getAbsoluteUrl(page.path === '/404' ? '/' : page.path);
    const ogImageUrl = getAbsoluteUrl(defaultOgImagePath);
    const robotsContent = page.indexable ? 'index, follow' : 'noindex, nofollow';

    document.title = page.title;

    upsertCanonical(canonicalUrl);
    upsertMetaTag('name', 'description', page.description);
    upsertMetaTag('name', 'robots', robotsContent);
    upsertMetaTag('property', 'og:type', 'website');
    upsertMetaTag('property', 'og:site_name', siteName);
    upsertMetaTag('property', 'og:locale', 'en_US');
    upsertMetaTag('property', 'og:title', page.title);
    upsertMetaTag('property', 'og:description', page.description);
    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertMetaTag('property', 'og:image', ogImageUrl);
    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', page.title);
    upsertMetaTag('name', 'twitter:description', page.description);
    upsertMetaTag('name', 'twitter:image', ogImageUrl);

    let structuredDataTag = document.head.querySelector('#seo-structured-data') as HTMLScriptElement | null;
    if (!structuredDataTag) {
      structuredDataTag = document.createElement('script');
      structuredDataTag.id = 'seo-structured-data';
      structuredDataTag.type = 'application/ld+json';
      document.head.appendChild(structuredDataTag);
    }

    structuredDataTag.textContent = JSON.stringify(buildStructuredData(page));
  }, [page]);
}
