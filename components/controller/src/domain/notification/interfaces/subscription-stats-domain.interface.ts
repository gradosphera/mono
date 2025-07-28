/**
 * Доменный интерфейс для статистики подписок
 */
export interface SubscriptionStatsDomainInterface {
  total: number;
  active: number;
  inactive: number;
  uniqueUsers: number;
}
