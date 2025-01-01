import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType('CreateInitialPaymentInput')
export class CreateInitialPaymentInputDTO {
  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString({ message: 'Поле "username" должно быть строкой' })
  username!: string;
}
