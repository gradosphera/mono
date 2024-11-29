import { ObjectType, Field } from '@nestjs/graphql';
import { BankAccountDTO } from '../../payment-method/dto/bank-account.dto';
import type { EntrepreneurDomainInterface } from '../../../domain/common/interfaces/entrepreneur-domain.interface';
import { EntrepreneurDetailsDTO } from './entrepreneur-details.dto';

@ObjectType('Entrepreneur')
export class EntrepreneurDTO implements EntrepreneurDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта' })
  username: string;

  @Field(() => String, { description: 'Имя' })
  first_name: string;

  @Field(() => String, { description: 'Фамилия' })
  last_name: string;

  @Field(() => String, { description: 'Отчество' })
  middle_name: string;

  @Field(() => String, { description: 'Дата рождения' })
  birthdate: string;

  @Field(() => String, { description: 'Телефон' })
  phone: string;

  @Field(() => String, { description: 'Email' })
  email: string;

  @Field(() => String, { description: 'Страна' })
  country: string;

  @Field(() => String, { description: 'Город' })
  city: string;

  @Field(() => String, { description: 'Юридический адрес' })
  full_address: string;

  @Field(() => EntrepreneurDetailsDTO, { description: 'Детали ИП (ИНН, ОГРН)' })
  details: EntrepreneurDetailsDTO;

  @Field(() => BankAccountDTO, { description: 'Банковский счет' })
  bank_account: BankAccountDTO;

  constructor(data: EntrepreneurDomainInterface) {
    this.username = data.username;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.middle_name = data.middle_name;
    this.birthdate = data.birthdate;
    this.phone = data.phone;
    this.email = data.email;
    this.country = data.country;
    this.city = data.city;
    this.full_address = data.full_address;
    this.details = new EntrepreneurDetailsDTO(data.details);
    this.bank_account = new BankAccountDTO(data.bank_account);
  }
}
