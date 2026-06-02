import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import config from '~/config/config';
import { NotificationChannel } from '~/domain/notification/interfaces/notify-input.domain.interface';
import type {
  ChannelDeliveryResult,
  ChannelMessage,
  EmailChannelPort,
} from '~/domain/notification/interfaces/channel.ports';
import { renderTemplate, resolveTemplate } from '../template.util';

/**
 * Канал «Почта» (SMTP/nodemailer) — реализация {@link EmailChannelPort}.
 *
 * Если SMTP-креды не заданы (`SMTP_HOST` пуст) — канал `disabled`: возвращает
 * провал с пояснением и **не** лезет на дефолтный SMTP (NFR11). Тело письма
 * рендерится из шаблона типа уведомления (каталог `@coopenomics/notifications`).
 */
@Injectable()
export class EmailChannelAdapter implements EmailChannelPort {
  private readonly logger = new Logger(EmailChannelAdapter.name);
  private readonly transporter: Transporter | null;

  constructor() {
    const smtp = config.email.smtp;
    if (!smtp.host) {
      this.transporter = null;
      this.logger.warn('SMTP_HOST не задан — email-канал отключён, письма не отправляются');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: smtp.auth.user ? { user: smtp.auth.user, pass: smtp.auth.pass } : undefined,
    });
  }

  async send(message: ChannelMessage): Promise<ChannelDeliveryResult> {
    if (!this.transporter) {
      return { delivered: false, error: 'email channel disabled (SMTP not configured)' };
    }
    if (!message.recipient.email) {
      return { delivered: false, error: 'recipient has no email' };
    }

    const template = resolveTemplate(message.workflowId, NotificationChannel.EMAIL);
    if (!template) {
      return { delivered: false, error: `no email template for workflow '${message.workflowId}'` };
    }

    const subject = renderTemplate(template.subject, message);
    const html = renderTemplate(template.body, message);

    try {
      const info = await this.transporter.sendMail({
        from: config.email.from,
        to: message.recipient.email,
        subject,
        html,
      });
      return { delivered: true, providerResponse: info.messageId };
    } catch (error: any) {
      this.logger.error(`Ошибка отправки письма на ${message.recipient.email}: ${error.message}`);
      return { delivered: false, error: error.message };
    }
  }
}
