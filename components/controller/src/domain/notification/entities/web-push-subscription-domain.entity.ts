import type { WebPushSubscriptionDomainInterface } from '../interfaces/web-push-subscription-domain.interface';

/**
 * Доменная сущность для веб-пуш подписки
 * Содержит бизнес-логику работы с подписками
 */
export class WebPushSubscriptionDomainEntity implements WebPushSubscriptionDomainInterface {
  public readonly id: string;
  public readonly userId: string;
  public readonly endpoint: string;
  public readonly p256dhKey: string;
  public readonly authKey: string;
  public readonly userAgent?: string;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: WebPushSubscriptionDomainInterface) {
    this.id = data.id;
    this.userId = data.userId;
    this.endpoint = data.endpoint;
    this.p256dhKey = data.p256dhKey;
    this.authKey = data.authKey;
    this.userAgent = data.userAgent;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Преобразует подписку в формат для отправки через web-push библиотеку
   * @returns Объект подписки в формате web-push
   */
  toWebPushSubscription(): { endpoint: string; keys: { p256dh: string; auth: string } } {
    return {
      endpoint: this.endpoint,
      keys: {
        p256dh: this.p256dhKey,
        auth: this.authKey,
      },
    };
  }

  /**
   * Проверяет, активна ли подписка
   * @returns true, если подписка активна
   */
  isSubscriptionActive(): boolean {
    return this.isActive;
  }

  /**
   * Проверяет, принадлежит ли подписка указанному пользователю
   * @param userId ID пользователя
   * @returns true, если подписка принадлежит пользователю
   */
  belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Получает сокращенный endpoint для логирования
   * @returns Сокращенный endpoint
   */
  getShortEndpoint(): string {
    return this.endpoint.substring(0, 50) + '...';
  }

  /**
   * Создает копию сущности с обновленными данными
   * @param updates Обновления для сущности
   * @returns Новая сущность с обновленными данными
   */
  update(updates: Partial<WebPushSubscriptionDomainInterface>): WebPushSubscriptionDomainEntity {
    return new WebPushSubscriptionDomainEntity({
      ...this,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Деактивирует подписку
   * @returns Новая сущность с деактивированной подпиской
   */
  deactivate(): WebPushSubscriptionDomainEntity {
    return this.update({ isActive: false });
  }

  /**
   * Активирует подписку
   * @returns Новая сущность с активированной подпиской
   */
  activate(): WebPushSubscriptionDomainEntity {
    return this.update({ isActive: true });
  }
}
