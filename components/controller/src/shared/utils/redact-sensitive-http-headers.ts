/** Заголовки, которые нельзя писать в логи и отправлять в сторонние системы как есть */
const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'proxy-authorization',
  'server-secret',
  'x-api-key',
]);

/**
 * Возвращает копию заголовков с маскировкой секретов (JWT, cookies, ключи API).
 */
export function redactSensitiveHttpHeaders(
  headers: Record<string, unknown> | undefined | null
): Record<string, string> | undefined {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADER_NAMES.has(key.toLowerCase())) {
      out[key] = '[REDACTED]';
    } else if (Array.isArray(value)) {
      out[key] = value.map(String).join(', ');
    } else if (value === undefined || value === null) {
      out[key] = '';
    } else {
      out[key] = String(value);
    }
  }
  return out;
}
