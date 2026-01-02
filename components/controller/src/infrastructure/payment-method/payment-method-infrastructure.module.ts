import { Module } from '@nestjs/common';
import { PaymentMethodAdapter } from './payment-method-domain.adapter';
import { PAYMENT_METHOD_DOMAIN_PORT } from '~/domain/payment-method/ports/payment-method-domain.port';
import { PaymentMethodModule } from '~/application/payment-method/payment-method.module';

@Module({
  imports: [PaymentMethodModule],
  providers: [
    PaymentMethodAdapter,
    {
      provide: PAYMENT_METHOD_DOMAIN_PORT,
      useClass: PaymentMethodAdapter,
    },
  ],
  exports: [PaymentMethodAdapter, PAYMENT_METHOD_DOMAIN_PORT],
})
export class PaymentMethodInfrastructureModule {}
