import { Injectable, Logger } from '@nestjs/common';
import { ProviderSubscriptionDTO } from '../dto/provider-subscription.dto';
import { CurrentInstanceDTO } from '../dto/current-instance.dto';
import { InstanceStatus } from '~/domain/instance-status.enum';
import { Client, configureClient } from '@coopenomics/provider-client';
import { config } from '~/config';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);

  constructor() {
    // Проверяем наличие PROVIDER_BASE_URL
    const providerBaseUrl = config.provider_base_url;

    if (providerBaseUrl === '') {
      this.logger.warn('PROVIDER_BASE_URL не настроен - функционал провайдера недоступен');
      return;
    }

    // Получаем SERVER_SECRET для аутентификации
    const serverSecret = config.server_secret;

    // Инициализируем клиент провайдера с аутентификацией
    configureClient(providerBaseUrl, serverSecret);
  }

  /**
   * Проверяет доступность провайдера
   */
  isProviderAvailable(): boolean {
    return config.provider_base_url !== '';
  }

  /**
   * Получить подписки пользователя по username
   */
  async getUserSubscriptions(username: string): Promise<ProviderSubscriptionDTO[]> {
    // Проверяем доступность провайдера
    if (!this.isProviderAvailable()) {
      throw new Error('Провайдер не настроен');
    }

    try {
      this.logger.log(`Получаем подписки для пользователя: ${username}`);

      // Получаем подписки через provider-client (уже обогащенные данными)
      const subscriptions = await Client.SubscriptionsService.subscriptionControllerGetSubscriptionsByUsername(username);

      const result: ProviderSubscriptionDTO[] = [];

      for (const subscription of subscriptions) {
        // Провайдер уже возвращает обогащенные данные
        const providerSubscription = new ProviderSubscriptionDTO(subscription);
        result.push(providerSubscription);
      }

      return result;
    } catch (error: any) {
      this.logger.error(`Ошибка при получении подписок для ${username}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получить подписку по ID
   */
  async getSubscriptionById(id: number): Promise<ProviderSubscriptionDTO> {
    // Проверяем доступность провайдера
    if (!this.isProviderAvailable()) {
      throw new Error('Провайдер не настроен');
    }

    try {
      this.logger.log(`Получаем подписку по ID: ${id}`);

      const subscription = await Client.SubscriptionsService.subscriptionControllerGetSubscriptionById(id.toString());

      // Провайдер уже возвращает обогащенные данные
      return new ProviderSubscriptionDTO(subscription);
    } catch (error: any) {
      this.logger.error(`Ошибка при получении подписки ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получить текущий инстанс пользователя по username
   */
  async getCurrentInstance(username: string): Promise<CurrentInstanceDTO | null> {
    // Проверяем доступность провайдера
    if (!this.isProviderAvailable()) {
      throw new Error('Провайдер не настроен');
    }

    try {
      this.logger.log(`Получаем текущий инстанс для пользователя: ${username}`);

      // Получаем инстанс через provider-client
      type InstanceResponse = Awaited<ReturnType<typeof Client.InstancesService.instanceControllerGetInstance>>;
      const instance: InstanceResponse = await Client.InstancesService.instanceControllerGetInstance(username);

      if (!instance) {
        return null;
      }

      // Преобразуем данные в сокращенный DTO (без IP и username)
      const currentInstance = new CurrentInstanceDTO();
      currentInstance.status = instance.instance.status as unknown as InstanceStatus;
      currentInstance.is_valid = instance.instance.is_valid;
      currentInstance.is_delegated = instance.instance.is_delegated;
      currentInstance.blockchain_status = instance.instance.blockchain_status;
      currentInstance.progress = instance.instance.progress;
      currentInstance.domain = instance.instance.domain;
      currentInstance.title = instance.instance.title;
      currentInstance.description = instance.instance.description;
      currentInstance.image = instance.instance.image;

      return currentInstance;
    } catch (error: any) {
      this.logger.error(`Ошибка при получении инстанса для ${username}: ${error.message}`);
      throw error;
    }
  }
}
