import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { PaymentController } from './controllers/payment.controller';
import { PaymentResolver } from './resolvers/payment.resolver';
import { PaymentService } from './services/payment.service';
import { PaymentStatus } from '~/domain/payment/interfaces/payment-status-domain.interface';
import { registerEnumType } from '@nestjs/graphql';

@Module({
  imports: [DomainModule],
  controllers: [PaymentController],
  providers: [PaymentResolver, PaymentService],
  exports: [],
})
export class PaymentModule {
  constructor() {
    registerEnumType(PaymentStatus, {
      name: 'PaymentStatus',
      description: 'Статус платежа',
    });
  }
}
