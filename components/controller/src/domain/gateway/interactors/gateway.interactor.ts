import { Injectable, Inject, Logger } from '@nestjs/common';
import type { OutgoingPaymentDomainInterface } from '../interfaces/outgoing-payment-domain.interface';
import type { UpdatePaymentStatusInputDomainInterface } from '../interfaces/update-payment-status-input-domain.interface';
import type { GetOutgoingPaymentsInputDomainInterface } from '../interfaces/get-outgoing-payments-input-domain.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { OutgoingPaymentDomainEntity } from '../entities/outgoing-payment-domain.entity';
import { GatewayBlockchainPort, GATEWAY_BLOCKCHAIN_PORT } from '../ports/gateway-blockchain.port';
import { PaymentRepository, PAYMENT_REPOSITORY } from '../repositories/payment.repository';

/**
 * Интерактор домена gateway для управления исходящими платежами
 */
@Injectable()
export class GatewayInteractor {
  private readonly logger = new Logger(GatewayInteractor.name);

  constructor(
    @Inject(GATEWAY_BLOCKCHAIN_PORT)
    private readonly gatewayBlockchainPort: GatewayBlockchainPort,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository
  ) {}

  /**
   * Получить список исходящих платежей
   */
  async getOutgoingPayments(
    filters: GetOutgoingPaymentsInputDomainInterface,
    options: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<OutgoingPaymentDomainEntity>> {
    // Получаем данные из локальной БД через репозиторий
    const result = await this.paymentRepository.getOutgoingPayments(filters, options);

    // Обогащаем каждый платеж данными из блокчейна
    const enrichedItems = await Promise.all(
      result.items.map(async (payment) => {
        try {
          // Получаем данные из блокчейна
          const blockchainData = await this.gatewayBlockchainPort.getOutcome(payment.coopname, payment.hash);

          // Создаем доменную сущность с обогащенными данными
          const enrichedPayment = new OutgoingPaymentDomainEntity({
            ...payment,
            blockchain_data: blockchainData,
          });

          return enrichedPayment;
        } catch (error: any) {
          this.logger.warn(`Не удалось получить данные из блокчейна для платежа ${payment.hash}: ${error.message}`);
          // Возвращаем платеж без данных блокчейна
          return new OutgoingPaymentDomainEntity(payment);
        }
      })
    );

    return {
      items: enrichedItems,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Обновить статус платежа
   */
  async updatePaymentStatus(data: UpdatePaymentStatusInputDomainInterface): Promise<OutgoingPaymentDomainEntity> {
    try {
      if (data.status === 'completed') {
        // Завершаем платеж в gateway
        await this.gatewayBlockchainPort.completeOutcome({
          coopname: data.coopname,
          outcome_hash: data.hash,
        });
        this.logger.log(`Платеж ${data.hash} завершен в блокчейне`);
      } else if (data.status === 'failed') {
        // Отклоняем платеж в gateway
        await this.gatewayBlockchainPort.declineOutcome({
          coopname: data.coopname,
          outcome_hash: data.hash,
          reason: data.reason || 'Платеж отклонен',
        });
        this.logger.log(`Платеж ${data.hash} отклонен в блокчейне`);
      }

      // Обновляем статус в локальной БД через репозиторий
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(data.hash, data.status, data.reason);
      if (!updatedPayment) {
        throw new Error(`Не удалось найти платеж с хешем ${data.hash}`);
      }

      return new OutgoingPaymentDomainEntity(updatedPayment as OutgoingPaymentDomainInterface);
    } catch (error: any) {
      this.logger.error(`Ошибка при обновлении статуса платежа ${data.hash}: ${error.message}`, error);
      throw error;
    }
  }
}
