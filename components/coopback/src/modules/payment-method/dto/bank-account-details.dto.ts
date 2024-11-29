import { ObjectType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType('BankAccountDetails')
export class BankAccountDetailsDTO {
  @Field(() => String, { description: 'БИК банка' })
  @IsNotEmpty({ message: 'БИК банка обязателен обязателен' })
  bik: string;

  @Field(() => String, { description: 'Корреспондентский счет' })
  @IsNotEmpty({ message: 'Корр. счет обязателен' })
  @IsString()
  corr: string;

  @Field(() => String, { description: 'КПП банка' })
  @IsNotEmpty({ message: 'КПП обязателен' })
  @IsString()
  kpp: string;

  constructor(details: { bik: string; corr: string; kpp: string }) {
    this.bik = details.bik;
    this.corr = details.corr;
    this.kpp = details.kpp;
  }
}
