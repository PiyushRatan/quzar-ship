/**
 * index.ts
 * Unified specification export facade.
 */

import { ExportFormat, ExportResult } from './types';
import { formatArchitectureMarkdown } from './markdownFormatter';
import { extractPrismaSchema } from './prismaExtractor';
import { generatePrdMarkdown } from './prdGenerator';
import { formatSpecJson } from './jsonFormatter';
import { formatCombinedSpecBundle, generateAllSpecFiles } from './bundleFormatter';

export * from './types';
export * from './markdownFormatter';
export * from './prismaExtractor';
export * from './prdGenerator';
export * from './jsonFormatter';
export * from './bundleFormatter';

/**
 * Sanitizes project name to safe file slug.
 */
export function sanitizeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'quzar-ship'
  );
}

/**
 * Orchestrates export for requested format.
 */
export function exportSpecFiles(spec: any, format: ExportFormat = 'all'): ExportResult {
  const baseName = sanitizeFilename(spec?.projectName || spec?.conceptName || 'quzar-ship');
  const allFiles = generateAllSpecFiles(spec);

  switch (format) {
    case 'prisma':
      return {
        filename: 'schema.prisma',
        contentType: 'text/plain; charset=utf-8',
        content: allFiles['schema.prisma'],
        files: allFiles,
      };

    case 'prd':
      return {
        filename: `${baseName}-PRD.md`,
        contentType: 'text/markdown; charset=utf-8',
        content: allFiles['PRD.md'],
        files: allFiles,
      };

    case 'json':
      return {
        filename: `${baseName}-spec.json`,
        contentType: 'application/json; charset=utf-8',
        content: allFiles['spec.json'],
        files: allFiles,
      };

    case 'markdown':
    case 'architecture':
      return {
        filename: `${baseName}-ARCHITECTURE.md`,
        contentType: 'text/markdown; charset=utf-8',
        content: allFiles['ARCHITECTURE.md'],
        files: allFiles,
      };

    case 'all':
    default:
      return {
        filename: `${baseName}-SPEC-PACKAGE.md`,
        contentType: 'text/markdown; charset=utf-8',
        content: formatCombinedSpecBundle(spec),
        files: allFiles,
      };
  }
}
