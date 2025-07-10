/**
 * Доменный интерфейс для payload webhook от NOVU Push Webhook
 * Основан на документации NOVU Push Webhook
 */
export interface WebhookPayloadDomainInterface {
  /**
   * Массив target токенов получателей
   */
  target: string[];

  /**
   * Заголовок уведомления
   */
  title: string;

  /**
   * Содержание уведомления
   */
  content: string;

  /**
   * Дополнительные параметры для кастомизации
   */
  overrides?: {
    data?: Record<string, any>;
    [key: string]: any;
  };

  /**
   * Данные payload от воркфлоу
   */
  payload?: WebhookPayloadDataDomainInterface;
}

/**
 * Доменный интерфейс для данных payload в webhook
 */
export interface WebhookPayloadDataDomainInterface {
  /**
   * Источник воркфлоу
   */
  __source?: string;

  /**
   * Данные подписчика
   */
  subscriber?: WebhookSubscriberDomainInterface;

  /**
   * Данные шага воркфлоу
   */
  step?: WebhookStepDomainInterface;

  /**
   * Кастомные данные от воркфлоу
   */
  [key: string]: any;
}

/**
 * Доменный интерфейс для подписчика в webhook
 */
export interface WebhookSubscriberDomainInterface {
  /**
   * ID подписчика в NOVU
   */
  _id: string;

  /**
   * ID организации
   */
  _organizationId: string;

  /**
   * ID окружения
   */
  _environmentId: string;

  /**
   * Имя
   */
  firstName?: string;

  /**
   * Фамилия
   */
  lastName?: string;

  /**
   * Телефон
   */
  phone?: string;

  /**
   * ID подписчика (username)
   */
  subscriberId: string;

  /**
   * Email
   */
  email?: string;

  /**
   * Каналы коммуникации
   */
  channels?: WebhookChannelDomainInterface[];

  /**
   * Дополнительные данные подписчика
   */
  data?: Record<string, any>;

  /**
   * Флаг удаления
   */
  deleted: boolean;

  /**
   * Дата создания
   */
  createdAt: string;

  /**
   * Дата обновления
   */
  updatedAt: string;

  /**
   * Версия документа
   */
  __v: number;

  /**
   * ID подписчика (дубликат _id)
   */
  id: string;
}

/**
 * Доменный интерфейс для канала коммуникации в webhook
 */
export interface WebhookChannelDomainInterface {
  /**
   * Credentials для канала
   */
  credentials: {
    /**
     * Device tokens для push уведомлений
     */
    deviceTokens: string[];
  };

  /**
   * ID интеграции
   */
  _integrationId: string;

  /**
   * ID провайдера
   */
  providerId: string;
}

/**
 * Доменный интерфейс для шага воркфлоу в webhook
 */
export interface WebhookStepDomainInterface {
  /**
   * Флаг digest
   */
  digest: boolean;

  /**
   * События
   */
  events: any[];

  /**
   * Общее количество
   */
  total_count: number;
}

/**
 * Доменный интерфейс для результата обработки webhook
 */
export interface WebhookProcessResultDomainInterface {
  /**
   * Успешно ли обработан webhook
   */
  success: boolean;

  /**
   * Сообщение результата
   */
  message?: string;

  /**
   * Обработанные device tokens
   */
  processedTokens?: string[];

  /**
   * Ошибки обработки
   */
  errors?: string[];
}
