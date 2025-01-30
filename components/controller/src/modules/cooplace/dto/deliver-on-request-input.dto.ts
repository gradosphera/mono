import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumberString } from 'class-validator';

@InputType('DeliverOnRequestInput')
export class DeliverOnRequestInputDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор обмена' })
  @IsNumberString()
  exchange_id!: string;
}
