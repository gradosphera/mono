import { Injectable, Inject, Logger } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { WebPushService } from './web-push.service';
import { DeviceTokenService } from './device-token.service';
import { generateHashFromString } from '~/utils/generate-hash.util';
import type {
  WebhookPayloadDomainInterface,
  WebhookProcessResultDomainInterface,
} from '~/domain/notification/interfaces/webhook-payload-domain.interface';
import type { NotificationPayloadDomainInterface } from '~/domain/notification/interfaces/notification-payload-domain.interface';
import { USER_REPOSITORY, UserRepository } from '~/domain/user/repositories/user.repository';

/**
 * Сервис для обработки webhook'ов от NOVU
 * Обрабатывает входящие push уведомления и доставляет их клиентам
 */
@Injectable()
export class NotificationWebhookService {
  private readonly logger = new Logger(NotificationWebhookService.name);

  constructor(
    private readonly webPushSubscriptionService: SubscriptionService,
    private readonly webPushService: WebPushService,
    private readonly deviceTokenService: DeviceTokenService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {}

  /**
   * Обработка webhook'а от NOVU Push Webhook
   * @param payload Данные webhook'а
   * @returns Promise<WebhookProcessResultDomainInterface>
   */
  async processWebhook(payload: WebhookPayloadDomainInterface): Promise<WebhookProcessResultDomainInterface> {
    this.logger.log(`Обработка webhook: ${payload.title}`);
    this.logger.debug('Получатели:', payload.target);

    const processedTokens: string[] = [];
    const errors: string[] = [];

    try {
      // Проходим по всем target токенам
      for (const deviceToken of payload.target) {
        try {
          await this.processDeviceToken(deviceToken, payload);
          processedTokens.push(deviceToken);
          this.logger.debug(`Токен обработан: ${deviceToken}`);
        } catch (error: any) {
          this.logger.error(`Ошибка обработки токена ${deviceToken}: ${error.message}`, error.stack);
          errors.push(`Token ${deviceToken}: ${error.message}`);
        }
      }

      const result: WebhookProcessResultDomainInterface = {
        success: processedTokens.length > 0,
        message: `Обработано ${processedTokens.length} из ${payload.target.length} токенов`,
        processedTokens,
        errors: errors.length > 0 ? errors : undefined,
      };

      this.logger.log(`Webhook обработан: ${result.message}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Критическая ошибка обработки webhook: ${error.message}`, error.stack);

      return {
        success: false,
        message: `Критическая ошибка: ${error.message}`,
        processedTokens: [],
        errors: [error.message],
      };
    }
  }

  /**
   * Обработка конкретного device token
   * @param deviceToken Device token получателя
   * @param payload Данные webhook'а
   * @returns Promise<void>
   */
  private async processDeviceToken(deviceToken: string, payload: WebhookPayloadDomainInterface): Promise<void> {
    this.logger.debug(`Обработка device token: ${deviceToken}`);

    // Извлекаем данные подписчика из payload
    const subscriberData = payload.payload?.subscriber;

    if (!subscriberData) {
      this.logger.warn(`Нет данных подписчика для токена: ${deviceToken}`);
      return;
    }

    // Ищем пользователя по subscriber_id в БД
    // subscriberId содержит формат "coopname:random_string"
    this.logger.debug(`Поиск пользователя по subscriber_id: ${subscriberData.subscriberId}`);

    const user = await this.userRepository.findBySubscriberId(subscriberData.subscriberId);

    if (!user) {
      this.logger.warn(`Пользователь не найден по subscriber_id: ${subscriberData.subscriberId}`);
      return;
    }

    const username = user.username;
    this.logger.debug(`Найден пользователь по subscriber_id: ${username}`);

    // Создаем уведомление для отправки через веб-пуш
    const notificationPayload: NotificationPayloadDomainInterface = {
      title: payload.title,
      body: payload.content,
      data: {
        // Передаем дополнительные данные
        ...payload.payload,
        source: 'novu-webhook',
        deviceToken,
      },
      // Дополнительные опции уведомления
      icon: payload.overrides?.data?.icon,
      badge: payload.overrides?.data?.badge,
      image: payload.overrides?.data?.image,
      url: payload.overrides?.data?.url,
      tag: payload.overrides?.data?.tag,
      requireInteraction: payload.overrides?.data?.requireInteraction,
      silent: payload.overrides?.data?.silent,
      actions: payload.overrides?.data?.actions,
      vibrate: payload.overrides?.data?.vibrate,
      timestamp: Date.now(),
    };

    this.logger.log(`Отправка уведомления пользователю: ${username} (subscriberId: ${subscriberData.subscriberId})`);

    // Получаем активные подписки пользователя
    const subscriptions = await this.webPushSubscriptionService.getUserSubscriptions(username);

    if (subscriptions.length === 0) {
      this.logger.warn(`Нет активных подписок для пользователя: ${username}`);
      return;
    }

    // Отправляем уведомления на все активные подписки пользователя
    const sendResult = await this.webPushService.sendNotificationToMultiple(subscriptions, notificationPayload);

    this.logger.log(
      `Результат отправки для пользователя ${username}: ` + `отправлено ${sendResult.sent}, ошибок ${sendResult.failed}`
    );

    // Деактивируем недействительные подписки
    if (sendResult.invalidSubscriptions.length > 0) {
      // Получаем все активные подписки для поиска недействительных
      const allSubscriptions = await this.webPushSubscriptionService.getUserSubscriptions(username);

      for (const subscriptionId of sendResult.invalidSubscriptions) {
        try {
          // Находим подписку по ID для получения endpoint
          const targetSubscription = allSubscriptions.find((sub) => sub.id === subscriptionId);

          if (targetSubscription) {
            // Генерируем device token для этой подписки
            const deviceToken = generateHashFromString(targetSubscription.endpoint);

            // Удаляем device token из NOVU перед деактивацией
            try {
              await this.deviceTokenService.removeDeviceTokenForUser(username, deviceToken);
              this.logger.log(`Device token удален для недействительной подписки: ${subscriptionId}`);
            } catch (error: any) {
              this.logger.error(`Ошибка удаления device token для подписки ${subscriptionId}: ${error.message}`);
            }
          }

          await this.webPushSubscriptionService.deactivateSubscriptionById(subscriptionId);
          this.logger.log(`Деактивирована недействительная подписка: ${subscriptionId}`);
        } catch (error: any) {
          this.logger.error(`Ошибка деактивации подписки ${subscriptionId}: ${error.message}`);
        }
      }
    }
  }
}
