/**
 * types.ts
 * Type definitions for Darpan360 web research crawler ported to TypeScript.
 */

export interface TechSignals {
  analytics: string[];
  frameworks: string[];
  cms: string[];
  uiLibraries: string[];
  hostingCdn: string[];
  metaTags: Record<string, string>;
  scripts: string[];
  headers?: Record<string, string>;
}

export interface NavigationLink {
  text: string;
  href: string;
  isInternal: boolean;
}

export interface HeadingsMap {
  h1: string[];
  h2: string[];
  h3: string[];
}

export interface ContactInfo {
  emails: string[];
  phones: string[];
}

export interface SubpageResult {
  url: string;
  title?: string;
  content: string;
  snippet?: string;
}

export interface ParsedPage {
  url: string;
  title: string;
  description: string;
  headings: string[];
  headingsMap?: HeadingsMap;
  emails: string[];
  phones: string[];
  jsonLd: Record<string, unknown>[];
  jsonLdSummary: string[];
  navLinks: NavigationLink[];
  techSignals: TechSignals;
  textSample: string;
}

export interface CrawlResult {
  url: string;
  sections: string[];
  sourcesUsed: string[];
  directHtml: string;
  jinaText: string;
  subpages: SubpageResult[];
  success: boolean;
  error?: string;
}

export interface CompetitorIntelligence {
  url: string;
  domain: string;
  brandName: string;
  title: string;
  description: string;
  headings: string[];
  headingsMap: HeadingsMap;
  techStack: TechSignals;
  navigation: NavigationLink[];
  subpages: SubpageResult[];
  contactInfo: ContactInfo;
  jsonLdSchemas: Record<string, unknown>[];
  rawContext: string;
  sourcesUsed: string[];
  crawledAt: string;
}

export interface ResearchOptions {
  timeoutMs?: number;
  subpageTimeoutMs?: number;
  maxSubpages?: number;
  maxBudgetChars?: number;
  maxWebsiteChars?: number;
  maxSearchChars?: number;
  businessName?: string;
  webSearchQuery?: string;
  userAgent?: string;
  customHeaders?: Record<string, string>;
}

export interface GatherContextResult {
  normalizedUrl: string | null;
  effectiveSearchQuery: string;
  internetContextText: string;
  sourcesUsed: string[];
}
