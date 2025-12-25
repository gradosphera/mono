// modules/redis/redis-notification.handler.ts

import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { GatewayInteractor } from '~/domain/gateway/interactors/gateway.interactor';
import { PaymentStatusEnum } from '~/domain/gateway/enums/payment-status.enum';
import { REDIS_PORT, RedisPort } from '~/domain/common/ports/redis.port';
import config from '~/config/config';
import logger from '~/config/logger';

@Injectable()
export class RedisNotificationHandler implements OnModuleInit {
  constructor(
    private readonly processPaymentInteractor: GatewayInteractor,
    @Inject(REDIS_PORT) private readonly redisPort: RedisPort
  ) {}

  //TODO: почему это здесь вообще? убрать надо туда где должно быть
  onModuleInit() {
    // Подписка на канал Redis
    this.redisPort.subscribe(`${config.coopname}:orderStatusUpdate`, async (message) => {
      const { id, status } = message;
      await this.handlePaymentConfirmation(id, status);
    });
  }

  async handlePaymentConfirmation(id: string, status: string) {
    try {
      // Преобразуем строку в enum
      const statusEnum = status as PaymentStatusEnum;
      await this.processPaymentInteractor.executeIncomePayment(id, statusEnum);
    } catch (error: any) {
      logger.error(`Error processing payment confirmation: ${error.message}`, error);
    }
  }
}
