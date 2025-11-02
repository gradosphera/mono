import { Module } from '@nestjs/common';
import { PaymentMethodService } from './services/payment-method.service';
import { PaymentMethodResolver } from './resolvers/payment-method.resolver';
import { PaymentMethodDomainModule } from '~/domain/payment-method/payment-method-domain.module';

@Module({
  imports: [PaymentMethodDomainModule],
  controllers: [],
  providers: [PaymentMethodService, PaymentMethodResolver],
  exports: [],
})
export class PaymentMethodModule {}
