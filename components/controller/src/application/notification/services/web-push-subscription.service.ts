import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { WebPushSubscriptionDomainInteractor } from '~/domain/notification/interactors/web-push-subscription-domain.interactor';
import { WebPushSubscriptionDto } from '../dto/web-push-subscription.dto';
import { CreateSubscriptionResponse } from '../dto/create-subscription-response.dto';
import { SubscriptionStatsDto } from '../dto/subscription-stats.dto';
import { CreateSubscriptionInput } from '../dto/create-subscription-input.dto';
import { DeviceTokenService } from './device-token.service';
import { generateHashFromString } from '~/utils/generate-hash.util';

@Injectable()
export class WebPushSubscriptionService {
  private readonly logger = new Logger(WebPushSubscriptionService.name);

  constructor(
    private readonly webPushSubscriptionDomainInteractor: WebPushSubscriptionDomainInteractor,
    private readonly deviceTokenService: DeviceTokenService
  ) {}

  /**
   * Создать веб-пуш подписку
   */
  async createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResponse> {
    this.logger.log(`Создание подписки для пользователя: ${input.username}`);

    // Преобразуем plain object в экземпляр класса, чтобы получить доступ к методам
    const inputInstance = plainToClass(CreateSubscriptionInput, input);
    const domainInput = inputInstance.toDomainInterface();
    const subscription = await this.webPushSubscriptionDomainInteractor.createOrUpdateSubscription(domainInput);

    // Синхронизируем device tokens с NOVU после создания подписки
    try {
      await this.deviceTokenService.syncDeviceTokensWithSubscriptions(input.username);
      this.logger.log(`Device tokens синхронизированы для пользователя: ${input.username}`);
    } catch (error: any) {
      this.logger.error(
        `Ошибка синхронизации device tokens для пользователя ${input.username}: ${error.message}`,
        error.stack
      );
      // Не прерываем выполнение, так как подписка уже создана
    }

    const subscriptionDto = WebPushSubscriptionDto.fromDomainEntity(subscription);

    return new CreateSubscriptionResponse({
      success: true,
      message: 'Подписка успешно создана',
      subscription: subscriptionDto,
    });
  }

  /**
   * Получить подписки пользователя
   */
  async getUserSubscriptions(username: string): Promise<WebPushSubscriptionDto[]> {
    this.logger.debug(`Получение подписок для пользователя: ${username}`);

    const subscriptions = await this.webPushSubscriptionDomainInteractor.getUserSubscriptions(username);
    return WebPushSubscriptionDto.fromDomainEntities(subscriptions);
  }

  /**
   * Деактивировать подписку по ID
   */
  async deactivateSubscriptionById(subscriptionId: string): Promise<void> {
    this.logger.log(`Деактивация подписки с ID: ${subscriptionId}`);

    // Получаем подписку перед деактивацией для получения username и endpoint
    const allSubscriptions = await this.webPushSubscriptionDomainInteractor.getAllActiveSubscriptions();
    const targetSubscription = allSubscriptions.find((sub) => sub.id === subscriptionId);

    if (targetSubscription) {
      // Генерируем device token для этой подписки (аналогично логике в DeviceTokenService)
      const deviceToken = generateHashFromString(targetSubscription.endpoint);

      // Удаляем device token из NOVU перед деактивацией подписки
      try {
        await this.deviceTokenService.removeDeviceTokenForUser(targetSubscription.username, deviceToken);
        this.logger.log(`Device token удален для подписки: ${subscriptionId}`);
      } catch (error: any) {
        this.logger.error(`Ошибка удаления device token для подписки ${subscriptionId}: ${error.message}`, error.stack);
        // Продолжаем выполнение, даже если удаление device token не удалось
      }
    }

    await this.webPushSubscriptionDomainInteractor.deactivateSubscriptionById(subscriptionId);

    // Синхронизируем оставшиеся device tokens с NOVU после деактивации подписки
    if (targetSubscription) {
      try {
        await this.deviceTokenService.syncDeviceTokensWithSubscriptions(targetSubscription.username);
        this.logger.log(`Device tokens синхронизированы для пользователя: ${targetSubscription.username}`);
      } catch (error: any) {
        this.logger.error(
          `Ошибка синхронизации device tokens для пользователя ${targetSubscription.username}: ${error.message}`,
          error.stack
        );
      }
    }
  }

  /**
   * Получить статистику подписок
   */
  async getSubscriptionStats(): Promise<SubscriptionStatsDto> {
    this.logger.debug('Получение статистики подписок');

    const stats = await this.webPushSubscriptionDomainInteractor.getSubscriptionStats();
    return SubscriptionStatsDto.fromDomainInterface(stats);
  }

  /**
   * Очистить неактивные подписки (для внутреннего использования)
   */
  async cleanupInactiveSubscriptions(olderThanDays = 30): Promise<number> {
    this.logger.log(`Очистка неактивных подписок старше ${olderThanDays} дней`);

    const deletedCount = await this.webPushSubscriptionDomainInteractor.cleanupInactiveSubscriptions(olderThanDays);
    this.logger.log(`Очищено ${deletedCount} неактивных подписок`);
    return deletedCount;
  }
}
