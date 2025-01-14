import { Injectable } from '@nestjs/common';
import { GetPaymentsInputDTO } from '../dto/get-payments-input.dto';
import type { PaginationInputDTO } from '~/modules/common/dto/pagination.dto';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { PaymentDTO } from '../dto/payment.dto';
import type { CreateInitialPaymentInputDTO } from '../dto/create-initial-payment.dto';
import type { CreateDepositPaymentInputDTO } from '../dto/create-deposit-input.dto';
import type { SetPaymentStatusInputDTO } from '../dto/set-payment-status-input.dto';
import { PaymentInteractor } from '~/domain/payment/interactors/payment.interactor';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentInteractor: PaymentInteractor) {}

  async getPayments(
    data: GetPaymentsInputDTO,
    options: PaginationInputDTO
  ): Promise<PaginationResultDomainInterface<PaymentDTO>> {
    const result = await this.paymentInteractor.getPayments(data, options);

    return {
      items: result.items.map((el) => el.toDTO()),
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  async createInitialPayment(data: CreateInitialPaymentInputDTO): Promise<PaymentDTO> {
    const result = await this.paymentInteractor.createInitialPayment(data);
    return result.toDTO();
  }

  async createDeposit(data: CreateDepositPaymentInputDTO): Promise<PaymentDTO> {
    const result = await this.paymentInteractor.createDeposit(data);
    return result.toDTO();
  }

  async setPaymentStatus(data: SetPaymentStatusInputDTO): Promise<PaymentDTO> {
    const result = await this.paymentInteractor.setPaymentStatus(data);
    return result.toDTO();
  }
}
