/**
 * domParser.ts
 * Cheerio HTML extraction, JSON-LD schema parsing, tech signal detection, and navigation link discovery.
 */

import * as cheerio from 'cheerio';
import { cleanText, extractMarkdownLinks } from './markdownChunker';
import type { HeadingsMap, NavigationLink, ParsedPage, TechSignals } from './types';

export const SKIP_PATH_REGEX =
  /^\/(?:_next|static|assets|images?|img|fonts?|icons?|api|cdn-cgi|login|signin|signup|register|auth|logout|cart|checkout|account|dashboard|admin|wp-admin)(?:\/|$)|\.(?:css|js|mjs|map|json|xml|ico|png|jpe?g|gif|svg|webp|woff2?|ttf|mp4|mp3|pdf|zip)(?:\?|$)/i;

export const MIN_HEADER_NAV_LINKS = 4;
const DEFAULT_MAX_SUBPAGES = 5;

/**
 * Extracts email addresses and phone numbers from links and attributes.
 */
export const extractContactSignals = ($: cheerio.CheerioAPI): { emails: Set<string>; phones: Set<string> } => {
  const emails = new Set<string>();
  const phones = new Set<string>();

  $('a[href^="mailto:"]').each((_, el) => {
    const mail = ($(el).attr('href') || '').replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase();
    if (mail && mail.includes('@')) emails.add(mail);
  });

  $('a[href^="tel:"]').each((_, el) => {
    const tel = ($(el).attr('href') || '').replace(/^tel:/i, '').trim();
    if (tel) phones.add(tel);
  });

  // Also check body text regex for phone/email if none found
  const bodyText = $('body').text();
  const mailMatches = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  for (const m of mailMatches.slice(0, 5)) {
    if (!m.endsWith('.png') && !m.endsWith('.jpg') && !m.endsWith('.svg')) {
      emails.add(m.toLowerCase());
    }
  }

  return { emails, phones };
};

/**
 * Parses application/ld+json script blocks and extracts structured metadata,
 * emails, phone numbers, and summary lines.
 */
export const parseJsonLd = (
  $: cheerio.CheerioAPI,
  emails: Set<string> = new Set(),
  phones: Set<string> = new Set()
): { jsonLdLines: string[]; rawSchemas: Record<string, unknown>[] } => {
  const jsonLdLines: string[] = [];
  const rawSchemas: Record<string, unknown>[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const rawJson = $(el).text().trim();
    if (!rawJson) return;

    try {
      const parsed = JSON.parse(rawJson);
      const visit = (node: unknown) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
          node.forEach(visit);
          return;
        }

        const obj = node as Record<string, unknown>;
        rawSchemas.push(obj);

        if (Array.isArray(obj['@graph'])) {
          obj['@graph'].forEach(visit);
        }
        if (obj.contactPoint) {
          visit(obj.contactPoint);
        }

        if (typeof obj.email === 'string') {
          emails.add(obj.email.replace(/^mailto:/i, '').trim().toLowerCase());
        }
        if (typeof obj.telephone === 'string') {
          phones.add(obj.telephone.replace(/^tel:/i, '').trim());
        }

        const typeStr = typeof obj['@type'] === 'string' ? obj['@type'] : '';
        const nameStr = typeof obj.name === 'string' ? obj.name : '';
        const descStr = typeof obj.description === 'string' ? obj.description : '';
        const mailStr = typeof obj.email === 'string' ? obj.email : '';
        const telStr = typeof obj.telephone === 'string' ? obj.telephone : '';

        const summary = [typeStr, nameStr, descStr, mailStr, telStr]
          .filter(Boolean)
          .join(' | ');

        if (summary) {
          jsonLdLines.push(`- ${summary.slice(0, 300)}`);
        }
      };

      visit(parsed);
    } catch {
      jsonLdLines.push(`- ${cleanText(rawJson).slice(0, 300)}`);
    }
  });

  return { jsonLdLines, rawSchemas };
};

/**
 * Extracts prominent headings from the page, both flat and structured.
 */
export const extractHeadings = (
  $: cheerio.CheerioAPI,
  limit = 18
): { headings: string[]; headingsMap: HeadingsMap } => {
  const headingsMap: HeadingsMap = {
    h1: [],
    h2: [],
    h3: []
  };

  $('h1').each((_, el) => {
    const text = cleanText($(el).text());
    if (text.length > 2 && text.length < 180 && !headingsMap.h1.includes(text)) {
      headingsMap.h1.push(text);
    }
  });

  $('h2').each((_, el) => {
    const text = cleanText($(el).text());
    if (text.length > 2 && text.length < 180 && !headingsMap.h2.includes(text)) {
      headingsMap.h2.push(text);
    }
  });

  $('h3').each((_, el) => {
    const text = cleanText($(el).text());
    if (text.length > 2 && text.length < 180 && !headingsMap.h3.includes(text)) {
      headingsMap.h3.push(text);
    }
  });

  const flat = $('h1, h2, h3')
    .map((_, el) => cleanText($(el).text()))
    .get()
    .filter((h) => h.length > 2 && h.length < 180)
    .slice(0, limit);

  return { headings: flat, headingsMap };
};

