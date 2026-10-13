/**
 * jsonFormatter.ts
 * Formats the raw structured JSON representation of the specification.
 */

export function formatSpecJson(spec: any): string {
  try {
    return JSON.stringify(spec, null, 2);
  } catch (err: any) {
    return JSON.stringify({ error: 'Failed to serialize specification', message: err?.message }, null, 2);
  }
}
