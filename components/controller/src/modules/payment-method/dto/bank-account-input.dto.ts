import { Field, InputType } from '@nestjs/graphql';
import type { BankAccountDomainInterface } from '../../../domain/common/interfaces/bank-account-domain.interface';
import { BankAccountDetailsInputDTO } from './bank-account-details-input.dto';
import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

@InputType('BankAccountInput')
export class BankAccountInputDTO implements BankAccountDomainInterface {
  @Field(() => String, { description: 'Валюта счета' })
  @IsString()
  @IsNotEmpty({ message: 'Указание валюты счета обязательно' })
  currency!: string;

  @Field(() => String, { nullable: true, description: 'Номер карты' })
  @IsString()
  card_number?: string;

  @Field(() => String, { description: 'Название банка' })
  @IsString()
  @IsNotEmpty({ message: 'Название банка обязательно' })
  bank_name!: string;

  @Field(() => String, { description: 'Номер банковского счета' })
  @IsString()
  @IsNotEmpty({ message: 'Номер банковского счёта обязателен' })
  account_number!: string;

  @Field(() => BankAccountDetailsInputDTO, { description: 'Детали счета' })
  @IsNotEmpty({ message: 'Детали счёта обязательны' })
  @IsJSON()
  details!: BankAccountDetailsInputDTO;
}
