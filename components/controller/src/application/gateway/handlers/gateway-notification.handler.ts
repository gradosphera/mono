import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { GatewayInteractorPort, GATEWAY_INTERACTOR_PORT } from '~/domain/wallet/ports/gateway-interactor.port';
import { PaymentStatusEnum } from '~/domain/gateway/enums/payment-status.enum';
import { REDIS_PORT, RedisPort } from '~/domain/common/ports/redis.port';
import config from '~/config/config';
import logger from '~/config/logger';

/**
 * Обработчик уведомлений платежей для Gateway
 * Подписывается на Redis канал для обработки статусов платежей
 */
@Injectable()
export class GatewayNotificationHandler implements OnModuleInit {
  constructor(
    @Inject(GATEWAY_INTERACTOR_PORT) private readonly gatewayInteractorPort: GatewayInteractorPort,
    @Inject(REDIS_PORT) private readonly redisPort: RedisPort
  ) {}

  onModuleInit() {
    // Подписка на канал обновления статуса заказов
    this.redisPort.subscribe(`${config.coopname}:orderStatusUpdate`, async (message) => {
      const { id, status } = message;
      await this.handlePaymentConfirmation(id, status);
    });
  }

  /**
   * Обработка подтверждения платежа
   */
  async handlePaymentConfirmation(id: string, status: string) {
    try {
      // Преобразуем строку в enum
      const statusEnum = status as PaymentStatusEnum;
      await this.gatewayInteractorPort.executeIncomePayment(id, statusEnum);
    } catch (error: any) {
      logger.error(`Error processing payment confirmation: ${error.message}`, error);
    }
  }
}
