export type ExportFormat = 'markdown' | 'architecture' | 'prisma' | 'prd' | 'json' | 'all';

export interface ExportResult {
  filename: string;
  contentType: string;
  content: string;
  files?: Record<string, string>;
}

export interface ExportPayload {
  spec: any;
  format?: ExportFormat;
}
