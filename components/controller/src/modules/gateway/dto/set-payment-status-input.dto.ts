import { Field, InputType } from '@nestjs/graphql';
import { PaymentStatusEnum } from '~/domain/gateway/enums/payment-status.enum';

@InputType('SetPaymentStatusInput')
export class SetPaymentStatusInputDTO {
  @Field(() => String, { description: 'Идентификатор платежа, для которого устанавливается статус' })
  id!: string;

  @Field(() => PaymentStatusEnum, { description: 'Новый статус платежа' })
  status!: PaymentStatusEnum;
}
