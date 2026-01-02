import type { WebPushSubscriptionDomainInterface } from './web-push-subscription-domain.interface';
import type { CreateWebPushSubscriptionDomainInterface } from './create-web-push-subscription-domain.interface';
import type { SubscriptionStatsDomainInterface } from './subscription-stats-domain.interface';

/**
 * Порт для работы с веб-пуш подписками
 * Определяет интерфейс для взаимодействия с репозиторием подписок
 */
export interface NotificationPort {
  /**
   * Сохранить веб-пуш подписку
   * @param data Данные подписки
   * @returns Promise<WebPushSubscriptionDomainInterface>
   */
  saveSubscription(data: CreateWebPushSubscriptionDomainInterface): Promise<WebPushSubscriptionDomainInterface>;

  /**
   * Найти подписку по endpoint
   * @param endpoint Endpoint подписки
   * @returns Promise<WebPushSubscriptionDomainInterface | null>
   */
  findByEndpoint(endpoint: string): Promise<WebPushSubscriptionDomainInterface | null>;

  /**
   * Получить все активные подписки пользователя
   * @param username Username пользователя
   * @returns Promise<WebPushSubscriptionDomainInterface[]>
   */
  getUserSubscriptions(username: string): Promise<WebPushSubscriptionDomainInterface[]>;

  /**
   * Получить все активные подписки
   * @returns Promise<WebPushSubscriptionDomainInterface[]>
   */
  getAllActiveSubscriptions(): Promise<WebPushSubscriptionDomainInterface[]>;

  /**
   * Деактивировать подписку по endpoint
   * @param endpoint Endpoint подписки
   * @returns Promise<void>
   */
  deactivateSubscription(endpoint: string): Promise<void>;

  /**
   * Деактивировать подписку по ID
   * @param id ID подписки
   * @returns Promise<void>
   */
  deactivateSubscriptionById(id: string): Promise<void>;

  /**
   * Удалить неактивные подписки старше указанного количества дней
   * @param olderThanDays Количество дней
   * @returns Promise<number> Количество удаленных подписок
   */
  cleanupInactiveSubscriptions(olderThanDays: number): Promise<number>;

  /**
   * Получить статистику подписок
   * @returns Promise<SubscriptionStatsDomainInterface>
   */
  getSubscriptionStats(): Promise<SubscriptionStatsDomainInterface>;

  /**
   * Обновить подписку
   * @param endpoint Endpoint подписки
   * @param data Данные для обновления
   * @returns Promise<WebPushSubscriptionDomainInterface>
   */
  updateSubscription(
    endpoint: string,
    data: Partial<CreateWebPushSubscriptionDomainInterface>
  ): Promise<WebPushSubscriptionDomainInterface>;
}

/**
 * Токен для внедрения зависимости
 */
export const NOTIFICATION_SUBSCRIPTION_PORT = Symbol('NotificationPort');
