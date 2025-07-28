import type {
  UpdateCredentialsDomainInterface,
  DeviceTokenDomainInterface,
  NotificationProviderEnum,
} from './device-token-domain.interface';

/**
 * Порт для управления NOVU credentials
 * Определяет интерфейс для работы с device tokens подписчиков
 */
export interface NovuCredentialsPort {
  /**
   * Обновить credentials подписчика (добавить device tokens)
   * @param credentialsData Данные для обновления credentials
   * @returns Promise<void>
   */
  updateSubscriberCredentials(credentialsData: UpdateCredentialsDomainInterface): Promise<void>;

  /**
   * Получить credentials подписчика
   * @param subscriberId ID подписчика
   * @param providerId ID провайдера
   * @returns Promise<DeviceTokenDomainInterface[]>
   */
  getSubscriberCredentials(
    subscriberId: string,
    providerId: NotificationProviderEnum
  ): Promise<DeviceTokenDomainInterface[]>;

  /**
   * Удалить credentials подписчика для определенного провайдера
   * @param subscriberId ID подписчика
   * @param providerId ID провайдера
   * @returns Promise<void>
   */
  deleteSubscriberCredentials(subscriberId: string, providerId: NotificationProviderEnum): Promise<void>;

  /**
   * Удалить конкретный device token из credentials подписчика
   * @param subscriberId ID подписчика
   * @param providerId ID провайдера
   * @param deviceToken Device token для удаления
   * @returns Promise<void>
   */
  removeDeviceToken(subscriberId: string, providerId: NotificationProviderEnum, deviceToken: string): Promise<void>;

  /**
   * Добавить device token в credentials подписчика
   * @param subscriberId ID подписчика
   * @param providerId ID провайдера
   * @param deviceToken Device token для добавления
   * @param integrationIdentifier Идентификатор интеграции
   * @returns Promise<void>
   */
  addDeviceToken(
    subscriberId: string,
    providerId: NotificationProviderEnum,
    deviceToken: string,
    integrationIdentifier?: string
  ): Promise<void>;
}

/**
 * Символ для инъекции зависимости
 */
export const NOVU_CREDENTIALS_PORT = Symbol('NovuCredentialsPort');
