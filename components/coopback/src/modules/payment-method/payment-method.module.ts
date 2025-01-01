import { Module } from '@nestjs/common';
import { PaymentMethodService } from './services/payment-method.service';
import { PaymentMethodResolver } from './resolvers/payment-method.resolver';
import { DomainModule } from '~/domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [],
  providers: [PaymentMethodService, PaymentMethodResolver],
  exports: [],
})
export class PaymentMethodModule {}
