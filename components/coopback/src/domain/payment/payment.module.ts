// domain/payment/payment.module.ts

import { Module } from '@nestjs/common';
import { PaymentInteractor } from './interactors/payment.interactor';
import { PaymentDomainService } from './services/payment-domain.service';

@Module({
  imports: [],
  providers: [PaymentInteractor, PaymentDomainService],
  exports: [PaymentInteractor, PaymentDomainService],
})
export class PaymentDomainModule {}
