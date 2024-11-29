// payment-method.interactor.ts
import { Inject, Injectable } from '@nestjs/common';
import { userService } from '~/services';
import { PAYMENT_METHOD_REPOSITORY, PaymentMethodRepository } from '../../common/repositories/payment-method.repository';
import { PaymentMethodDomainEntity } from '../entities/method-domain.entity';
import { randomUUID } from 'crypto';
import { CreateBankAccountInputDTO } from '~/modules/payment-method/dto/create-bank-account-input.dto';
import { UpdateBankAccountInputDTO } from '~/modules/payment-method/dto/update-bank-account-input.dto';
import type { GetPaymentMethodsDomainInterface } from '../interfaces/get-payment-methods-input.interface';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { CreateBankAccountDomainInterface } from '../interfaces/create-bank-account-domain.interface';

@Injectable()
export class PaymentMethodDomainInteractor {
  constructor(@Inject(PAYMENT_METHOD_REPOSITORY) private readonly methodRepository: PaymentMethodRepository) {}

  async listPaymentMethods(
    data?: GetPaymentMethodsDomainInterface
  ): Promise<PaginationResultDomainInterface<PaymentMethodDomainEntity>> {
    return await this.methodRepository.list(data);
  }

  async deletePaymentMethod(username: string, method_id: string): Promise<void> {
    await this.methodRepository.delete(username, method_id);
  }

  async createBankAccount(data: CreateBankAccountDomainInterface): Promise<PaymentMethodDomainEntity> {
    const user = await userService.getUserByUsername(data.username);

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const paymentData = new PaymentMethodDomainEntity({
      username: data.username,
      method_id: randomUUID().toString(),
      method_type: 'bank_transfer',
      is_default: false,
      data: data.data,
    });

    await this.methodRepository.save(paymentData);

    return paymentData;
  }

  async updateBankAccount(data: UpdateBankAccountInputDTO): Promise<PaymentMethodDomainEntity> {
    const user = await userService.getUserByUsername(data.username);

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const paymentData = new PaymentMethodDomainEntity({
      username: data.username,
      method_id: data.method_id,
      method_type: 'bank_transfer',
      is_default: data.is_default,
      data: data.data,
    });

    await this.methodRepository.save(paymentData);

    return paymentData;
  }
}
