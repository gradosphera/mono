import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumber } from 'class-validator';

@InputType('CreateDepositPaymentInput')
export class CreateDepositPaymentInputDTO {
  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString({ message: 'Поле "username" должно быть строкой' })
  username!: string;

  @Field(() => Number, { description: 'Сумма взноса' })
  @IsNumber({}, { message: 'Поле "quantity" должно быть числом' })
  quantity!: number;

  @Field(() => String, { description: 'Символ валюты' })
  @IsString({ message: 'Поле "symbol" должно быть строкой' })
  symbol!: string;
}
