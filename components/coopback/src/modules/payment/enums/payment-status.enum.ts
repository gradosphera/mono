import { registerEnumType } from '@nestjs/graphql';
import { PaymentStatus } from '~/domain/payment/interfaces/payment-status-domain.interface';

// Регистрация enum для использования в GraphQL
registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Статус платежа',
});
