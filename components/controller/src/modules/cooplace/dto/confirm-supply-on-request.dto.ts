import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumberString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType('ConfirmSupplyOnRequestInput')
export class ConfirmSupplyOnRequestInputDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор обмена' })
  @IsNumberString()
  exchange_id!: string;

  @Field(() => Object, { description: 'Документ подтверждения поставки' })
  @ValidateNested()
  @Type(() => Object)
  document!: any;
}
