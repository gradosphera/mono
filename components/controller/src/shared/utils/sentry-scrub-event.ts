import type { Event } from '@sentry/node';
import { redactSensitiveHttpHeaders } from './redact-sensitive-http-headers';

/**
 * Убирает секреты из события Sentry перед отправкой в облако и перед логированием.
 * Мутирует переданный event (так работает beforeSend).
 */
export function scrubSensitiveDataFromSentryEvent(event: Event): Event {
  if (event.request?.headers) {
    const redacted = redactSensitiveHttpHeaders(event.request.headers as Record<string, unknown>);
    if (redacted) {
      event.request.headers = redacted;
    }
  }

  const breadcrumbs = event.breadcrumbs;
  if (breadcrumbs) {
    for (const b of breadcrumbs) {
      if (b.data && typeof b.data === 'object' && b.data !== null && 'headers' in b.data) {
        const data = b.data as Record<string, unknown>;
        const rh = redactSensitiveHttpHeaders(data.headers as Record<string, unknown>);
        if (rh) {
          data.headers = rh;
        }
      }
    }
  }

  return event;
}
