// payment-method.service.ts
import { Injectable } from '@nestjs/common';
import { PaymentMethodDomainInteractor } from '~/domain/payment-method/interactors/method.interactor';
import type { GetPaymentMethodsInputDTO } from '../dto/get-payment-methods-input.dto';
import type { UpdateBankAccountInputDTO } from '../dto/update-bank-account-input.dto';
import type { DeletePaymentMethodDTO } from '../dto/delete-payment-method-input.dto';
import type { CreateBankAccountInputDTO } from '../dto/create-bank-account-input.dto';
import type { PaymentMethodDomainEntity } from '~/domain/payment-method/entities/method-domain.entity';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { PaymentMethodDTO } from '../dto/payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly paymentMethodDomainInteractor: PaymentMethodDomainInteractor) {}

  async listPaymentMethods(
    data?: GetPaymentMethodsInputDTO
  ): Promise<PaginationResultDomainInterface<PaymentMethodDomainEntity>> {
    return this.paymentMethodDomainInteractor.listPaymentMethods(data);
  }

  async createBankAccount(data: CreateBankAccountInputDTO): Promise<PaymentMethodDTO> {
    return new PaymentMethodDTO(await this.paymentMethodDomainInteractor.createBankAccount(data));
  }

  async updateBankAccount(data: UpdateBankAccountInputDTO): Promise<PaymentMethodDTO> {
    return new PaymentMethodDTO(await this.paymentMethodDomainInteractor.updateBankAccount(data));
  }

  async deletePaymentMethod(data: DeletePaymentMethodDTO): Promise<void> {
    await this.paymentMethodDomainInteractor.deletePaymentMethod(data.username, data.method_id);
  }
}

// ПАГИНАЦИЯ на будущее как-то так. Работа должна быть реализована в репозиториях
// /**
//    * Получает список методов оплаты с учётом пагинации и сортировки.
//    *
//    * @param paginationInput - Параметры пагинации и сортировки.
//    * @returns {Promise<PaginationResult<PaymentMethodEntity>>}
//    */
// async listPaymentMethods(
//   paginationInput: PaginationInputDTO
// ): Promise<PaginationResult<PaymentMethodEntity>> {
//   const queryBuilder = this.paymentMethodRepository.createQueryBuilder('paymentMethod');
//   return this.paginationService.paginate(queryBuilder, paginationInput);
// }
