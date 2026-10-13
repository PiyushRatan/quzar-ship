/**
 * Utility functions for Quzar Ship adhering to Directives 2.0
 */

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain;charset=utf-8'
): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatUtcIso(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}
