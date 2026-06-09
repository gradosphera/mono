import crypto from 'node:crypto';
import express, { type Request, type Response, type NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { loadConfig } from './config';

const config = loadConfig();

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: config.smtp.auth,
});

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: config.bodyLimit }));

function log(level: 'info' | 'warn' | 'error', msg: string): void {
  // Без секретов в логах. Релей stateless, структурного логгера не тянем.
  // eslint-disable-next-line no-console
  console[level](`[email-relay] ${msg}`);
}

/** Constant-time сравнение токена — без утечки по времени. */
function tokenMatches(provided: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(config.token);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function clientIp(req: Request): string {
  // За nginx реальный IP в X-Real-IP / первом X-Forwarded-For.
  const xff = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  return (req.headers['x-real-ip'] as string | undefined) || xff || req.ip || '';
}

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (config.allowlist.length > 0) {
    const ip = clientIp(req);
    if (!config.allowlist.includes(ip)) {
      log('warn', `отказ по IP-allowlist: ${ip}`);
      res.status(403).json({ error: 'forbidden' });
      return;
    }
  }
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !tokenMatches(token)) {
    log('warn', 'отказ: неверный Bearer-токен');
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

interface SendBody {
  from?: string;
  to?: string;
  subject?: string;
  html?: string;
  text?: string;
}

app.post('/send', authMiddleware, async (req: Request, res: Response) => {
  const body = (req.body || {}) as SendBody;
  const to = body.to;
  const from = body.from || config.defaultFrom;
  const subject = body.subject ?? '';

  if (!to) {
    res.status(400).json({ error: 'поле to обязательно' });
    return;
  }
  if (!from) {
    res.status(400).json({ error: 'не задан from (и нет EMAIL_FROM_DEFAULT)' });
    return;
  }
  if (!body.html && !body.text) {
    res.status(400).json({ error: 'нужно тело письма: html или text' });
    return;
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, html: body.html, text: body.text });
    log('info', `письмо отправлено → ${to} (${info.messageId})`);
    res.json({ delivered: true, messageId: info.messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log('error', `ошибка SMTP при отправке на ${to}: ${message}`);
    res.status(502).json({ delivered: false, error: message });
  }
});

app.listen(config.port, () => {
  log('info', `слушает :${config.port}, SMTP ${config.smtp.host}:${config.smtp.port} (secure=${config.smtp.secure})`);
});