/**
 * Isolates and cleans the main body text by removing boilerplate tags (scripts, styles, svg).
 */
export const isolateMainText = ($: cheerio.CheerioAPI, maxBodyChars = 4200): string => {
  const clone = cheerio.load($.html());
  clone('script, style, noscript, svg, nav, footer, header, [role="navigation"]').remove();
  return cleanText(clone('body').text()).slice(0, maxBodyChars);
};

/**
 * Detects technology signals, frameworks, analytics, CMS, and styling libraries.
 */
export const detectTechSignals = (
  $: cheerio.CheerioAPI,
  headers?: Record<string, string>
): TechSignals => {
  const analytics = new Set<string>();
  const frameworks = new Set<string>();
  const cms = new Set<string>();
  const uiLibraries = new Set<string>();
  const hostingCdn = new Set<string>();
  const metaTags: Record<string, string> = {};
  const scripts: string[] = [];

  // 1. Meta tags
  $('meta').each((_, el) => {
    const name = $(el).attr('name') || $(el).attr('property');
    const content = $(el).attr('content');
    if (name && content) {
      metaTags[name.toLowerCase()] = cleanText(content);
    }
  });

  // 2. Script inspection
  $('script').each((_, el) => {
    const src = ($(el).attr('src') || '').toLowerCase();
    const content = $(el).text() || '';

    if (src) {
      scripts.push(src);
    }

    // Analytics
    if (src.includes('googletagmanager.com') || src.includes('google-analytics.com') || content.includes('gtag(')) {
      analytics.add('Google Analytics / GTM');
    }
    if (src.includes('fbevents.js') || content.includes('fbq(')) {
      analytics.add('Meta Pixel');
    }
    if (src.includes('posthog') || content.includes('posthog.init')) {
      analytics.add('PostHog');
    }
    if (src.includes('mixpanel') || content.includes('mixpanel.init')) {
      analytics.add('Mixpanel');
    }
    if (src.includes('segment.com/analytics.js')) {
      analytics.add('Segment');
    }
    if (src.includes('hotjar') || content.includes('_hjSettings')) {
      analytics.add('Hotjar');
    }
    if (src.includes('clarity.ms')) {
      analytics.add('Microsoft Clarity');
    }
    if (src.includes('plausible.io')) {
      analytics.add('Plausible');
    }
    if (src.includes('sentry')) {
      analytics.add('Sentry');
    }
    if (src.includes('intercom.io')) {
      analytics.add('Intercom');
    }
    if (src.includes('hs-scripts.com') || src.includes('hubspot')) {
      analytics.add('HubSpot');
    }

    // Frameworks & CMS in scripts
    if (content.includes('__NEXT_DATA__') || src.includes('/_next/')) {
      frameworks.add('Next.js');
      frameworks.add('React');
    }
    if (content.includes('__NUXT__') || src.includes('/_nuxt/')) {
      frameworks.add('Nuxt.js');
      frameworks.add('Vue');
    }
    if (src.includes('react') || content.includes('React.')) {
      frameworks.add('React');
    }
    if (content.includes('__remixContext')) {
      frameworks.add('Remix');
      frameworks.add('React');
    }
    if (content.includes('Shopify.shop') || src.includes('cdn.shopify.com')) {
      cms.add('Shopify');
    }
    if (src.includes('webflow.com') || content.includes('Webflow.')) {
      cms.add('Webflow');
    }
    if (src.includes('framer.com')) {
      cms.add('Framer');
    }
  });

  // 3. DOM & attributes clues
  if ($('#__next').length > 0 || $('script#__NEXT_DATA__').length > 0) {
    frameworks.add('Next.js');
    frameworks.add('React');
  }
  if ($('[data-reactroot]').length > 0) {
    frameworks.add('React');
  }
  if ($('#__nuxt').length > 0 || $('[data-v-]').length > 0 || $('[v-cloak]').length > 0) {
    frameworks.add('Vue');
  }
  if ($('[ng-version]').length > 0 || $('[ng-app]').length > 0 || $('app-root').length > 0) {
    frameworks.add('Angular');
  }
  if ($('[class*="svelte-"]').length > 0 || $('div[id^="__sveltekit"]').length > 0) {
    frameworks.add('Svelte');
  }
  if ($('[data-astro-cid]').length > 0) {
    frameworks.add('Astro');
  }

  // CMS
  const generator = (metaTags['generator'] || '').toLowerCase();
  if (generator.includes('wordpress') || $('link[href*="wp-content"]').length > 0) {
    cms.add('WordPress');
  }
  if (generator.includes('ghost')) {
    cms.add('Ghost');
  }
  if (generator.includes('shopify') || $('link[href*="cdn.shopify.com"]').length > 0) {
    cms.add('Shopify');
  }
  if (generator.includes('webflow') || $('html[data-wf-page]').length > 0) {
    cms.add('Webflow');
  }
  if (generator.includes('squarespace') || $('html[data-style-id]').length > 0) {
    cms.add('Squarespace');
  }
  if (generator.includes('wix') || $('meta[name="robots"][content*="wix"]').length > 0) {
    cms.add('Wix');
  }

  // UI Libraries & Styling
  const htmlStr = $.html();
  if (
    $('link[href*="tailwind"]').length > 0 ||
    /\b(flex|grid|inline-flex|justify-between|items-center|rounded-md|bg-[\w-]+|text-[\w-]+)\b/.test(htmlStr)
  ) {
    uiLibraries.add('Tailwind CSS');
  }
  if ($('link[href*="bootstrap"]').length > 0 || $('.container-fluid, .btn-primary').length > 0) {
    uiLibraries.add('Bootstrap');
  }
  if ($('[class*="Mui"]').length > 0 || $('meta[name="emotion-insertion-point"]').length > 0) {
    uiLibraries.add('Material UI (MUI)');
  }
  if ($('[data-radix-collection-item]').length > 0 || $('[data-state]').length > 0) {
    uiLibraries.add('Radix UI');
  }

  // Hosting / CDN inspection (from headers if available or html)
  if (headers) {
    const headerKeys = Object.keys(headers).map((k) => k.toLowerCase());
    if (headerKeys.some((k) => k.includes('vercel'))) hostingCdn.add('Vercel');
    if (headerKeys.some((k) => k.includes('cf-ray') || headers[k]?.includes('cloudflare'))) hostingCdn.add('Cloudflare');
    if (headerKeys.some((k) => k.includes('netlify'))) hostingCdn.add('Netlify');
    if (headerKeys.some((k) => k.includes('amz-cf'))) hostingCdn.add('AWS CloudFront');
    if (headerKeys.some((k) => k.includes('fastly'))) hostingCdn.add('Fastly');
  }

  return {
    analytics: [...analytics],
    frameworks: [...frameworks],
    cms: [...cms],
    uiLibraries: [...uiLibraries],
    hostingCdn: [...hostingCdn],
    metaTags,
    scripts: scripts.slice(0, 25),
    headers
  };
};

