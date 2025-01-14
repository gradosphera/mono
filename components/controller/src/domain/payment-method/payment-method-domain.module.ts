// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { PaymentMethodDomainInteractor } from './interactors/method.interactor';

@Module({
  imports: [],
  providers: [PaymentMethodDomainInteractor],
  exports: [PaymentMethodDomainInteractor],
})
export class PaymentMethodDomainModule {}
