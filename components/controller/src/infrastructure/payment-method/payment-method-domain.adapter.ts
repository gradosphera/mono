import { Injectable } from '@nestjs/common';
import { PaymentMethodInteractor } from '~/application/payment-method/interactors/payment-method.interactor';
import { PaymentMethodDomainPort } from '~/domain/payment-method/ports/payment-method-domain.port';

@Injectable()
export class PaymentMethodAdapter implements PaymentMethodDomainPort {
  constructor(private readonly paymentMethodInteractor: PaymentMethodInteractor) {}

  async getDefaultPaymentMethod(username: string) {
    return await this.paymentMethodInteractor.getDefaultPaymentMethod(username);
  }
}