/**
 * Extracts structured navigation links from header, nav, or key navigation areas.
 */
export const extractNavigationLinks = ($: cheerio.CheerioAPI, baseUrl?: string): NavigationLink[] => {
  const links: NavigationLink[] = [];
  const seenHrefs = new Set<string>();

  $('header a[href], nav a[href], [role="navigation"] a[href], footer a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    const text = cleanText($(el).text());

    if (!href || href.startsWith('#') || href.startsWith('javascript:') || seenHrefs.has(href)) {
      return;
    }

    seenHrefs.add(href);

    let isInternal = true;
    if (baseUrl) {
      try {
        const u = new URL(href, baseUrl);
        const b = new URL(baseUrl);
        isInternal = u.hostname.replace(/^www\./, '') === b.hostname.replace(/^www\./, '');
      } catch {
        isInternal = false;
      }
    } else {
      isInternal = !href.startsWith('http://') && !href.startsWith('https://');
    }

    links.push({
      text: text || href,
      href,
      isInternal
    });
  });

  return links.slice(0, 30);
};

/**
 * Extracts comprehensive structured signals from raw HTML content.
 */
export const extractStructuredHtmlSignals = (html: string, maxBodyChars = 4200): string => {
  if (!html) return '';
  const $ = cheerio.load(String(html));

  const title = cleanText($('title').first().text());
  const metaDesc = cleanText(
    $('meta[name="description"], meta[property="og:description"]').first().attr('content')
  );

  const { emails, phones } = extractContactSignals($);
  const { jsonLdLines } = parseJsonLd($, emails, phones);
  const { headings } = extractHeadings($);
  const bodyText = isolateMainText($, maxBodyChars);

  return [
    title && `Page Title: ${title}`,
    metaDesc && `Meta Description: ${metaDesc}`,
    emails.size > 0 && `Detected Emails: ${[...emails].slice(0, 8).join(', ')}`,
    phones.size > 0 && `Detected Phones: ${[...phones].slice(0, 6).join(', ')}`,
    jsonLdLines.length > 0 &&
      `Structured JSON-LD Metadata:\n${[...new Set(jsonLdLines)].slice(0, 8).join('\n')}`,
    headings.length > 0 && `Key Headings: ${headings.join(' | ')}`,
    bodyText && `Extracted Page Text:\n${bodyText}`
  ]
    .filter(Boolean)
    .join('\n');
};

