import { Module } from '@nestjs/common';
import { PaymentMethodService } from './services/payment-method.service';
import { PaymentMethodResolver } from './resolvers/payment-method.resolver';
import { PaymentMethodInteractor } from './interactors/payment-method.interactor';

@Module({
  imports: [],
  controllers: [],
  providers: [PaymentMethodService, PaymentMethodResolver, PaymentMethodInteractor],
  exports: [PaymentMethodInteractor],
})
export class PaymentMethodModule {}
