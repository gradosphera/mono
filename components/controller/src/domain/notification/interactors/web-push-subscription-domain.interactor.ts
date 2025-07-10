import { Injectable, Logger, Inject } from '@nestjs/common';
import { WebPushSubscriptionDomainEntity } from '../entities/web-push-subscription-domain.entity';
import { WebPushSubscriptionPort, WEB_PUSH_SUBSCRIPTION_PORT } from '../interfaces/web-push-subscription.port';
import type {
  CreateSubscriptionInputDomainInterface,
  SubscriptionStatsDomainInterface,
  NotificationPayloadDomainInterface,
} from '../interfaces/web-push-subscription-domain.interface';

/**
 * Доменный интерактор для управления веб-пуш подписками
 * Содержит основную бизнес-логику работы с подписками
 */
@Injectable()
export class WebPushSubscriptionDomainInteractor {
  private readonly logger = new Logger(WebPushSubscriptionDomainInteractor.name);

  constructor(
    @Inject(WEB_PUSH_SUBSCRIPTION_PORT)
    private readonly webPushSubscriptionPort: WebPushSubscriptionPort
  ) {}

  /**
   * Создать или обновить веб-пуш подписку
   * @param data Входные данные для создания подписки
   * @returns Promise<WebPushSubscriptionDomainEntity>
   */
  async createOrUpdateSubscription(data: CreateSubscriptionInputDomainInterface): Promise<WebPushSubscriptionDomainEntity> {
    this.logger.log(`Создание/обновление подписки для пользователя ${data.userId}`);

    // Валидация входных данных
    this.validateSubscriptionData(data);

    // Проверяем, существует ли уже подписка с таким endpoint
    const existingSubscription = await this.webPushSubscriptionPort.findByEndpoint(data.subscription.endpoint);

    if (existingSubscription) {
      // Обновляем существующую подписку
      const updatedSubscription = await this.webPushSubscriptionPort.updateSubscription(data.subscription.endpoint, {
        userId: data.userId,
        p256dhKey: data.subscription.keys.p256dh,
        authKey: data.subscription.keys.auth,
        userAgent: data.userAgent,
      });

      this.logger.log(`Подписка обновлена: ${updatedSubscription.id}`);
      return new WebPushSubscriptionDomainEntity(updatedSubscription);
    }

    // Создаем новую подписку
    const newSubscription = await this.webPushSubscriptionPort.saveSubscription({
      userId: data.userId,
      endpoint: data.subscription.endpoint,
      p256dhKey: data.subscription.keys.p256dh,
      authKey: data.subscription.keys.auth,
      userAgent: data.userAgent,
    });

    this.logger.log(`Новая подписка создана: ${newSubscription.id}`);
    return new WebPushSubscriptionDomainEntity(newSubscription);
  }

  /**
   * Получить все активные подписки пользователя
   * @param userId ID пользователя
   * @returns Promise<WebPushSubscriptionDomainEntity[]>
   */
  async getUserSubscriptions(userId: string): Promise<WebPushSubscriptionDomainEntity[]> {
    this.logger.debug(`Получение подписок для пользователя ${userId}`);

    const subscriptions = await this.webPushSubscriptionPort.getUserSubscriptions(userId);
    return subscriptions.map((subscription) => new WebPushSubscriptionDomainEntity(subscription));
  }

  /**
   * Получить все активные подписки
   * @returns Promise<WebPushSubscriptionDomainEntity[]>
   */
  async getAllActiveSubscriptions(): Promise<WebPushSubscriptionDomainEntity[]> {
    this.logger.debug('Получение всех активных подписок');

    const subscriptions = await this.webPushSubscriptionPort.getAllActiveSubscriptions();
    return subscriptions.map((subscription) => new WebPushSubscriptionDomainEntity(subscription));
  }

  /**
   * Деактивировать подписку по endpoint
   * @param endpoint Endpoint подписки
   * @returns Promise<void>
   */
  async deactivateSubscription(endpoint: string): Promise<void> {
    this.logger.log(`Деактивация подписки с endpoint: ${endpoint.substring(0, 50)}...`);

    await this.webPushSubscriptionPort.deactivateSubscription(endpoint);
  }

