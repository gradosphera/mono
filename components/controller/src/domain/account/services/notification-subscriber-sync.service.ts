import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import cron from 'node-cron';
import { generateSubscriberHash } from '~/utils/novu.utils';
import config from '~/config/config';
import { NotificationDomainService } from '~/domain/notification/services/notification-domain.service';
import { AccountDomainService } from './account-domain.service';
import { USER_DOMAIN_SERVICE, UserDomainService } from '~/domain/user/services/user-domain.service';

@Injectable()
export class NotificationSubscriberSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationSubscriberSyncService.name);
  private isProcessing = false;
  private cronJob: cron.ScheduledTask | null = null;

  constructor(
    private readonly notificationDomainService: NotificationDomainService,
    private readonly accountDomainService: AccountDomainService,
    @Inject(USER_DOMAIN_SERVICE) private readonly userDomainService: UserDomainService
  ) {}

  onModuleInit() {
    // Синхронизация подписчиков каждые 30 минут
    this.cronJob = cron.schedule('*/30 * * * *', async () => {
      await this.syncNotificationSubscribers();
    });

    this.logger.log('node-cron задача для синхронизации подписчиков уведомлений запущена (каждые 30 минут)');
  }

  onModuleDestroy() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.logger.log('node-cron задача для синхронизации подписчиков уведомлений остановлена');
    }
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
      const usersWithoutSubscriber = await this.userDomainService.findUsersWithoutSubscriberId();

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
          this.logger.error(`Не удалось создать подписчика для пользователя ${user.username}: ${error.message}`);
        }
      }

      this.logger.log(`Синхронизация завершена. Успешно: ${successCount}, Ошибок: ${errorCount}`);
    } catch (error: any) {
      this.logger.error(`Не удалось выполнить синхронизацию подписчиков: ${error.message}`, error.stack);
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
      const subscriberId = await this.userDomainService.generateSubscriberId(config.coopname);
      const subscriberHash = generateSubscriberHash(subscriberId);

      // Обновляем пользователя с subscriber данными
      await this.userDomainService.updateUserByUsername(username, {
        subscriber_id: subscriberId,
        subscriber_hash: subscriberHash,
      });

      // Создаем подписчика NOVU
      const account = await this.accountDomainService.getAccount(username);
      await this.notificationDomainService.createSubscriberFromAccount(account);
    } catch (error: any) {
      this.logger.error(`Не удалось настроить подписчика для пользователя ${username}: ${error.message}`);
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
