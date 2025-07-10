/**
 * Доменный интерфейс для действий уведомления
 */
export interface NotificationActionDomainInterface {
  action: string;
  title: string;
  icon?: string;
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
