import { Module } from '@nestjs/common';
import { PaymentMethodDomainInteractor } from '~/domain/payment-method/interactors/method.interactor';
import { PaymentMethodService } from './services/payment-method.service';
import { PaymentMethodResolver } from './resolvers/payment-method.resolver';

@Module({
  imports: [],
  controllers: [],
  providers: [PaymentMethodDomainInteractor, PaymentMethodService, PaymentMethodResolver],
  exports: [],
})
export class PaymentMethodModule {}
