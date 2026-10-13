/**
 * index.ts
 * Unified competitor research facade, web crawling orchestrator, and architecture intelligence generator.
 */

import {
  discoverInternalSubpages,
  extractContactSignals,
  extractHeadings,
  extractNavigationLinks,
  extractStructuredHtmlSignals,
  isolateMainText,
  parseJsonLd,
  parsePage,
  detectTechSignals
} from './domParser';
import {
  budgetContext,
  chunkMarkdown,
  cleanMarkdown,
  cleanText,
  DEFAULT_MAX_CONTEXT_BUDGET,
  DEFAULT_MAX_SEARCH_CHARS,
  DEFAULT_MAX_WEBSITE_CHARS,
  extractMarkdownLinks,
  synthesizeResearchContext,
  truncateToBudget
} from './markdownChunker';
import {
  assertSafeUrl,
  isPrivateHost,
  isPrivateIp,
  isValidPublicHttpUrl,
  normalizePublicWebsiteUrl,
  PRIVATE_HOST_PATTERNS
} from './ssrfGuard';
import type {
  CompetitorIntelligence,
  CrawlResult,
  GatherContextResult,
  HeadingsMap,
  NavigationLink,
  ParsedPage,
  ResearchOptions,
  SubpageResult,
  TechSignals
} from './types';
import {
  crawlWebsite,
  DEFAULT_CRAWLER_HEADERS,
  DEFAULT_SEARCH_HEADERS,
  DEFAULT_TIMEOUT_MS,
  fetchDirectWebsitePage,
  fetchDuckDuckGoSearchSnippets,
  fetchJinaReaderText,
  fetchSubpageContext,
  MAX_SUBPAGES,
  SUBPAGE_TIMEOUT_MS,
  validateResponseHeaders
} from './webCrawler';

/**
 * Extracts or infers the most likely brand / company name from page signals.
 */
function inferBrandName(page: ParsedPage, domain: string): string {
  // 1. From JSON-LD schemas
  for (const schema of page.jsonLd) {
    const type = String(schema['@type'] || '');
    if (
      ['Organization', 'WebSite', 'Corporation', 'LocalBusiness', 'Brand'].includes(type) &&
      typeof schema.name === 'string' &&
      schema.name.trim()
    ) {
      return schema.name.trim();
    }
  }

  // 2. From OpenGraph site_name or application-name
  if (page.techSignals.metaTags['og:site_name']) {
    return page.techSignals.metaTags['og:site_name'].trim();
  }
  if (page.techSignals.metaTags['application-name']) {
    return page.techSignals.metaTags['application-name'].trim();
  }

  // 3. From page title (take leading segment if short)
  if (page.title) {
    const segments = page.title.split(/[\s|–—:-]+\s*/).filter(Boolean);
    if (segments.length > 0 && segments[0].length >= 2 && segments[0].length <= 35) {
      return segments[0].trim();
    }
  }

  // 4. Fallback to clean domain
  const cleanDomain = domain.replace(/^(?:www\.)?/, '').split('.')[0];
  return cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
}

/**
 * Unified facade: crawls and analyzes a competitor website,
 * extracting structured intelligence and budgeted context for the architecture generator.
 *
 * @param url Target website URL
 * @param options Crawl and research options
 * @returns Structured competitor intelligence
 */
