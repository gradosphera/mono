import type { Request } from 'express';

/**
 * Корневые поля `Mutation` из GraphQL-схемы: для таких запросов **не** прогоняется
 * `xss-clean` по всему `req.body`, чтобы не ломать XML/спецсимволы в variables
 * (например `description` у требований BPMN/draw.io).
 *
 * Остальные GraphQL-операции по-прежнему санитизируются.
 *
 * Сопоставление:
 * - `operationName` в теле JSON (Playground, часть клиентов);
 * - иначе эвристика по строке `query`: вхождение `имяПоля(` (как у Zeus/desktop без operationName).
 */
export const GRAPHQL_ROOT_FIELDS_SKIP_XSS: ReadonlySet<string> = new Set([
  'capitalCreateStory',
  'capitalUpdateStory',
]);

function singleGraphqlPayloadShouldSkipXss(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const body = payload as { operationName?: unknown; query?: unknown };

  if (typeof body.operationName === 'string' && GRAPHQL_ROOT_FIELDS_SKIP_XSS.has(body.operationName)) {
    return true;
  }

  if (typeof body.query !== 'string') {
    return false;
  }

  for (const field of GRAPHQL_ROOT_FIELDS_SKIP_XSS) {
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\s*\\(`).test(body.query)) {
      return true;
    }
  }

  return false;
}

/** true — пропустить xss-clean для этого HTTP-запроса (уже после express.json). */
export function graphqlHttpBodyShouldSkipXss(req: Request): boolean {
  if (req.method !== 'POST') {
    return false;
  }
  const p = req.path ?? '';
  if (p !== '/v1/graphql' && !p.endsWith('/v1/graphql')) {
    return false;
  }

  const raw = req.body;
  if (Array.isArray(raw)) {
    return raw.some((item) => singleGraphqlPayloadShouldSkipXss(item));
  }

  return singleGraphqlPayloadShouldSkipXss(raw);
}
