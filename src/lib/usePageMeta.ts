import { useEffect } from 'react';
import { useSite } from '../app/SiteProvider';

export interface PageMetaOptions {
  type?: 'website' | 'article' | 'profile';
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  sectionName?: string;
  noIndex?: boolean;
}

export function usePageMeta(
  title?: string,
  description?: string,
  image?: string,
  options?: PageMetaOptions,
) {
  const { siteName, data } = useSite();

  useEffect(() => {
    const previousTitle = document.title;
    const changes: (() => void)[] = [];
    const pageTitle = title ? `${title} | ${siteName}` : `${siteName} — ${data.settings.tagline}`;
    document.title = pageTitle;

    function meta(key: string, content: string, property = false) {
      const attribute = property ? 'property' : 'name';
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      const existing = element;
      const old = element?.content;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = content;
      changes.push(() => {
        if (existing) existing.content = old || '';
        else element?.remove();
      });
    }

    // Standard SEO
    const metaDescription =
      description ||
      data.settings.description ||
      'Aquaculture, fisheries and aquatic knowledge in Bangladesh and beyond.';
    meta('description', metaDescription);
    meta(
      'robots',
      options?.noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );

    // OpenGraph
    meta('og:title', pageTitle, true);
    meta('og:description', metaDescription, true);
    meta('og:url', window.location.href, true);
    meta('og:type', options?.type || 'website', true);
    meta('og:site_name', siteName, true);

    const fullImageUrl = image
      ? new URL(image, window.location.origin).href
      : new URL('/assets/logo.png', window.location.origin).href;

    meta('og:image', fullImageUrl, true);

    // Twitter Cards
    meta('twitter:card', 'summary_large_image');
    meta('twitter:title', pageTitle);
    meta('twitter:description', metaDescription);
    meta('twitter:image', fullImageUrl);

    // Canonical Link
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const createdCanonical = !canonical;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const oldCanonicalHref = canonical.href;
    canonical.href = window.location.origin + window.location.pathname;

    // JSON-LD Structured Data for Articles / News
    let jsonLdScript: HTMLScriptElement | null = null;
    if (options?.type === 'article') {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.id = 'article-structured-data';
      jsonLdScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title || pageTitle,
        description: metaDescription,
        image: fullImageUrl,
        datePublished: options.publishedAt || new Date().toISOString(),
        dateModified: options.updatedAt || options.publishedAt || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: options.authorName || 'Aqua Info Editorial Team',
        },
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: siteName,
          logo: {
            '@type': 'ImageObject',
            url: new URL('/assets/logo.png', window.location.origin).href,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': window.location.href,
        },
      });
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = previousTitle;
      if (createdCanonical) canonical?.remove();
      else if (canonical) canonical.href = oldCanonicalHref;
      if (jsonLdScript) jsonLdScript.remove();
      changes.forEach((restore) => restore());
    };
  }, [
    title,
    description,
    image,
    siteName,
    data.settings.tagline,
    data.settings.description,
    options?.type,
    options?.publishedAt,
    options?.updatedAt,
    options?.authorName,
    options?.sectionName,
    options?.noIndex,
  ]);
}