export async function crawlAndAnalyzeCompetitor(
  url: string,
  options: ResearchOptions = {}
): Promise<CompetitorIntelligence> {
  const safeUrl = assertSafeUrl(url);
  const domain = new URL(safeUrl).hostname;

  // 1. Perform deep crawl of homepage + top 4-5 navigation subpages
  const crawlResult = await crawlWebsite(safeUrl, options);
  if (!crawlResult.success) {
    throw new Error(crawlResult.error || `Failed to crawl competitor website at ${safeUrl}`);
  }

  // 2. Parse homepage metadata, signals, JSON-LD, tech stack clues
  let parsedPage: ParsedPage;
  if (crawlResult.directHtml) {
    parsedPage = parsePage(crawlResult.directHtml, safeUrl);
  } else {
    // Fallback when only Jina Reader succeeded
    const jinaLines = crawlResult.jinaText.split('\n').filter((l) => l.trim().length > 0);
    const title = (jinaLines[0] || '').replace(/^#+\s*/, '').trim();
    parsedPage = {
      url: safeUrl,
      title: title || domain,
      description: (jinaLines[1] || '').slice(0, 200),
      headings: jinaLines.filter((l) => /^#{1,3}\s+/.test(l)).map((l) => l.replace(/^#+\s*/, '').trim()),
      headingsMap: { h1: [title].filter(Boolean), h2: [], h3: [] },
      emails: [],
      phones: [],
      jsonLd: [],
      jsonLdSummary: [],
      navLinks: [],
      techSignals: {
        analytics: [],
        frameworks: [],
        cms: [],
        uiLibraries: [],
        hostingCdn: [],
        metaTags: {},
        scripts: []
      },
      textSample: crawlResult.jinaText.slice(0, 3000)
    };
  }

  const brandName = inferBrandName(parsedPage, domain);

  // 3. Aggregate contact information across homepage and crawled subpages
  const allEmails = new Set<string>(parsedPage.emails);
  const allPhones = new Set<string>(parsedPage.phones);

  for (const sub of crawlResult.subpages) {
    const mailMatches = sub.content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    for (const m of mailMatches) {
      if (!m.endsWith('.png') && !m.endsWith('.jpg') && !m.endsWith('.svg')) {
        allEmails.add(m.toLowerCase());
      }
    }
  }

  // 4. Synthesize research markdown context (strictly budgeted under 20,000 characters)
  const maxBudget = options.maxBudgetChars || DEFAULT_MAX_CONTEXT_BUDGET;
  const rawContext = synthesizeResearchContext({
    websiteSection: crawlResult.sections.join('\n\n'),
    maxBudget
  });

  return {
    url: safeUrl,
    domain,
    brandName,
    title: parsedPage.title,
    description: parsedPage.description,
    headings: parsedPage.headings,
    headingsMap: parsedPage.headingsMap || { h1: [], h2: [], h3: [] },
    techStack: parsedPage.techSignals,
    navigation: parsedPage.navLinks,
    subpages: crawlResult.subpages,
    contactInfo: {
      emails: [...allEmails],
      phones: [...allPhones]
    },
    jsonLdSchemas: parsedPage.jsonLd,
    rawContext,
    sourcesUsed: crawlResult.sourcesUsed,
    crawledAt: new Date().toISOString()
  };
}

/**
 * Gathers comprehensive live internet research on a business or domain.
 * Preserves compatibility with Darpan360's gatherInternetContext orchestrator.
 */
export async function gatherInternetContext({
  websiteUrl,
  businessName,
  webSearchQuery,
  maxBudget = DEFAULT_MAX_CONTEXT_BUDGET
}: {
  websiteUrl?: string;
  businessName?: string;
  webSearchQuery?: string;
  maxBudget?: number;
} = {}): Promise<GatherContextResult> {
  const normalizedUrl = normalizePublicWebsiteUrl(websiteUrl || '');
  const effectiveSearchQuery = cleanText(
    webSearchQuery ||
      [businessName, normalizedUrl ? new URL(normalizedUrl).hostname : ''].filter(Boolean).join(' ')
  );

  const sourcesSet = new Set<string>();

  const websiteTask = normalizedUrl
    ? (async () => {
        const crawlResult = await crawlWebsite(normalizedUrl);
        crawlResult.sourcesUsed.forEach((src) => sourcesSet.add(src));
        return crawlResult.sections.join('\n\n');
      })()
    : Promise.resolve('');

  const searchTask = effectiveSearchQuery
    ? fetchDuckDuckGoSearchSnippets(effectiveSearchQuery)
        .then((snippets) => {
          if (snippets.length) {
            sourcesSet.add(`Web Search: "${effectiveSearchQuery}"`);
            return `[Live Web Search Results for "${effectiveSearchQuery}"]\n${snippets.join('\n')}`.slice(
              0,
              2500
            );
          }
          return '';
        })
        .catch(() => '')
    : Promise.resolve('');

  const [websiteSection, searchSection] = await Promise.all([websiteTask, searchTask]);

  const internetContextText = synthesizeResearchContext({
    websiteSection,
    searchSection,
    maxBudget
  });

  return {
    normalizedUrl,
    effectiveSearchQuery,
    internetContextText,
    sourcesUsed: [...sourcesSet]
  };
}

// Re-export all submodules and types
export * from './types';
export * from './ssrfGuard';
export * from './domParser';
export * from './markdownChunker';
export * from './webCrawler';
