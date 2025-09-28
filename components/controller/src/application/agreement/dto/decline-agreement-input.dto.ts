import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType('DeclineAgreementInput')
export class DeclineAgreementInputDTO {
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

  @Field(() => String, { description: 'Комментарий к отказу' })
  @IsString()
  comment!: string;
}
