import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType('ConfirmAgreementInput')
export class ConfirmAgreementInputDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта администратора' })
  @IsString()
  administrator!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор соглашения' })
  @IsString()
  agreement_id!: string;
}
