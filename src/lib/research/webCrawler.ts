/**
 * webCrawler.ts
 * URL normalization, safe page fetching, Jina Reader integration with Cheerio fallback,
 * and top subpages crawling routines.
 */

import * as cheerio from 'cheerio';
import {
  discoverInternalSubpages,
  extractStructuredHtmlSignals
} from './domParser';
import { cleanMarkdown, cleanText } from './markdownChunker';
import {
  assertSafeUrl,
  isPrivateHost,
  isValidPublicHttpUrl,
  normalizePublicWebsiteUrl
} from './ssrfGuard';
import type { CrawlResult, ResearchOptions, SubpageResult } from './types';

export const SUBPAGE_TIMEOUT_MS = 6000;
export const DEFAULT_TIMEOUT_MS = 7500;
export const MAX_SUBPAGES = 5;
export const MAX_CONTENT_LENGTH_BYTES = 10 * 1024 * 1024; // 10MB limit

export const DEFAULT_CRAWLER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 QuzarBot/1.0',
  'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

export const DEFAULT_SEARCH_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8'
};

/**
 * Validates response headers to ensure safe content types and manageable sizes.
 */
export const validateResponseHeaders = (
  response: Response,
  { disallowedPrefixes = ['image/', 'audio/', 'video/', 'application/pdf', 'application/zip'] } = {}
): void => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (contentType && disallowedPrefixes.some((prefix) => contentType.startsWith(prefix))) {
    throw new Error(`Disallowed content-type: ${contentType}`);
  }

  const contentLength = parseInt(response.headers.get('content-length') || '', 10);
  if (!Number.isNaN(contentLength) && contentLength > MAX_CONTENT_LENGTH_BYTES) {
    throw new Error(`Content length exceeds limit: ${contentLength} bytes`);
  }
};

/**
 * Directly fetches a web page, validates headers, and extracts structured signals.
 */
export const fetchDirectWebsitePage = async (
  url: string,
  timeoutMs = SUBPAGE_TIMEOUT_MS,
  maxBodyChars = 4200,
  customHeaders?: Record<string, string>
): Promise<{ html: string; signalsText: string; headers: Record<string, string> }> => {
  const safeUrl = assertSafeUrl(url);

  const res = await fetch(safeUrl, {
    headers: { ...DEFAULT_CRAWLER_HEADERS, ...customHeaders },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs)
  });

  validateResponseHeaders(res);

  const responseHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    responseHeaders[key.toLowerCase()] = value;
  });

  const html = await res.text();
  const signalsText = extractStructuredHtmlSignals(html, maxBodyChars);

  return {
    html,
    signalsText,
    headers: responseHeaders
  };
};

/**
 * Fetches reader-friendly markdown from Jina Reader API (https://r.jina.ai/<url>).
 */
export const fetchJinaReaderText = async (
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxChars = 5000
): Promise<string> => {
  const safeUrl = assertSafeUrl(url);

  const res = await fetch(`https://r.jina.ai/${safeUrl}`, {
    headers: {
      'Accept': 'text/plain',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QuzarResearch/1.0'
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!res.ok) {
    throw new Error(`Jina Reader returned HTTP ${res.status}`);
  }

  const rawText = (await res.text()).replace(/\r\n/g, '\n');
  const body = rawText.includes('Markdown Content:')
    ? rawText.split('Markdown Content:')[1]
    : rawText;

  const cleaned = cleanMarkdown(body);
  return cleaned.slice(0, maxChars);
};

/**
 * Fetches DuckDuckGo HTML search results and extracts clean snippet text.
 */
export const fetchDuckDuckGoSearchSnippets = async (query: string): Promise<string[]> => {
  const q = cleanText(query).slice(0, 180);
  if (!q) return [];

  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
    headers: DEFAULT_SEARCH_HEADERS,
    signal: AbortSignal.timeout(4500)
  });

  validateResponseHeaders(res);

  const html = await res.text();
  const $ = cheerio.load(html);

  return $('a.result__a')
    .slice(0, 6)
    .map((i, el) => {
      const title = cleanText($(el).text());
      const snippet = cleanText($('.result__snippet').eq(i).text());
      return title || snippet ? `- ${title ? `${title}: ` : ''}${snippet}` : '';
    })
    .get()
    .filter(Boolean);
};

/**
 * Fetches context for an internal subpage, prioritizing Jina Reader and falling back to direct HTML.
 */