/**
 * Full page analysis returning a structured ParsedPage object.
 */
export const parsePage = (
  html: string,
  url: string,
  headers?: Record<string, string>
): ParsedPage => {
  const $ = cheerio.load(String(html || ''));

  const title = cleanText($('title').first().text() || $('meta[property="og:title"]').attr('content'));
  const description = cleanText(
    $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content')
  );

  const { emails, phones } = extractContactSignals($);
  const { jsonLdLines, rawSchemas } = parseJsonLd($, emails, phones);
  const { headings, headingsMap } = extractHeadings($);
  const techSignals = detectTechSignals($, headers);
  const navLinks = extractNavigationLinks($, url);
  const textSample = isolateMainText($, 3000);

  return {
    url,
    title,
    description,
    headings,
    headingsMap,
    emails: [...emails],
    phones: [...phones],
    jsonLd: rawSchemas,
    jsonLdSummary: jsonLdLines,
    navLinks,
    techSignals,
    textSample
  };
};

/**
 * Discovers and filters internal subpage links from HTML and rendered markdown.
 */
export const discoverInternalSubpages = (
  normalizedUrl: string,
  rawHtml = '',
  jinaText = '',
  maxSubpages = DEFAULT_MAX_SUBPAGES
): { urls: string[]; headerNavCount: number; usedFallbackLinks: boolean } => {
  let rootUrl: URL;
  try {
    rootUrl = new URL(normalizedUrl);
  } catch {
    return { urls: [], headerNavCount: 0, usedFallbackLinks: false };
  }

  const stripWww = (h: string) => h.toLowerCase().replace(/^www\./, '');
  const cleanPath = (p: string) => p.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  const rootPath = cleanPath(rootUrl.pathname);

  const resolveInternal = (href: string | undefined): string | null => {
    if (!href || href.startsWith('#') || /^(?:mailto:|tel:|javascript:)/i.test(href)) return null;
    try {
      const u = new URL(href.trim(), rootUrl.toString());
      if (!['http:', 'https:'].includes(u.protocol) || stripWww(u.hostname) !== stripWww(rootUrl.hostname)) {
        return null;
      }
      Object.assign(u, {
        hostname: rootUrl.hostname,
        protocol: rootUrl.protocol,
        hash: '',
        search: '',
        pathname: cleanPath(u.pathname)
      });
      return u.pathname === '/' || u.pathname === rootPath || SKIP_PATH_REGEX.test(u.pathname)
        ? null
        : u.toString();
    } catch {
      return null;
    }
  };

  const $ = cheerio.load(String(rawHtml || ''));
  const navHrefs = $('header a[href], nav a[href], [role="navigation"] a[href]')
    .map((_, el) => $(el).attr('href'))
    .get();

  const jinaTopBlock = String(jinaText || '').split(/(?:^|\n)#\s+/)[0].slice(0, 1200);

  const collectUnique = (seed: string[], hrefs: (string | undefined)[]): string[] =>
    hrefs.reduce((acc, h) => {
      const u = resolveInternal(h);
      if (u && !acc.includes(u)) acc.push(u);
      return acc;
    }, [...seed]);

  const navUrls = collectUnique([], [...navHrefs, ...extractMarkdownLinks(jinaTopBlock)]);
  if (navUrls.length >= MIN_HEADER_NAV_LINKS) {
    return {
      urls: navUrls.slice(0, maxSubpages),
      headerNavCount: navUrls.length,
      usedFallbackLinks: false
    };
  }

  const pageHrefs = $('a[href]').map((_, el) => $(el).attr('href')).get();
  const allUrls = collectUnique(navUrls, [...pageHrefs, ...extractMarkdownLinks(jinaText)]);

  return {
    urls: allUrls.slice(0, maxSubpages),
    headerNavCount: navUrls.length,
    usedFallbackLinks: true
  };
};
