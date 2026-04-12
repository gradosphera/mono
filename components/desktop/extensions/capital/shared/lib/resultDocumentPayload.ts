/** Соответствует ResultDocumentPayloadV2 в controller (capital/domain/result-document-payload.ts). */
export const RESULT_DOCUMENT_PAYLOAD_VERSION = 2 as const;

export interface ResultDocumentPayloadV2 {
  v: typeof RESULT_DOCUMENT_PAYLOAD_VERSION;
  meta: { contributor: string; project_hash: string };
  markdown: string;
  diffHtmlBlocks: string[];
}

function isResultDocumentPayloadV2(x: unknown): x is ResultDocumentPayloadV2 {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    o.v === RESULT_DOCUMENT_PAYLOAD_VERSION &&
    typeof o.markdown === 'string' &&
    Array.isArray(o.diffHtmlBlocks) &&
    o.diffHtmlBlocks.every((b) => typeof b === 'string') &&
    typeof o.meta === 'object' &&
    o.meta !== null &&
    typeof (o.meta as Record<string, unknown>).contributor === 'string' &&
    typeof (o.meta as Record<string, unknown>).project_hash === 'string'
  );
}

export function tryParseResultDocumentPayload(raw: string): ResultDocumentPayloadV2 | null {
  const t = raw.trim();
  if (!t.startsWith('{')) return null;
  try {
    const parsed: unknown = JSON.parse(t);
    return isResultDocumentPayloadV2(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export type ParsedResultData =
  | { kind: 'v2'; markdown: string; diffHtmlBlocks: string[] }
  | { kind: 'legacy_html'; html: string };

export function parseCapitalResultData(data: string): ParsedResultData {
  const parsed = tryParseResultDocumentPayload(data);
  if (parsed) {
    return { kind: 'v2', markdown: parsed.markdown, diffHtmlBlocks: parsed.diffHtmlBlocks };
  }
  return { kind: 'legacy_html', html: data };
}
