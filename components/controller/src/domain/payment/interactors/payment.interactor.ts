// domain/payment/interactors/PaymentInteractor.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Order } from '~/models';
import { userService, blockchainService } from '~/services';
import { userStatus } from '~/types/user.types';
import { type IOrder } from '~/types/order.types';
import { PaymentTypeDomainInterface } from '../interfaces/payment-type-domain.interface';
import { PaymentStatus } from '../interfaces/payment-status-domain.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { GetPaymentsInputDomainInterface } from '../interfaces/get-payments-input-domain.interface';
import type { CreateInitialPaymentInputDomainInterface } from '../interfaces/create-initial-input-domain.interface';
import type { CreateDepositPaymentInputDomainInterface } from '../interfaces/create-deposit-input-domain.interface';
import type { SetPaymentStatusInputDomainInterface } from '../interfaces/set-payment-status-domain-input.interface';
import { PaymentDomainService } from '../services/payment-domain.service';
import type { PaginationResultLegacy } from '~/types/pagination.types';
import { PaymentDomainEntity } from '../entity/payment.entity';
import { AccountDomainInteractor } from '~/domain/account/interactors/account.interactor';

@Injectable()
export class PaymentInteractor {
  constructor(
    private readonly paymentDomainService: PaymentDomainService,
    private readonly accountDomainInteractor: AccountDomainInteractor
  ) {}

  private readonly logger = new Logger(PaymentInteractor.name);

  async getPayments(
    data: GetPaymentsInputDomainInterface,
    options: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<PaymentDomainEntity>> {
    const pre_result: PaginationResultLegacy<IOrder> = await this.paymentDomainService.getOrders(data, options);

    const result: PaginationResultDomainInterface<PaymentDomainEntity> = {
      items: pre_result.results.map((el) => new PaymentDomainEntity(el)),
      totalCount: pre_result.totalResults,
      totalPages: pre_result.totalPages,
      currentPage: pre_result.page,
    };

    return result;
  }

  async createInitialPayment(data: CreateInitialPaymentInputDomainInterface): Promise<PaymentDomainEntity> {
    const result = await this.paymentDomainService.createInitialOrder(data);
    return new PaymentDomainEntity(result);
  }

  async createDeposit(data: CreateDepositPaymentInputDomainInterface): Promise<PaymentDomainEntity> {
    const result = await this.paymentDomainService.createDeposit(data);
    return new PaymentDomainEntity(result);
  }

  async setPaymentStatus(data: SetPaymentStatusInputDomainInterface): Promise<PaymentDomainEntity> {
    const result = await this.paymentDomainService.setStatus(data);
    return new PaymentDomainEntity(result);
  }

  async execute(id: string, status: string) {
    const order = await Order.findById(id);
    if (!order) {
      this.logger.error(`Order with id ${id} not found`);
      return;
    }

    switch (status) {
      case PaymentStatus.PAID:
        if (order.status !== 'completed') await this.processOrder(order);
        break;

      case PaymentStatus.FAILED:
        this.logger.warn(`Payment for order ${id} failed`);
        break;

      default:
        this.logger.log(`Status ${status} for order ${id} does not require processing`);
    }
  }

  private async processOrder(order: IOrder) {
    this.logger.log(`Processing blockchain data for order ${order.id}`);

    try {
      if (order.type === PaymentTypeDomainInterface.REGISTRATION) {
        // Используем новый интерактор для регистрации в блокчейне
        await this.accountDomainInteractor.registerBlockchainAccount(order.username);
        this.logger.log('New user registered:', { username: order.username });

        // Обновляем статус заказа
        await Order.updateOne({ _id: order.id }, { status: PaymentStatus.COMPLETED });
      } else if (order.type === PaymentTypeDomainInterface.DEPOSIT) {
        await blockchainService.completeDeposit(order);

        // Обновляем статус заказа
        await Order.updateOne({ _id: order.id }, { status: PaymentStatus.COMPLETED });
        this.logger.log(`User ${order.username} made a share contribution of ${order.quantity}`);
      }
    } catch (e: any) {
      await Order.updateOne({ _id: order.id }, { status: PaymentStatus.FAILED, message: e.message });
      this.logger.error(`Error processing blockchain transaction for order: ${order.id} with message: ${e.message}`, e);
    }
  }
}