export const fetchSubpageContext = async (
  subUrl: string,
  timeoutMs = SUBPAGE_TIMEOUT_MS
): Promise<SubpageResult> => {
  // SSRF check on subpage
  assertSafeUrl(subUrl);

  // 1. Try Jina Reader
  try {
    const jina = await fetchJinaReaderText(subUrl, timeoutMs, 2000);
    if (jina.length > 50) {
      const firstLine = jina.split('\n')[0].replace(/^#+\s*/, '').trim();
      return {
        url: subUrl,
        title: firstLine || undefined,
        content: `[Crawled Sub-Page (${subUrl})]\n${jina}`,
        snippet: jina.slice(0, 300)
      };
    }
  } catch {
    // Fall back to direct fetch + Cheerio
  }

  // 2. Fallback to direct HTML extraction
  const direct = await fetchDirectWebsitePage(subUrl, timeoutMs, 1800);
  if (direct.signalsText) {
    const $ = cheerio.load(direct.html);
    const title = cleanText($('title').text() || $('h1').first().text());
    return {
      url: subUrl,
      title: title || undefined,
      content: `[Crawled Sub-Page (${subUrl})]\n${direct.signalsText.slice(0, 1800)}`,
      snippet: direct.signalsText.slice(0, 300)
    };
  }

  throw new Error(`Empty content retrieved from subpage ${subUrl}`);
};

/**
 * Crawls a website: fetches root page, discovers top 4-5 navigation subpages,
 * and gathers structured sections using Jina Reader with Cheerio fallback.
 */
export const crawlWebsite = async (
  normalizedUrl: string,
  options: ResearchOptions = {}
): Promise<CrawlResult> => {
  const safeUrl = assertSafeUrl(normalizedUrl);
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const subTimeoutMs = options.subpageTimeoutMs || SUBPAGE_TIMEOUT_MS;
  const maxSubpages = options.maxSubpages || MAX_SUBPAGES;

  const sourcesUsed: string[] = [];

  // Fetch root page via Jina and direct fetch concurrently
  const [jinaRes, directRes] = await Promise.allSettled([
    fetchJinaReaderText(safeUrl, timeoutMs, 5000),
    fetchDirectWebsitePage(safeUrl, timeoutMs, 4000, options.customHeaders)
  ]);

  const jinaText = jinaRes.status === 'fulfilled' ? jinaRes.value : '';
  const directHtml = directRes.status === 'fulfilled' ? directRes.value.html : '';
  const directText = directRes.status === 'fulfilled' ? directRes.value.signalsText : '';

  if (!directText && !jinaText) {
    const directErr = directRes.status === 'rejected' ? directRes.reason?.message : '';
    const jinaErr = jinaRes.status === 'rejected' ? jinaRes.reason?.message : '';
    return {
      url: safeUrl,
      sections: [],
      sourcesUsed: [],
      directHtml: '',
      jinaText: '',
      subpages: [],
      success: false,
      error: `Failed to crawl ${safeUrl}: Jina (${jinaErr || 'failed'}), Direct (${directErr || 'failed'})`
    };
  }

  sourcesUsed.push(safeUrl);

  // Discover internal navigation subpages
  const { urls: candidateSubpages } = discoverInternalSubpages(
    safeUrl,
    directHtml,
    jinaText,
    maxSubpages
  );

  // Validate each subpage with SSRF guard
  const safeSubpageUrls = candidateSubpages.filter((subUrl) => {
    try {
      assertSafeUrl(subUrl);
      return true;
    } catch {
      return false;
    }
  });

  // Fetch top subpages concurrently
  const subpagePromises = safeSubpageUrls.map((subUrl) =>
    fetchSubpageContext(subUrl, subTimeoutMs)
  );
  const subpageSettled = await Promise.allSettled(subpagePromises);

  const subpages: SubpageResult[] = [];
  const subpageSections: string[] = [];

  for (const res of subpageSettled) {
    if (res.status === 'fulfilled' && res.value?.content) {
      sourcesUsed.push(res.value.url);
      subpages.push(res.value);
      subpageSections.push(res.value.content);
    }
  }

  const rootDirectSection = directText
    ? `[Direct Website Metadata & Signals (${safeUrl})]\n${directText.slice(0, 3600)}`
    : '';
  const rootJinaSection = jinaText
    ? `[Rendered Website Content (${safeUrl})]\n${jinaText.slice(0, 4000)}`
    : '';

  const sections = [rootDirectSection, rootJinaSection, ...subpageSections].filter(Boolean);

  return {
    url: safeUrl,
    sections,
    sourcesUsed: [...new Set(sourcesUsed)],
    directHtml,
    jinaText,
    subpages,
    success: true
  };
};


