// domain/payment/payment.module.ts

import { Module } from '@nestjs/common';
import { ProcessPaymentInteractor } from './process-payment.interactor';

@Module({
  imports: [],
  providers: [ProcessPaymentInteractor],
  exports: [ProcessPaymentInteractor], // Экспортируем, если потребуется в других модулях
})
export class PaymentModule {}
