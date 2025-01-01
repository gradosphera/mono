// modules/redis/redis-notification.handler.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaymentInteractor } from '~/domain/payment/interactors/payment.interactor';
import { RedisService } from '~/infrastructure/redis/redis.service';
import config from '~/config/config';
import logger from '~/config/logger';

@Injectable()
export class RedisNotificationHandler implements OnModuleInit {
  constructor(private readonly processPaymentInteractor: PaymentInteractor, private readonly redisService: RedisService) {}

  onModuleInit() {
    // Подписка на канал Redis
    this.redisService.subscribe(`${config.coopname}:orderStatusUpdate`, async (message) => {
      const { id, status } = message;
      await this.handlePaymentConfirmation(id, status);
    });
  }

  async handlePaymentConfirmation(id: string, status: string) {
    try {
      await this.processPaymentInteractor.execute(id, status);
    } catch (error: any) {
      logger.error(`Error processing payment confirmation: ${error.message}`, error);
    }
  }
}
