import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumberString } from 'class-validator';

@InputType('PublishRequestInput')
export class PublishRequestInputDTO {
  @Field({ description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор обмена' })
  @IsNumberString()
  exchange_id!: string;
}
