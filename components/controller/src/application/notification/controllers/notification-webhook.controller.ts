import { Controller, Post, Body, Headers, Logger, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { NotificationWebhookService } from '../services/notification-webhook.service';
import type { WebhookPayloadDomainInterface } from '~/domain/notification/interfaces/webhook-payload-domain.interface';
import { WebhookValidationUtil } from '~/utils/webhook-validation.util';
import config from '~/config/config';

/**
 * REST контроллер для обработки webhook'ов от NOVU Push Webhook
 */
@Controller('notifications/webhook')
export class NotificationWebhookController {
  private readonly logger = new Logger(NotificationWebhookController.name);
  private readonly secretKey: string;

  constructor(private readonly notificationWebhookService: NotificationWebhookService) {
    // Получаем секретный ключ из конфигурации
    this.secretKey = config.novu.webhook_secret;
  }

  /**
   * Обработка webhook'а от NOVU Push Webhook
   * @param payload Данные webhook'а
   * @param novuSignature Подпись от NOVU
   * @returns Promise<{ success: boolean; message?: string }>
   */
  @Post('push')
  @HttpCode(HttpStatus.OK)
  async handlePushWebhook(
    @Body() payload: WebhookPayloadDomainInterface,
    @Headers('x-novu-signature') novuSignature: string
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log('Получен webhook от NOVU Push Webhook');
    this.logger.debug('Payload:', JSON.stringify(payload, null, 2));

    try {
      // Валидируем подпись HMAC
      this.validateHmacSignature(payload, novuSignature);

      // Обрабатываем webhook
      const result = await this.notificationWebhookService.processWebhook(payload);

      this.logger.log('Webhook успешно обработан');
      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error: any) {
      this.logger.error(`Ошибка обработки webhook: ${error.message}`, error.stack);

      if (error.message.includes('Invalid signature')) {
        throw new BadRequestException('Invalid webhook signature');
      }

      throw error;
    }
  }

  /**
   * Валидация HMAC подписи webhook'а
   * @param payload Данные webhook'а
   * @param novuSignature Подпись от NOVU
   * @returns void
   */
  private validateHmacSignature(payload: WebhookPayloadDomainInterface, novuSignature: string): void {
    if (!novuSignature) {
      throw new Error('Missing x-novu-signature header');
    }
    // Валидируем подпись с помощью утилиты
    const isValid = WebhookValidationUtil.validateHmacSignatureSafe(payload, novuSignature, this.secretKey);

    if (!isValid) {
      this.logger.warn('Валидация подписи webhook не удалась');
      throw new Error('Invalid signature');
    }

    this.logger.debug('Валидация подписи webhook успешна');
  }
}
