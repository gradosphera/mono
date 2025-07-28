/**
 * Enum для типов провайдеров уведомлений
 * Доменный enum, независимый от NOVU
 */
export enum NotificationProviderEnum {
  SLACK = 'slack',
  DISCORD = 'discord',
  MSTEAMS = 'msteams',
  MATTERMOST = 'mattermost',
  RYVER = 'ryver',
  ZULIP = 'zulip',
  GRAFANA_ON_CALL = 'grafana-on-call',
  GETSTREAM = 'getstream',
  ROCKET_CHAT = 'rocket-chat',
  WHATSAPP_BUSINESS = 'whatsapp-business',
  FCM = 'fcm',
  APNS = 'apns',
  EXPO = 'expo',
  ONE_SIGNAL = 'one-signal',
  PUSHPAD = 'pushpad',
  PUSH_WEBHOOK = 'push-webhook',
  PUSHER_BEAMS = 'pusher-beams',
}

/**
 * Доменный интерфейс для device token
 * Представляет токен устройства для push уведомлений в NOVU
 */
export interface DeviceTokenDomainInterface {
  /**
   * Уникальный идентификатор токена устройства
   * Для NOVU Push Webhook это может быть любая строка
   */
  token: string;

  /**
   * Username пользователя (связь с веб-пуш подпиской)
   */
  username: string;

  /**
   * Тип провайдера для токена
   */
  providerId: NotificationProviderEnum;

  /**
   * Дополнительные данные для интеграции
   */
  integrationIdentifier?: string;

  /**
   * Метаданные устройства
   */
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    browser?: string;
    endpoint?: string; // endpoint веб-пуш подписки
  };

  /**
   * Дата создания токена
   */
  createdAt: Date;

  /**
   * Дата последнего обновления токена
   */
  updatedAt: Date;

  /**
   * Активен ли токен
   */
  isActive: boolean;
}

/**
 * Интерфейс для создания нового device token
 */
export interface CreateDeviceTokenDomainInterface {
  /**
   * Уникальный идентификатор токена устройства
   */
  token: string;

  /**
   * Username пользователя
   */
  username: string;

  /**
   * Тип провайдера для токена
   */
  providerId: NotificationProviderEnum;

  /**
   * Дополнительные данные для интеграции
   */
  integrationIdentifier?: string;

  /**
   * Метаданные устройства
   */
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    browser?: string;
    endpoint?: string;
  };
}

/**
 * Интерфейс для обновления credentials в NOVU
 */
export interface UpdateCredentialsDomainInterface {
  /**
   * ID подписчика в NOVU
   */
  subscriberId: string;

  /**
   * ID провайдера
   */
  providerId: NotificationProviderEnum;

  /**
   * Массив device tokens для подписчика
   */
  deviceTokens: string[];

  /**
   * Дополнительные данные для credentials
   */
  additionalData?: Record<string, any>;

  /**
   * Идентификатор интеграции
   */
  integrationIdentifier?: string;
}
