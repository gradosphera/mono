import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import config from '~/config/config';
import type { WebPushSubscriptionDto } from '../dto/web-push-subscription.dto';
import type { NotificationPayloadDomainInterface } from '~/domain/notification/interfaces/notification-payload-domain.interface';

/**
 * Сервис для отправки web push уведомлений
 * Использует библиотеку web-push для отправки уведомлений в браузеры
 */
@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor() {
    // Настройка VAPID ключей (гарантированно присутствуют благодаря валидации конфигурации)
    const vapidPublicKey = config.vapid.public_key;
    const vapidPrivateKey = config.vapid.private_key;
    const vapidSubject = config.vapid.subject;

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    this.logger.log('VAPID ключи установлены для web push сервиса');
    this.logger.debug(`VAPID Subject: ${vapidSubject}`);
    this.logger.debug(`VAPID Public Key: ${vapidPublicKey.substring(0, 20)}...`);
    this.logger.debug(`VAPID Private Key: ${vapidPrivateKey.substring(0, 20)}...`);
  }

  /**
   * Отправить web push уведомление на одну подписку
   * @param subscription Подписка получателя
   * @param payload Данные уведомления
   * @param onInvalidSubscription Callback для обработки недействительных подписок
   * @returns Promise<boolean> true если успешно отправлено
   */
  async sendNotification(
    subscription: WebPushSubscriptionDto,
    payload: NotificationPayloadDomainInterface,
    onInvalidSubscription?: (subscriptionId: string) => Promise<void>
  ): Promise<boolean> {
    try {
      // VAPID ключи гарантированно настроены благодаря валидации конфигурации

      // Формируем объект подписки для web-push
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dhKey,
          auth: subscription.authKey,
        },
      };

      // Формируем данные уведомления
      const notificationData = {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        image: payload.image,
        url: payload.url,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        actions: payload.actions || [],
        data: payload.data || {},
        vibrate: payload.vibrate,
        timestamp: payload.timestamp || Date.now(),
      };

      this.logger.debug(`Отправка уведомления на endpoint: ${subscription.endpoint.substring(0, 50)}...`);
      this.logger.debug(`Данные уведомления: ${JSON.stringify(notificationData, null, 2)}`);
      this.logger.debug(`Push subscription: ${JSON.stringify(pushSubscription, null, 2)}`);

      // Отправляем уведомление
      const result = await webpush.sendNotification(pushSubscription, JSON.stringify(notificationData), {
        TTL: 24 * 60 * 60, // 24 часа
        urgency: 'normal',
        topic: payload.tag,
      });

      this.logger.debug(`Web push уведомление отправлено успешно: ${subscription.endpoint.substring(0, 50)}...`);
      this.logger.debug(`Результат отправки: ${JSON.stringify(result, null, 2)}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Ошибка отправки web push уведомления: ${error.message}`, error.stack);
      this.logger.error(`Статус код: ${error.statusCode}`);
      this.logger.error(`Заголовки: ${JSON.stringify(error.headers, null, 2)}`);
      this.logger.error(`Тело ошибки: ${JSON.stringify(error.body, null, 2)}`);

      // Если ошибка 410 (Gone) - подписка больше не действительна
      if (error.statusCode === 410) {
        this.logger.warn(`Подписка недействительна (410): ${subscription.endpoint.substring(0, 50)}...`);

        // Вызываем callback для деактивации подписки
        if (onInvalidSubscription) {
          try {
            await onInvalidSubscription(subscription.id);
          } catch (callbackError: any) {
            this.logger.error(`Ошибка обработки недействительной подписки: ${callbackError.message}`);
          }
        }
      }

      return false;
    }
  }

  /**
   * Отправить web push уведомления на несколько подписок
   * @param subscriptions Массив подписок
   * @param payload Данные уведомления
   * @returns Promise<{sent: number, failed: number, invalidSubscriptions: string[]}>
   */
  async sendNotificationToMultiple(
    subscriptions: WebPushSubscriptionDto[],
    payload: NotificationPayloadDomainInterface
  ): Promise<{ sent: number; failed: number; invalidSubscriptions: string[] }> {
    const results = {
      sent: 0,
      failed: 0,
      invalidSubscriptions: [] as string[],
    };
    this.logger.debug(`Отправка уведомлений на ${subscriptions.length} подписок`);

    // Отправляем уведомления параллельно
    const promises = subscriptions.map(async (subscription) => {
      try {
        const success = await this.sendNotification(subscription, payload, async (subscriptionId) => {
          // Добавляем в список недействительных подписок для последующей обработки
          results.invalidSubscriptions.push(subscriptionId);
        });

        this.logger.debug(`Результат отправки для подписки ${subscription.id}: ${success ? 'успешно' : 'ошибка'}`);

        if (success) {
          results.sent++;
        } else {
          results.failed++;
        }
      } catch (error: any) {
        this.logger.error(`Ошибка отправки для подписки ${subscription.id}: ${error.message}`);
        results.failed++;

        // Если подписка недействительна, добавляем в список для удаления
        if (error.statusCode === 410) {
          results.invalidSubscriptions.push(subscription.id);
        }
      }
    });

    await Promise.allSettled(promises);

    this.logger.log(
      `Web push отправка завершена: отправлено ${results.sent}, ошибок ${results.failed}, ` +
        `недействительных подписок ${results.invalidSubscriptions.length}`
    );

    return results;
  }

  /**
   * Проверить валидность VAPID ключей
   * @returns boolean true если ключи настроены (всегда true благодаря валидации конфигурации)
   */
  isConfigured(): boolean {
    return true; // VAPID ключи гарантированно настроены
  }

  /**
   * Получить публичный VAPID ключ для фронтенда
   * @returns string публичный VAPID ключ
   */
  getVapidPublicKey(): string {
    return config.vapid.public_key;
  }
}
