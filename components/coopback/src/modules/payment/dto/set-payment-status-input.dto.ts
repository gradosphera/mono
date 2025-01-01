import { Field, InputType } from '@nestjs/graphql';
import { PaymentStatus } from '~/domain/payment/interfaces/payment-status-domain.interface';

@InputType('SetPaymentStatusInput')
export class SetPaymentStatusInputDTO {
  @Field(() => String, { description: 'Идентификатор платежа, для которого устанавливается статус' })
  id!: string;

  @Field(() => PaymentStatus, { description: 'Новый статус платежа' })
  status!: PaymentStatus;
}
