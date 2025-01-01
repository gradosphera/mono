import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateDepositPaymentInputDTO {
  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString({ message: 'Поле "username" должно быть строкой' })
  username!: string;

  @Field(() => String, { description: 'Сумма взноса' })
  @IsString({ message: 'Поле "quantity" должно быть строкой' })
  quantity!: string;
}
