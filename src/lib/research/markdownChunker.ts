/**
 * markdownChunker.ts
 * Clean text synthesis and character context budgeting for web research data.
 */

export const DEFAULT_MAX_CONTEXT_BUDGET = 20000;
export const DEFAULT_MAX_WEBSITE_CHARS = 16000;
export const DEFAULT_MAX_SEARCH_CHARS = 4000;

export interface SectionItem {
  text: string;
  title?: string;
  priority?: number;
}

export interface SynthesizeOptions {
  websiteSection?: string;
  searchSection?: string;
  maxBudget?: number;
  maxWebsiteChars?: number;
  maxSearchChars?: number;
}

export interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

/**
 * Normalizes strings by collapsing excessive whitespace and trimming.
 */
export const cleanText = (str: string | null | undefined): string => {
  return String(str || '').replace(/\s+/g, ' ').trim();
};

/**
 * Cleans markdown content by stripping images, normalizing newlines,
 * and reducing runs of whitespace.
 */
export const cleanMarkdown = (markdown: string | null | undefined): string => {
  return String(markdown || '')
    .replace(/\r\n/g, '\n')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // remove images
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Extracts markdown link destinations [text](url).
 */
export const extractMarkdownLinks = (text: string | null | undefined): string[] => {
  const matches = [...String(text || '').matchAll(/(?<!!)\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/gi)];
  return matches.map((m) => m[1]);
};

/**
 * Safely truncates text to fit within a character limit,
 * attempting to preserve word or newline boundaries.
 */
export const truncateToBudget = (
  text: string | null | undefined,
  maxChars: number,
  suffix = '...'
): string => {
  const raw = String(text || '').trim();
  if (!raw || raw.length <= maxChars) return raw;
  if (maxChars <= suffix.length) return raw.slice(0, maxChars);

  const targetLength = maxChars - suffix.length;
  let cut = raw.slice(0, targetLength);

  // Look for last newline or space within last 100 characters to break cleanly
  const lastNewline = cut.lastIndexOf('\n');
  if (lastNewline > targetLength - 100) {
    cut = cut.slice(0, lastNewline);
  } else {
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > targetLength - 60) {
      cut = cut.slice(0, lastSpace);
    }
  }

  return cut.trimEnd() + suffix;
};

/**
 * Budgets a list of sections into a combined context string under maxChars.
 */
export const budgetContext = (
  sections: Array<string | SectionItem> = [],
  maxBudget = DEFAULT_MAX_CONTEXT_BUDGET
): string => {
  const normalized: SectionItem[] = sections
    .map((s) => (typeof s === 'string' ? { text: s } : s))
    .filter((s): s is SectionItem => Boolean(s && s.text && s.text.trim().length > 0));

  let combined = '';
  for (const sec of normalized) {
    const sectionContent = sec.title ? `### ${sec.title}\n${sec.text.trim()}` : sec.text.trim();
    const separator = combined.length > 0 ? '\n\n' : '';
    const candidate = combined + separator + sectionContent;

    if (candidate.length <= maxBudget) {
      combined = candidate;
    } else {
      const remainingBudget = maxBudget - combined.length - separator.length;
      if (remainingBudget > 80) {
        const truncatedSec = truncateToBudget(sectionContent, remainingBudget);
        combined = combined + separator + truncatedSec;
      }
      break;
    }
  }

  return combined.trim();
};

/**
 * Synthesizes website research and search results into a clean, budgeted markdown document.
 * Adheres strictly to the 20,000-character context budget.
 */
export const synthesizeResearchContext = ({
  websiteSection = '',
  searchSection = '',
  maxBudget = DEFAULT_MAX_CONTEXT_BUDGET,
  maxWebsiteChars = DEFAULT_MAX_WEBSITE_CHARS,
  maxSearchChars = DEFAULT_MAX_SEARCH_CHARS
}: SynthesizeOptions = {}): string => {
  const cleanWebsite = String(websiteSection || '').trim();
  const cleanSearch = String(searchSection || '').trim();

  if (!cleanWebsite && !cleanSearch) return '';

  const totalRawLength =
    (cleanWebsite ? cleanWebsite.length : 0) +
    (cleanWebsite && cleanSearch ? 2 : 0) +
    (cleanSearch ? cleanSearch.length : 0);

  if (totalRawLength <= maxBudget) {
    return [cleanWebsite, cleanSearch].filter(Boolean).join('\n\n').trim();
  }

  let websiteAllocation = maxWebsiteChars;
  let searchAllocation = maxSearchChars;

  if (!cleanSearch) {
    websiteAllocation = maxBudget;
  } else if (!cleanWebsite) {
    searchAllocation = maxBudget;
  } else if (cleanSearch.length < searchAllocation) {
    websiteAllocation = maxBudget - cleanSearch.length - 2;
  } else if (cleanWebsite.length < websiteAllocation) {
    searchAllocation = maxBudget - cleanWebsite.length - 2;
  }

  const budgetedWebsite = cleanWebsite ? truncateToBudget(cleanWebsite, websiteAllocation) : '';
  const budgetedSearch = cleanSearch ? truncateToBudget(cleanSearch, searchAllocation) : '';

  return [budgetedWebsite, budgetedSearch].filter(Boolean).join('\n\n').trim().slice(0, maxBudget);
};

/**
 * Chunks a markdown document into distinct blocks of maximum character length
 * with an optional overlap for token safety and model context windows.
 */
export const chunkMarkdown = (
  text: string | null | undefined,
  { chunkSize = 4000, overlap = 200 }: ChunkOptions = {}
): string[] => {
  const raw = String(text || '').trim();
  if (!raw) return [];
  if (raw.length <= chunkSize) return [raw];

  const paragraphs = raw.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if (trimmed.length > chunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      let start = 0;
      while (start < trimmed.length) {
        const end = Math.min(start + chunkSize, trimmed.length);
        chunks.push(trimmed.slice(start, end).trim());
        start += chunkSize - overlap;
      }
      continue;
    }

    const candidate = currentChunk ? `${currentChunk}\n\n${trimmed}` : trimmed;
    if (candidate.length <= chunkSize) {
      currentChunk = candidate;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};
