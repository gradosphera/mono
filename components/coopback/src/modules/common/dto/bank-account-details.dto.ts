import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('BankAccountDetails')
export class BankAccountDetailsGraphQLDTO {
  @Field(() => String, { description: 'БИК банка' })
  bik: string;

  @Field(() => String, { description: 'Корреспондентский счет' })
  corr: string;

  @Field(() => String, { description: 'КПП банка' })
  kpp: string;

  constructor(details: { bik: string; corr: string; kpp: string }) {
    this.bik = details.bik;
    this.corr = details.corr;
    this.kpp = details.kpp;
  }
}
