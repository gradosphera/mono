import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType('PaymentDetails')
export class PaymentDetailsDTO {
  @Field(() => String, { description: 'Строка с данными платежа' })
  data!: string;

  @Field(() => String, { description: 'Сумма платежа с учетом комиссии' })
  amount_plus_fee!: string;

  @Field(() => String, { description: 'Сумма платежа без учета комиссии' })
  amount_without_fee!: string;

  @Field(() => String, { description: 'Размер комиссии в абсолютных значениях' })
  fee_amount!: string;

  @Field(() => Float, { description: 'Процент комиссии' })
  fee_percent!: number;

  @Field(() => Float, { description: 'Фактический процент комиссии' })
  fact_fee_percent!: number;

  @Field(() => Float, { description: 'Допустимый процент отклонения' })
  tolerance_percent!: number;
}
