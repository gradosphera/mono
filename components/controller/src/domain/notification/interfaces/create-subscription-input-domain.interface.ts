import type { WebPushSubscriptionDataDomainInterface } from './web-push-subscription-data-domain.interface';

/**
 * Доменный интерфейс для входных данных создания подписки
 */
export interface CreateSubscriptionInputDomainInterface {
  username: string;
  subscription: WebPushSubscriptionDataDomainInterface;
  userAgent?: string;
}
