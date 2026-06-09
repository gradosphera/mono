/**
 * Конфиг релея целиком из ENV. Падаем на старте, если не заданы обязательные
 * параметры (токен + SMTP-хост) — релей без них бессмыслен и молча «глотать»
 * письма нельзя.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`email-relay: обязательная переменная окружения ${name} не задана`);
  }
  return value.trim();
}

function optional(name: string, fallback = ''): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw || !raw.trim()) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface RelayConfig {
  port: number;
  /** Общий секрет: Authorization: Bearer <token>. */
  token: string;
  /** Необязательный allowlist IP (defense-in-depth за TLS). Пусто = выключен. */
  allowlist: string[];
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth?: { user: string; pass: string };
  };
  /** from по умолчанию, если запрос его не прислал. */
  defaultFrom: string;
  /** Максимальный размер тела запроса. */
  bodyLimit: string;
}

export function loadConfig(): RelayConfig {
  const smtpPort = intEnv('SMTP_PORT', 587);
  const user = optional('SMTP_USERNAME');
  const pass = optional('SMTP_PASSWORD');
  return {
    port: intEnv('PORT', 3025),
    token: required('RELAY_TOKEN'),
    allowlist: optional('RELAY_IP_ALLOWLIST')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    smtp: {
      host: required('SMTP_HOST'),
      port: smtpPort,
      // secure=true только для 465 (implicit TLS); 587 = STARTTLS (secure=false).
      secure: optional('SMTP_SECURE') ? optional('SMTP_SECURE') === 'true' : smtpPort === 465,
      auth: user ? { user, pass } : undefined,
    },
    defaultFrom: optional('EMAIL_FROM_DEFAULT'),
    bodyLimit: optional('RELAY_BODY_LIMIT', '1mb'),
  };
}
