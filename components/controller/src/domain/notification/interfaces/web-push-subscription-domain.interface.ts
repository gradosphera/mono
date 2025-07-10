/**
 * Доменный интерфейс для данных веб-пуш подписки
 */
export interface WebPushSubscriptionDomainInterface {
  id: string;
  username: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Доменный интерфейс для создания веб-пуш подписки
 */
export interface CreateWebPushSubscriptionDomainInterface {
  userId: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  userAgent?: string;
}

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

/**
 * Доменный интерфейс для полезной нагрузки уведомления
 */
export interface NotificationPayloadDomainInterface {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationActionDomainInterface[];
  data?: Record<string, any>;
  vibrate?: number[];
  timestamp?: number;
}

/**
 * Доменный интерфейс для действий уведомления
 */
export interface NotificationActionDomainInterface {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Доменный интерфейс для статистики подписок
 */
export interface SubscriptionStatsDomainInterface {
  total: number;
  active: number;
  inactive: number;
  uniqueUsers: number;
}

/**
 * Доменный интерфейс для входных данных создания подписки
 */
export interface CreateSubscriptionInputDomainInterface {
  userId: string;
  subscription: WebPushSubscriptionDataDomainInterface;
  userAgent?: string;
}
