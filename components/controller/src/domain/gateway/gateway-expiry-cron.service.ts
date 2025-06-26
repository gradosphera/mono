import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import cron from 'node-cron';
import { GatewayInteractor } from './interactors/gateway.interactor';

@Injectable()
export class GatewayExpiryCronService implements OnModuleInit {
  private readonly logger = new Logger(GatewayExpiryCronService.name);

  constructor(private readonly gatewayInteractor: GatewayInteractor) {}

  onModuleInit() {
    // Запуск задачи раз в 10 минут
    cron.schedule('*/10 * * * *', async () => {
      const count = await this.gatewayInteractor.expireOutdatedPayments();
      if (count > 0) {
        this.logger.log(`Истекло ${count} платежей (переведены в статус EXPIRED) через node-cron`);
      }
    });
    this.logger.log('node-cron для expireOutdatedPayments запущен (каждые 10 минут)');
  }
}
