/**
 * Доменный интерфейс для создания веб-пуш подписки
 */
export interface CreateWebPushSubscriptionDomainInterface {
  username: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  userAgent?: string;
}