  /**
   * Деактивировать подписку по ID
   * @param subscriptionId ID подписки
   * @returns Promise<void>
   */
  async deactivateSubscriptionById(subscriptionId: string): Promise<void> {
    this.logger.log(`Деактивация подписки с ID: ${subscriptionId}`);

    await this.webPushSubscriptionPort.deactivateSubscriptionById(subscriptionId);
  }

  /**
   * Очистить неактивные подписки
   * @param olderThanDays Количество дней
   * @returns Promise<number> Количество удаленных подписок
   */
  async cleanupInactiveSubscriptions(olderThanDays: number = 30): Promise<number> {
    this.logger.log(`Очистка неактивных подписок старше ${olderThanDays} дней`);

    const deletedCount = await this.webPushSubscriptionPort.cleanupInactiveSubscriptions(olderThanDays);

    this.logger.log(`Очищено ${deletedCount} неактивных подписок`);
    return deletedCount;
  }

  /**
   * Получить статистику подписок
   * @returns Promise<SubscriptionStatsDomainInterface>
   */
  async getSubscriptionStats(): Promise<SubscriptionStatsDomainInterface> {
    this.logger.debug('Получение статистики подписок');

    return await this.webPushSubscriptionPort.getSubscriptionStats();
  }

  /**
   * Отправить уведомление пользователю
   * Примечание: Пока не реализована отправка, только заглушка для интерфейса
   * @param userId ID пользователя
   * @param payload Данные уведомления
   * @returns Promise<void>
   */
  async sendNotificationToUser(userId: string, payload: NotificationPayloadDomainInterface): Promise<void> {
    this.logger.log(`Отправка уведомления пользователю ${userId}: ${payload.title}`);

    // TODO: Реализовать отправку уведомлений через интеграцию с NOVU
    // Пока просто логируем, что уведомление должно быть отправлено

    const subscriptions = await this.getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
      this.logger.warn(`Нет активных подписок для пользователя ${userId}`);
      return;
    }

    this.logger.log(`Найдено ${subscriptions.length} активных подписок для пользователя ${userId}`);
    // Здесь будет интеграция с NOVU для отправки уведомлений
  }

  /**
   * Отправить уведомление всем пользователям
   * Примечание: Пока не реализована отправка, только заглушка для интерфейса
   * @param payload Данные уведомления
   * @returns Promise<void>
   */
  async sendNotificationToAll(payload: NotificationPayloadDomainInterface): Promise<void> {
    this.logger.log(`Отправка уведомления всем пользователям: ${payload.title}`);

    // TODO: Реализовать отправку уведомлений через интеграцию с NOVU
    // Пока просто логируем, что уведомление должно быть отправлено

    const subscriptions = await this.getAllActiveSubscriptions();

    if (subscriptions.length === 0) {
      this.logger.warn('Нет активных подписок');
      return;
    }

    this.logger.log(`Найдено ${subscriptions.length} активных подписок для отправки`);
    // Здесь будет интеграция с NOVU для отправки уведомлений
  }

  /**
   * Валидация данных подписки
   * @param data Данные подписки
   */
  private validateSubscriptionData(data: CreateSubscriptionInputDomainInterface): void {
    if (!data.userId || typeof data.userId !== 'string') {
      throw new Error('userId обязателен и должен быть строкой');
    }

    if (!data.subscription || typeof data.subscription !== 'object') {
      throw new Error('subscription обязателен и должен быть объектом');
    }

    if (!data.subscription.endpoint || typeof data.subscription.endpoint !== 'string') {
      throw new Error('endpoint обязателен и должен быть строкой');
    }

    if (!data.subscription.keys || typeof data.subscription.keys !== 'object') {
      throw new Error('keys обязательны и должны быть объектом');
    }

    if (!data.subscription.keys.p256dh || typeof data.subscription.keys.p256dh !== 'string') {
      throw new Error('p256dh ключ обязателен и должен быть строкой');
    }

    if (!data.subscription.keys.auth || typeof data.subscription.keys.auth !== 'string') {
      throw new Error('auth ключ обязателен и должен быть строкой');
    }
  }
}
