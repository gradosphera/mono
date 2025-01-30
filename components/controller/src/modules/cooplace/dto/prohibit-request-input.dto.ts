import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumberString } from 'class-validator';

@InputType('ProhibitRequestInput')
export class ProhibitRequestInputDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор обмена' })
  @IsNumberString()
  exchange_id!: string;

  @Field(() => String, { description: 'Дополнительная информация о запрете' })
  @IsString()
  meta!: string;
}
