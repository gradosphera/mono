// domain/payment/payment.module.ts

import { Module } from '@nestjs/common';
import { PaymentInteractor } from './interactors/payment.interactor';
import { PaymentDomainService } from './services/payment-domain.service';
import { AccountDomainModule } from '../account/account-domain.module';

@Module({
  imports: [AccountDomainModule],
  providers: [PaymentInteractor, PaymentDomainService],
  exports: [PaymentInteractor, PaymentDomainService],
})
export class PaymentDomainModule {}
