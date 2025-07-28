import { Injectable, Logger } from '@nestjs/common';
import { Novu } from '@novu/api';
import { ChatOrPushProviderEnum } from '@novu/api/models/components';
import config from '~/config/config';
import type { NovuCredentialsPort } from '~/domain/notification/interfaces/novu-credentials.port';
import {
  UpdateCredentialsDomainInterface,
  DeviceTokenDomainInterface,
  NotificationProviderEnum,
} from '~/domain/notification/interfaces/device-token-domain.interface';

/**
 * Адаптер для управления NOVU credentials
 * Реализует работу с device tokens подписчиков через @novu/api
 */
@Injectable()
export class NovuCredentialsAdapter implements NovuCredentialsPort {
  private readonly logger = new Logger(NovuCredentialsAdapter.name);
  private readonly novu: Novu;

  constructor() {
    // Инициализируем Novu SDK
    this.novu = new Novu({
      secretKey: config.novu.api_key,
      serverURL: config.novu.backend_url,
    });

    this.logger.log(`NOVU Credentials адаптер инициализирован с @novu/api`);
  }

  /**
   * Обновить credentials подписчика
   * @param credentialsData Данные для обновления credentials
   * @returns Promise<void>
   */
  async updateSubscriberCredentials(credentialsData: UpdateCredentialsDomainInterface): Promise<void> {
    this.logger.log(
      `Обновление credentials для подписчика: ${credentialsData.subscriberId}, провайдер: ${credentialsData.providerId}`
    );

    try {
      const novuProviderId = this.convertToNovuProvider(credentialsData.providerId);

      // Сначала удаляем все существующие credentials для этого провайдера
      try {
        await this.novu.subscribers.credentials.delete(credentialsData.subscriberId, novuProviderId);
        this.logger.debug(`Существующие credentials удалены для подписчика: ${credentialsData.subscriberId}`);
      } catch (deleteError: any) {
        // Если credentials не существуют, это не ошибка
        if (!this.isNotFoundError(deleteError)) {
          this.logger.warn(`Не удалось удалить существующие credentials: ${deleteError.message}`);
        }
      }

      // Добавляем новые credentials, если есть токены
      if (credentialsData.deviceTokens && credentialsData.deviceTokens.length > 0) {
        const updateData = {
          providerId: novuProviderId,
          credentials: {
            deviceTokens: credentialsData.deviceTokens,
            integrationIdentifier: credentialsData.integrationIdentifier,
            ...credentialsData.additionalData,
          },
        };

        await this.novu.subscribers.credentials.append(updateData, credentialsData.subscriberId);
        this.logger.log(`Credentials обновлены для подписчика: ${credentialsData.subscriberId}`);
      } else {
        this.logger.log(`Credentials очищены для подписчика: ${credentialsData.subscriberId} (нет токенов)`);
      }

      // Показываем текущие каналы подписчика для контроля синхронизации
      await this.logSubscriberChannels(credentialsData.subscriberId);
    } catch (error: any) {
      console.dir(error?.response?.data || error, { depth: null });
      this.logger.error(
        `Ошибка обновления credentials для подписчика ${credentialsData.subscriberId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Получить credentials подписчика
   * @param subscriberId ID подписчика
   * @param providerId ID провайдера
   * @returns Promise<DeviceTokenDomainInterface[]>
   */
  async getSubscriberCredentials(
    subscriberId: string,
    providerId: NotificationProviderEnum
  ): Promise<DeviceTokenDomainInterface[]> {
    this.logger.debug(`Получение credentials для подписчика: ${subscriberId}, провайдер: ${providerId}`);

    try {
      // Получаем подписчика через retrieve
      const subscriber = (await this.novu.subscribers.retrieve(subscriberId)).result;

      // Преобразуем доменный enum в NOVU enum для поиска
      const novuProviderId = this.convertToNovuProvider(providerId);

      // Находим канал с указанным providerId
      const channel = subscriber.channels?.find((ch: any) => ch.providerId === novuProviderId);

      if (!channel || !channel.credentials?.deviceTokens) {
        this.logger.debug(`Credentials не найдены для подписчика: ${subscriberId}, провайдер: ${providerId}`);
        return [];
      }

      // Преобразуем device tokens в доменные объекты
      return channel.credentials.deviceTokens.map((token: string) =>
        this.mapToDeviceTokenDomain(token, subscriberId, providerId, channel.integrationIdentifier)
      );
    } catch (error: any) {
      if (this.isNotFoundError(error)) {
        this.logger.debug(`Подписчик не найден: ${subscriberId}`);
        return [];
      }

      this.logger.error(`Ошибка получения credentials для подписчика ${subscriberId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Удалить credentials подписчика для определенного провайдера
   * @param subscriberId ID подписчика
   * @param providerId ID провайдера
   * @returns Promise<void>
   */
  async deleteSubscriberCredentials(subscriberId: string, providerId: NotificationProviderEnum): Promise<void> {
    this.logger.log(`Удаление credentials для подписчика: ${subscriberId}, провайдер: ${providerId}`);

    try {
      const novuProviderId = this.convertToNovuProvider(providerId);
      await this.novu.subscribers.credentials.delete(subscriberId, novuProviderId);

      this.logger.log(`Credentials удалены для подписчика: ${subscriberId}`);

      // Показываем текущие каналы подписчика для контроля синхронизации
      await this.logSubscriberChannels(subscriberId);
    } catch (error: any) {
      this.logger.error(`Ошибка удаления credentials для подписчика ${subscriberId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Удалить конкретный device token из credentials подписчика
   * @param subscriberId ID подписчика
   * @param providerId ID провайдера
   * @param deviceToken Device token для удаления
   * @returns Promise<void>
   */
  async removeDeviceToken(subscriberId: string, providerId: NotificationProviderEnum, deviceToken: string): Promise<void> {
    this.logger.log(`Удаление device token для подписчика: ${subscriberId}, провайдер: ${providerId}`);

    try {
      // Получаем текущие credentials
      const currentCredentials = await this.getSubscriberCredentials(subscriberId, providerId);

      // Фильтруем токены, исключая удаляемый
      const updatedTokens = currentCredentials.map((cred) => cred.token).filter((token) => token !== deviceToken);

      // Обновляем credentials с новым списком токенов
      await this.updateSubscriberCredentials({
        subscriberId,
        providerId,
        deviceTokens: updatedTokens,
      });

      this.logger.log(`Device token удален для подписчика: ${subscriberId}`);
    } catch (error: any) {
      this.logger.error(`Ошибка удаления device token для подписчика ${subscriberId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Добавить device token в credentials подписчика
   * @param subscriberId ID подписчика
   * @param providerId ID провайдера
   * @param deviceToken Device token для добавления
   * @param integrationIdentifier Идентификатор интеграции
   * @returns Promise<void>
   */
  async addDeviceToken(
    subscriberId: string,
    providerId: NotificationProviderEnum,
    deviceToken: string,
    integrationIdentifier?: string
  ): Promise<void> {
    this.logger.log(`Добавление device token для подписчика: ${subscriberId}, провайдер: ${providerId}`);

    try {
      // Получаем текущие credentials
      const currentCredentials = await this.getSubscriberCredentials(subscriberId, providerId);

      // Получаем текущие токены
      const currentTokens = currentCredentials.map((cred) => cred.token);

      // Добавляем новый токен, если его еще нет
      if (!currentTokens.includes(deviceToken)) {
        currentTokens.push(deviceToken);
      }

      // Обновляем credentials с новым списком токенов
      await this.updateSubscriberCredentials({
        subscriberId,
        providerId,
        deviceTokens: currentTokens,
        integrationIdentifier,
      });

      this.logger.log(`Device token добавлен для подписчика: ${subscriberId}`);
    } catch (error: any) {
      this.logger.error(`Ошибка добавления device token для подписчика ${subscriberId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Преобразует доменный enum провайдера в NOVU enum
   * @param domainProvider Доменный провайдер
   * @returns NOVU провайдер
   */
  private convertToNovuProvider(domainProvider: NotificationProviderEnum): ChatOrPushProviderEnum {
    // Преобразуем доменный enum в NOVU enum
    switch (domainProvider) {
      case NotificationProviderEnum.SLACK:
        return ChatOrPushProviderEnum.Slack;
      case NotificationProviderEnum.DISCORD:
        return ChatOrPushProviderEnum.Discord;
      case NotificationProviderEnum.MSTEAMS:
        return ChatOrPushProviderEnum.Msteams;
      case NotificationProviderEnum.MATTERMOST:
        return ChatOrPushProviderEnum.Mattermost;
      case NotificationProviderEnum.RYVER:
        return ChatOrPushProviderEnum.Ryver;
      case NotificationProviderEnum.ZULIP:
        return ChatOrPushProviderEnum.Zulip;
      case NotificationProviderEnum.GRAFANA_ON_CALL:
        return ChatOrPushProviderEnum.GrafanaOnCall;
      case NotificationProviderEnum.GETSTREAM:
        return ChatOrPushProviderEnum.Getstream;
      case NotificationProviderEnum.ROCKET_CHAT:
        return ChatOrPushProviderEnum.RocketChat;
      case NotificationProviderEnum.WHATSAPP_BUSINESS:
        return ChatOrPushProviderEnum.WhatsappBusiness;
      case NotificationProviderEnum.FCM:
        return ChatOrPushProviderEnum.Fcm;
      case NotificationProviderEnum.APNS:
        return ChatOrPushProviderEnum.Apns;
      case NotificationProviderEnum.EXPO:
        return ChatOrPushProviderEnum.Expo;
      case NotificationProviderEnum.ONE_SIGNAL:
        return ChatOrPushProviderEnum.OneSignal;
      case NotificationProviderEnum.PUSHPAD:
        return ChatOrPushProviderEnum.Pushpad;
      case NotificationProviderEnum.PUSH_WEBHOOK:
        return ChatOrPushProviderEnum.PushWebhook;
      case NotificationProviderEnum.PUSHER_BEAMS:
        return ChatOrPushProviderEnum.PusherBeams;
      default:
        throw new Error(`Неизвестный провайдер: ${domainProvider}`);
    }
  }

  /**
   * Проверяет, является ли ошибка "не найдено"
   * @param error Ошибка
   */
  private isNotFoundError(error: any): boolean {
    const status = error?.response?.status || error?.status;
    return status === 404;
  }

  /**
   * Преобразует device token в доменный интерфейс
   * @param token Device token
   * @param subscriberId ID подписчика
   * @param providerId ID провайдера
   * @param integrationIdentifier Идентификатор интеграции
   * @returns DeviceTokenDomainInterface
   */
  private mapToDeviceTokenDomain(
    token: string,
    subscriberId: string,
    providerId: NotificationProviderEnum,
    integrationIdentifier?: string
  ): DeviceTokenDomainInterface {
    return {
      token,
      username: subscriberId,
      providerId,
      integrationIdentifier,
      deviceInfo: {
        // Дополнительная информация об устройстве может быть добавлена позже
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Извлекает подписчика и показывает его каналы в консоли для мониторинга синхронизации
   * @param subscriberId ID подписчика
   * @returns Promise<void>
   */
  private async logSubscriberChannels(subscriberId: string): Promise<void> {
    try {
      const subscriber = (await this.novu.subscribers.retrieve(subscriberId)).result;

      this.logger.log(`📱 Каналы подписчика: ${subscriberId}`);

      if (!subscriber.channels || subscriber.channels.length === 0) {
        this.logger.log(`  ❌ Каналы отсутствуют`);
        return;
      }

      subscriber.channels.forEach((channel: any, index: number) => {
        this.logger.log(`  📢 Канал ${index + 1}:`);
        this.logger.log(`    • Провайдер: ${channel.providerId}`);
        this.logger.log(`    • Интеграция: ${channel.integrationIdentifier || 'не указана'}`);

        if (channel.credentials?.deviceTokens) {
          this.logger.log(`    • Device tokens (${channel.credentials.deviceTokens.length}):`);
          channel.credentials.deviceTokens.forEach((token: string, tokenIndex: number) => {
            // Показываем первые и последние 8 символов токена для безопасности
            const maskedToken =
              token.length > 16 ? `${token.substring(0, 8)}...${token.substring(token.length - 8)}` : token;
            this.logger.log(`      ${tokenIndex + 1}. ${maskedToken}`);
          });
        } else {
          this.logger.log(`    • Device tokens: отсутствуют`);
        }

        if (channel.credentials && Object.keys(channel.credentials).length > 0) {
          const otherCredentials = Object.keys(channel.credentials).filter((key) => key !== 'deviceTokens');
          if (otherCredentials.length > 0) {
            this.logger.log(`    • Другие credentials: ${otherCredentials.join(', ')}`);
          }
        }
      });

      this.logger.log(`📱 Всего каналов: ${subscriber.channels.length}`);
    } catch (error: any) {
      this.logger.error(`Ошибка при получении каналов подписчика ${subscriberId}: ${error.message}`);
    }
  }
}
