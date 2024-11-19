import { ObjectType, Field } from '@nestjs/graphql';
import type { BankAccountDomainInterface } from '../../../domain/common/interfaces/bank-account-domain.interface';
import { BankAccountDetailsGraphQLDTO } from './bank-account-details.dto';

@ObjectType('BankAccount')
export class BankAccountGraphQLDTO implements BankAccountDomainInterface {
  @Field(() => String, { description: 'Валюта счета' })
  currency: string;

  @Field(() => String, { nullable: true, description: 'Номер карты' })
  card_number?: string;

  @Field(() => String, { description: 'Название банка' })
  bank_name: string;

  @Field(() => String, { description: 'Номер банковского счета' })
  account_number: string;

  @Field(() => BankAccountDetailsGraphQLDTO, { description: 'Детали счета' })
  details: BankAccountDetailsGraphQLDTO;

  constructor(data: BankAccountDomainInterface) {
    this.currency = data.currency;
    this.bank_name = data.bank_name;
    this.account_number = data.account_number;
    this.details = data.details;
    this.card_number = data.card_number;
  }
}
