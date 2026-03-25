/**
 * Приводит идентификатор вида @user:server:sessionSuffix к каноническому Matrix user id @user:server.
 * Суффикс после второго «:» (например LiveKit/Element) не входит в MXID по спецификации.
 */
export function canonicalizeMatrixUserId(raw: string): string {
  const t = raw.trim();
  if (!t.startsWith('@')) {
    return t;
  }
  const body = t.slice(1);
  const c0 = body.indexOf(':');
  if (c0 < 0) {
    return t;
  }
  const c1 = body.indexOf(':', c0 + 1);
  if (c1 < 0) {
    return t;
  }
  return `@${body.slice(0, c1)}`;
}
