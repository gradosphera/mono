export const RESULT_DOCUMENT_PAYLOAD_VERSION = 2 as const;

export interface ResultDocumentPayloadV2 {
  v: typeof RESULT_DOCUMENT_PAYLOAD_VERSION;
  meta: { contributor: string; project_hash: string };
  /** Текст результата в Markdown (ТЗ, задачи, исполнение — без диффов). */
  markdown: string;
  /** HTML-фрагменты диффов коммитов (как раньше в документе). */
  diffHtmlBlocks: string[];
}

export function isResultDocumentPayloadV2(x: unknown): x is ResultDocumentPayloadV2 {
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

/** Тело для вставки в экспортируемый .md (markdown + сырые HTML-блоки диффов). */
export function resultDocumentPayloadToExportMarkdown(payload: ResultDocumentPayloadV2): string {
  return [payload.markdown, ...payload.diffHtmlBlocks].filter((s) => s.length > 0).join('\n\n');
}
