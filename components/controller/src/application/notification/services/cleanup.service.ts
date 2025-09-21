import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import cron from 'node-cron';
import { WebPushSubscriptionService } from './web-push-subscription.service';

@Injectable()
export class CleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CleanupService.name);
  private cleanupCronJob: cron.ScheduledTask | null = null;
  private statsCronJob: cron.ScheduledTask | null = null;

  constructor(private readonly webPushSubscriptionService: WebPushSubscriptionService) {}

  onModuleInit() {
    // Автоматическая очистка неактивных подписок каждый день в 2:00
    this.cleanupCronJob = cron.schedule('0 2 * * *', async () => {
      this.logger.log('Запуск автоматической очистки неактивных push подписок...');

      try {
        const deletedCount = await this.webPushSubscriptionService.cleanupInactiveSubscriptions(30);
        this.logger.log(`Автоматическая очистка завершена. Удалено ${deletedCount} неактивных подписок.`);
      } catch (error: any) {
        this.logger.error('Ошибка автоматической очистки:', error.message);
      }
    });

    // Еженедельная статистика push подписок (каждое воскресенье в 12:00)
    this.statsCronJob = cron.schedule('0 12 * * 0', async () => {
      this.logger.log('Генерация еженедельной статистики push подписок...');

      try {
        const stats = await this.webPushSubscriptionService.getSubscriptionStats();

        this.logger.log(`📊 Еженедельная статистика push подписок:`);
        this.logger.log(`   Всего подписок: ${stats.total}`);
        this.logger.log(`   Активных: ${stats.active}`);
        this.logger.log(`   Неактивных: ${stats.inactive}`);
        this.logger.log(`   Уникальных пользователей: ${stats.uniqueUsers}`);

        const activePercentage = stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : '0';
        this.logger.log(`   Процент активных подписок: ${activePercentage}%`);
      } catch (error: any) {
        this.logger.error('Ошибка генерации статистики:', error.message);
      }
    });

    this.logger.log('node-cron задачи для веб-пуш подписок запущены');
  }

  onModuleDestroy() {
    if (this.cleanupCronJob) {
      this.cleanupCronJob.stop();
      this.cleanupCronJob = null;
      this.logger.log('node-cron задача автоматической очистки остановлена');
    }

    if (this.statsCronJob) {
      this.statsCronJob.stop();
      this.statsCronJob = null;
      this.logger.log('node-cron задача еженедельной статистики остановлена');
    }
  }

  /**
   * Ручная очистка с заданными параметрами
   */
  async manualCleanup(olderThanDays: number): Promise<number> {
    this.logger.log(`Запуск ручной очистки подписок старше ${olderThanDays} дней...`);

    const deletedCount = await this.webPushSubscriptionService.cleanupInactiveSubscriptions(olderThanDays);
    this.logger.log(`Ручная очистка завершена. Удалено ${deletedCount} неактивных подписок.`);
    return deletedCount;
  }
}
