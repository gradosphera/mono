import { Field, ObjectType } from '@nestjs/graphql';
import { PaymentDetailsDTO } from './payment-details.dto';
import { PaymentStatus } from '~/domain/payment/interfaces/payment-status-domain.interface';

@ObjectType('Payment')
export class PaymentDTO {
  @Field(() => String, { description: 'Идентификатор платежа во внутренней системе учёта' })
  id!: string;

  @Field(() => Number, { description: 'Идентификационный номер платежа в блокчейне' })
  blockchain_id!: number;

  @Field(() => String, { description: 'Идентификатор наименования провайдера платежа, ответственного за обработку' })
  provider!: string;

  @Field(() => PaymentDetailsDTO, { description: 'Детали платежа' })
  details!: PaymentDetailsDTO;

  @Field(() => String, {
    description: 'Тип платежа (deposit или registration)',
  })
  type!: string;

  @Field(() => PaymentStatus, {
    description: 'Идентификатор номера платежа, который отображается пользователю в платежных документах',
  })
  status!: PaymentStatus;

  @Field(() => String, {
    description: 'Содержит сервисное сообщение провайдера об ошибке обработки платежа',
  })
  message!: string;

  @Field(() => Number, {
    description: 'Сумма платежа',
  })
  amount!: number;

  @Field(() => String, {
    description: 'Символ тикера валюты платежа',
  })
  symbol!: string;

  @Field(() => String, {
    description: 'Имя аккаунта пользователя, совершающего платеж',
  })
  username!: string;

  @Field(() => Date, {
    description: 'Дата истечения срока давности платежа',
  })
  expired_at!: Date;

  @Field(() => Date, {
    description: 'Дата создания платежа',
  })
  created_at!: Date;

  @Field(() => Date, {
    description: 'Дата обновления платежа',
  })
  updated_at!: Date;
}
