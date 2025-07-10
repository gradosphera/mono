/**
 * Доменный интерфейс для данных подписки из клиента
 */
export interface WebPushSubscriptionDataDomainInterface {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
