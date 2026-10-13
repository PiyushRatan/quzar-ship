/**
 * bundleFormatter.ts
 * Generates combined multi-document package bundle and dictionary of all export artifacts.
 */

import { formatArchitectureMarkdown } from './markdownFormatter';
import { extractPrismaSchema } from './prismaExtractor';
import { generatePrdMarkdown } from './prdGenerator';
import { formatSpecJson } from './jsonFormatter';

export interface SpecFileBundle {
  [filename: string]: string;
  'ARCHITECTURE.md': string;
  'schema.prisma': string;
  'PRD.md': string;
  'spec.json': string;
}

export function generateAllSpecFiles(spec: any): SpecFileBundle {
  return {
    'ARCHITECTURE.md': formatArchitectureMarkdown(spec),
    'schema.prisma': extractPrismaSchema(spec),
    'PRD.md': generatePrdMarkdown(spec),
    'spec.json': formatSpecJson(spec),
  };
}

export function formatCombinedSpecBundle(spec: any): string {
  const files = generateAllSpecFiles(spec);
  const projectName = spec?.projectName || spec?.conceptName || 'Application';

  return `# Complete Production Specification Package: ${projectName}
> Quzar Ship Architecture Engine // Piyush Ratan Directives 2.0
> Exported Artifacts: ARCHITECTURE.md, schema.prisma, PRD.md, spec.json

================================================================================
FILE: ARCHITECTURE.md
================================================================================

${files['ARCHITECTURE.md']}

================================================================================
FILE: schema.prisma
================================================================================

\`\`\`prisma
${files['schema.prisma']}
\`\`\`

================================================================================
FILE: PRD.md
================================================================================

${files['PRD.md']}

================================================================================
FILE: spec.json
================================================================================

\`\`\`json
${files['spec.json']}
\`\`\`
`;
}
