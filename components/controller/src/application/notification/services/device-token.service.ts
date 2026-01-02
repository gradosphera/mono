import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOVU_CREDENTIALS_PORT, type NovuCredentialsPort } from '~/domain/notification/interfaces/novu-credentials.port';
import {
  CreateDeviceTokenDomainInterface,
  DeviceTokenDomainInterface,
  NotificationProviderEnum,
} from '~/domain/notification/interfaces/device-token-domain.interface';
import type { UpdateCredentialsDomainInterface } from '~/domain/notification/interfaces/device-token-domain.interface';
import { generateHashFromString } from '~/utils/generate-hash.util';
import { NotificationInteractor } from '../interactors/notification.interactor';
import type { WebPushSubscriptionDto } from '~/application/notification/dto/web-push-subscription.dto';
import { ACCOUNT_DOMAIN_SERVICE, AccountDomainService } from '~/domain/account/services/account-domain.service';

/**
 * Сервис управления device tokens для push уведомлений
 * Синхронизирует device tokens с веб-пуш подписками в NOVU
 */
@Injectable()
export class DeviceTokenService {
  private readonly logger = new Logger(DeviceTokenService.name);
  private readonly pushWebhookProviderId: NotificationProviderEnum;

  constructor(
    @Inject(NOVU_CREDENTIALS_PORT)
    private readonly novuCredentialsPort: NovuCredentialsPort,
    private readonly notificationInteractor: NotificationInteractor,
    @Inject(ACCOUNT_DOMAIN_SERVICE)
    private readonly accountDomainService: AccountDomainService
  ) {
    // Используем PUSH_WEBHOOK провайдер для веб-пуш уведомлений
    this.pushWebhookProviderId = NotificationProviderEnum.PUSH_WEBHOOK;
  }

