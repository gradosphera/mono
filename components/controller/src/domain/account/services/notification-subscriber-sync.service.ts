import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import cron from 'node-cron';
import { userService } from '~/services';
import { generateSubscriberId, generateSubscriberHash } from '~/utils/novu.utils';
import config from '~/config/config';
import { NotificationDomainService } from '~/domain/notification/services/notification-domain.service';
import { AccountDomainService } from './account-domain.service';

@Injectable()
export class NotificationSubscriberSyncService implements OnModuleInit {
  private readonly logger = new Logger(NotificationSubscriberSyncService.name);
  private isProcessing = false;

  constructor(
    private readonly notificationDomainService: NotificationDomainService,
    private readonly accountDomainService: AccountDomainService
  ) {}

  onModuleInit() {
    // Синхронизация подписчиков каждые 30 минут
    cron.schedule('*/30 * * * *', async () => {
      await this.syncNotificationSubscribers();
    });

    this.logger.log('node-cron задача для синхронизации подписчиков уведомлений запущена (каждые 30 минут)');
  }

  /**
   * Фоновая задача для синхронизации подписчиков уведомлений
   */
  async syncNotificationSubscribers(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Синхронизация подписчиков уже выполняется, пропускаем');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Начинаем синхронизацию подписчиков уведомлений');

    try {
      // Находим пользователей без subscriber_id
      const usersWithoutSubscriber = await userService.findUsersWithoutSubscriberId();

      if (usersWithoutSubscriber.length === 0) {
        this.logger.log('Все пользователи имеют subscriber_id');
        return;
      }

      this.logger.log(`Найдено ${usersWithoutSubscriber.length} пользователей без subscriber_id`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of usersWithoutSubscriber) {
        try {
          await this.setupSubscriberForUser(user.username);
          successCount++;
          this.logger.log(`Подписчик создан для пользователя: ${user.username}`);
        } catch (error: any) {
          errorCount++;
          this.logger.error(`Ошибка создания подписчика для ${user.username}: ${error.message}`);
        }
      }

      this.logger.log(`Синхронизация завершена. Успешно: ${successCount}, Ошибок: ${errorCount}`);
    } catch (error: any) {
      this.logger.error(`Ошибка синхронизации подписчиков: ${error.message}`, error.stack);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Настраивает подписчика для конкретного пользователя
   * @param username Имя пользователя
   */
  private async setupSubscriberForUser(username: string): Promise<void> {
    try {
      // Генерируем subscriber_id и subscriber_hash
      const subscriberId = await generateSubscriberId(config.coopname);
      const subscriberHash = generateSubscriberHash(subscriberId);

      // Обновляем пользователя с subscriber данными
      await userService.updateUserByUsername(username, {
        subscriber_id: subscriberId,
        subscriber_hash: subscriberHash,
      });

      // Создаем подписчика NOVU
      const account = await this.accountDomainService.getAccount(username);
      await this.notificationDomainService.createSubscriberFromAccount(account);
    } catch (error: any) {
      this.logger.error(`Ошибка настройки подписчика для ${username}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ручной запуск синхронизации (для административных целей)
   */
  async manualSync(): Promise<{ success: number; errors: number }> {
    if (this.isProcessing) {
      throw new Error('Синхронизация уже выполняется');
    }

    this.logger.log('Запуск ручной синхронизации подписчиков');
    await this.syncNotificationSubscribers();

    return { success: 0, errors: 0 }; // Детали будут в логах
  }
}

export const NOTIFICATION_SUBSCRIBER_SYNC_SERVICE = Symbol('NOTIFICATION_SUBSCRIBER_SYNC_SERVICE');
