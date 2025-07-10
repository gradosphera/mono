import { Injectable, Logger } from '@nestjs/common';
import { WebPushSubscriptionDomainInteractor } from '~/domain/notification/interactors/web-push-subscription-domain.interactor';
import { CreateWebPushSubscriptionInputDTO } from '../dto/create-subscription-input.dto';
import { WebPushSubscriptionDTO, CreateWebPushSubscriptionResponseDTO } from '../dto/web-push-subscription.dto';

/**
 * Сервис приложения для управления веб-пуш подписками
 * Делегирует выполнение доменному интерактору и преобразует данные в DTO
 */
@Injectable()
export class WebPushSubscriptionService {
  private readonly logger = new Logger(WebPushSubscriptionService.name);

  constructor(private readonly webPushSubscriptionDomainInteractor: WebPushSubscriptionDomainInteractor) {}

  /**
   * Создать или обновить веб-пуш подписку
   * @param input Входные данные для создания подписки
   * @returns Promise<CreateWebPushSubscriptionResponseDTO>
   */
  async createSubscription(input: CreateWebPushSubscriptionInputDTO): Promise<CreateWebPushSubscriptionResponseDTO> {
    this.logger.log(`Создание подписки для пользователя ${input.userId}`);

    try {
      // Валидация входных данных
      this.validateSubscriptionInput(input);

      // Делегируем выполнение доменному интерактору
      const subscriptionEntity = await this.webPushSubscriptionDomainInteractor.createOrUpdateSubscription(input);

      // Преобразуем доменную сущность в DTO
      const subscriptionDTO = new WebPushSubscriptionDTO(subscriptionEntity);

      this.logger.log(`Подписка успешно создана для пользователя ${input.userId}`);

      return {
        success: true,
        message: 'Подписка на push уведомления успешно создана',
        subscription: subscriptionDTO,
      };
    } catch (error: any) {
      this.logger.error(`Ошибка при создании подписки для пользователя ${input.userId}: ${error.message}`, error.stack);

      return {
        success: false,
        message: `Ошибка при создании подписки: ${error.message}`,
        subscription: null as any, // В случае ошибки возвращаем null
      };
    }
  }

  /**
   * Получить все подписки пользователя
   * @param userId ID пользователя
   * @returns Promise<WebPushSubscriptionDTO[]>
   */
  async getUserSubscriptions(userId: string): Promise<WebPushSubscriptionDTO[]> {
    this.logger.debug(`Получение подписок для пользователя ${userId}`);

    try {
      const subscriptionEntities = await this.webPushSubscriptionDomainInteractor.getUserSubscriptions(userId);

      return subscriptionEntities.map((entity) => new WebPushSubscriptionDTO(entity));
    } catch (error: any) {
      this.logger.error(`Ошибка при получении подписок для пользователя ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Деактивировать подписку по endpoint
   * @param endpoint Endpoint подписки
   * @returns Promise<boolean>
   */
  async deactivateSubscription(endpoint: string): Promise<boolean> {
    this.logger.log(`Деактивация подписки с endpoint: ${endpoint.substring(0, 50)}...`);

    try {
      await this.webPushSubscriptionDomainInteractor.deactivateSubscription(endpoint);

      this.logger.log(`Подписка деактивирована: ${endpoint.substring(0, 50)}...`);
      return true;
    } catch (error: any) {
      this.logger.error(`Ошибка при деактивации подписки: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Валидация входных данных для создания подписки
   * @param input Входные данные
   */
  private validateSubscriptionInput(input: CreateWebPushSubscriptionInputDTO): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('ID пользователя обязателен');
    }

    if (!input.subscription) {
      throw new Error('Данные подписки обязательны');
    }

    if (!input.subscription.endpoint || input.subscription.endpoint.trim() === '') {
      throw new Error('Endpoint подписки обязателен');
    }

    if (!input.subscription.keys) {
      throw new Error('Ключи подписки обязательны');
    }

    if (!input.subscription.keys.p256dh || input.subscription.keys.p256dh.trim() === '') {
      throw new Error('P256DH ключ обязателен');
    }

    if (!input.subscription.keys.auth || input.subscription.keys.auth.trim() === '') {
      throw new Error('Auth ключ обязателен');
    }

    // Проверка формата endpoint
    try {
      new URL(input.subscription.endpoint);
    } catch {
      throw new Error('Endpoint должен быть валидным URL');
    }
  }
}