  /**
   * Создать device token для пользователя на основе веб-пуш подписки
   * @param username Username пользователя
   * @param subscription Веб-пуш подписка
   * @returns Promise<DeviceTokenDomainInterface>
   */
  async createDeviceTokenFromSubscription(
    username: string,
    subscription: WebPushSubscriptionDto
  ): Promise<DeviceTokenDomainInterface> {
    this.logger.log(`Создание device token для пользователя: ${username}`);

    // Получаем аккаунт пользователя для получения правильного subscriber_id
    const account = await this.accountDomainService.getAccount(username);

    if (!account.provider_account?.subscriber_id) {
      throw new Error(`Не найден subscriber_id для пользователя ${username}`);
    }

    // Генерируем уникальный device token на основе endpoint подписки
    const deviceToken = this.generateDeviceTokenFromEndpoint(subscription.endpoint);

    const createDeviceTokenData: CreateDeviceTokenDomainInterface = {
      token: deviceToken,
      username,
      providerId: this.pushWebhookProviderId,
      integrationIdentifier: this.generateIntegrationIdentifier(),
      deviceInfo: {
        endpoint: subscription.endpoint,
        userAgent: subscription.userAgent,
        // Можно добавить больше информации из subscription
      },
    };

    // Создаем device token в домене
    const deviceTokenDomain: DeviceTokenDomainInterface = {
      ...createDeviceTokenData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // Обновляем credentials в NOVU с правильным subscriber_id
    await this.updateNovuCredentials(account.provider_account.subscriber_id, [deviceToken]);

    this.logger.log(`Device token создан для пользователя: ${account.provider_account.subscriber_id}`);
    return deviceTokenDomain;
  }

  /**
   * Обновить device tokens для пользователя
   * @param subscriberId Subscriber ID пользователя
   * @param deviceTokens Список device tokens
   * @returns Promise<void>
   */
  async updateDeviceTokensForUser(subscriberId: string, deviceTokens: string[]): Promise<void> {
    this.logger.log(`Обновление device tokens для пользователя: ${subscriberId}, токенов: ${deviceTokens.length}`);

    await this.updateNovuCredentials(subscriberId, deviceTokens);

    this.logger.log(`Device tokens обновлены для пользователя: ${subscriberId}`);
  }

  /**
   * Добавить device token для пользователя
   * @param username Username пользователя
   * @param deviceToken Device token для добавления
   * @returns Promise<void>
   */
  async addDeviceTokenForUser(username: string, deviceToken: string): Promise<void> {
    this.logger.log(`Добавление device token для пользователя: ${username}`);

    // Получаем аккаунт пользователя для получения правильного subscriber_id
    const account = await this.accountDomainService.getAccount(username);

    if (!account.provider_account?.subscriber_id) {
      throw new Error(`Не найден subscriber_id для пользователя ${username}`);
    }

    await this.novuCredentialsPort.addDeviceToken(
      account.provider_account.subscriber_id,
      this.pushWebhookProviderId,
      deviceToken,
      this.generateIntegrationIdentifier()
    );

    this.logger.log(`Device token добавлен для пользователя: ${account.provider_account.subscriber_id}`);
  }

  /**
   * Удалить device token для пользователя
   * @param username Username пользователя
   * @param deviceToken Device token для удаления
   * @returns Promise<void>
   */
  async removeDeviceTokenForUser(username: string, deviceToken: string): Promise<void> {
    this.logger.log(`Удаление device token для пользователя: ${username}`);

    // Получаем аккаунт пользователя для получения правильного subscriber_id
    const account = await this.accountDomainService.getAccount(username);

    if (!account.provider_account?.subscriber_id) {
      throw new Error(`Не найден subscriber_id для пользователя ${username}`);
    }

    await this.novuCredentialsPort.removeDeviceToken(
      account.provider_account.subscriber_id,
      this.pushWebhookProviderId,
      deviceToken
    );

    this.logger.log(`Device token удален для пользователя: ${account.provider_account.subscriber_id}`);
  }

  /**
   * Получить device tokens для пользователя
   * @param username Username пользователя
   * @returns Promise<DeviceTokenDomainInterface[]>
   */
  async getUserDeviceTokens(username: string): Promise<DeviceTokenDomainInterface[]> {
    this.logger.debug(`Получение device tokens для пользователя: ${username}`);

    // Получаем аккаунт пользователя для получения правильного subscriber_id
    const account = await this.accountDomainService.getAccount(username);

    if (!account.provider_account?.subscriber_id) {
      throw new Error(`Не найден subscriber_id для пользователя ${username}`);
    }

    const deviceTokens = await this.novuCredentialsPort.getSubscriberCredentials(
      account.provider_account.subscriber_id,
      this.pushWebhookProviderId
    );

    return deviceTokens;
  }

  /**
   * Синхронизировать device tokens с активными веб-пуш подписками
   * @param username Username пользователя
   * @returns Promise<void>
   */
  async syncDeviceTokensWithSubscriptions(username: string): Promise<void> {
    this.logger.log(`Синхронизация device tokens для пользователя: ${username}`);

    try {
      // Получаем аккаунт пользователя для получения правильного subscriber_id
      const account = await this.accountDomainService.getAccount(username);

      if (!account.provider_account?.subscriber_id) {
        throw new Error(`Не найден subscriber_id для пользователя ${username}`);
      }

      // Получаем активные веб-пуш подписки пользователя через доменный интерактор
      const subscriptions = await this.notificationInteractor.getUserSubscriptions(username);

      this.logger.log(`Найдено ${subscriptions.length} активных подписок для пользователя: ${username}`);

      // Генерируем device tokens на основе активных подписок
      const deviceTokens = subscriptions.map((subscription) => this.generateDeviceTokenFromEndpoint(subscription.endpoint));

      if (deviceTokens.length > 0) {
        // Обновляем device tokens в NOVU с правильным subscriber_id
        await this.updateDeviceTokensForUser(account.provider_account.subscriber_id, deviceTokens);
        this.logger.log(
          `Синхронизировано ${deviceTokens.length} device tokens для пользователя: ${account.provider_account.subscriber_id}`
        );
      } else {
        // Если нет активных подписок, очищаем device tokens
        this.logger.log(`Нет активных подписок для пользователя ${username}, очищаем device tokens в NOVU`);
        await this.novuCredentialsPort.deleteSubscriberCredentials(
          account.provider_account.subscriber_id,
          this.pushWebhookProviderId
        );
        this.logger.log(
          `Очищены device tokens для пользователя без активных подписок: ${account.provider_account.subscriber_id}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Ошибка синхронизации device tokens для пользователя ${username}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Очистить все device tokens для пользователя
   * @param username Username пользователя
   * @returns Promise<void>
   */
  async clearUserDeviceTokens(username: string): Promise<void> {
    this.logger.log(`Очистка device tokens для пользователя: ${username}`);

    // Получаем аккаунт пользователя для получения правильного subscriber_id
    const account = await this.accountDomainService.getAccount(username);

    if (!account.provider_account?.subscriber_id) {
      throw new Error(`Не найден subscriber_id для пользователя ${username}`);
    }

    await this.novuCredentialsPort.deleteSubscriberCredentials(
      account.provider_account.subscriber_id,
      this.pushWebhookProviderId
    );

    this.logger.log(`Device tokens очищены для пользователя: ${account.provider_account.subscriber_id}`);
  }

  /**
   * Обновить credentials в NOVU
   * @param subscriberId Subscriber ID пользователя
   * @param deviceTokens Список device tokens
   * @returns Promise<void>
   */
  private async updateNovuCredentials(subscriberId: string, deviceTokens: string[]): Promise<void> {
    const credentialsData: UpdateCredentialsDomainInterface = {
      subscriberId,
      providerId: this.pushWebhookProviderId,
      deviceTokens,
      integrationIdentifier: this.generateIntegrationIdentifier(),
    };

    await this.novuCredentialsPort.updateSubscriberCredentials(credentialsData);
  }

  /**
   * Генерировать device token на основе endpoint веб-пуш подписки
   * @param endpoint Endpoint веб-пуш подписки
   * @returns string
   */
  private generateDeviceTokenFromEndpoint(endpoint: string): string {
    // Для NOVU Push Webhook device token может быть любой строкой
    // Используем hash от endpoint для уникальности
    return generateHashFromString(endpoint);
  }

  /**
   * Генерировать идентификатор интеграции
   * @returns string
   */
  private generateIntegrationIdentifier(): string {
    // Генерируем уникальный идентификатор интеграции
    return `push-webhook-${Date.now()}`;
  }
}
