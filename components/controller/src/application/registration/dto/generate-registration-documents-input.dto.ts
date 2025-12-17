import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEnum } from 'class-validator';
import { AccountType } from '~/application/account/enum/account-type.enum';

@InputType('GenerateRegistrationDocumentsInput')
export class GenerateRegistrationDocumentsInputDTO {
  @Field({ description: 'Имя кооператива' })
  @IsString()
  coopname!: string;

  @Field({ description: 'Имя пользователя (аккаунт)' })
  @IsString()
  username!: string;

  @Field(() => AccountType, { description: 'Тип аккаунта пайщика' })
  @IsEnum(AccountType)
  account_type!: AccountType;
}
