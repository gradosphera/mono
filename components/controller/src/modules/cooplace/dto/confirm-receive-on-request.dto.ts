import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumberString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType('ConfirmReceiveOnRequestInput')
export class ConfirmReceiveOnRequestInputDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор обмена' })
  @IsNumberString()
  exchange_id!: string;

  @Field(() => Object, { description: 'Документ подтверждения получения' })
  @ValidateNested()
  @Type(() => Object)
  document!: any;
}
