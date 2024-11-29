import { ObjectType, Field } from '@nestjs/graphql';
import { BankAccountDTO } from '../../payment-method/dto/bank-account.dto';
import { RepresentedByDTO } from './represented-by.dto';
import type { OrganizationDomainInterface } from '../../../domain/common/interfaces/organization-domain.interface';
import { OrganizationDetailsDTO } from './organization-details.dto';

@ObjectType('Organization')
export class OrganizationDTO implements OrganizationDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта организации' })
  username: string;

  @Field(() => String, { description: 'Тип организации' })
  type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';

  @Field(() => String, { description: 'Краткое название' })
  short_name: string;

  @Field(() => String, { description: 'Полное название' })
  full_name: string;

  @Field(() => RepresentedByDTO, { description: 'Представитель организации' })
  represented_by: RepresentedByDTO;

  @Field(() => String, { description: 'Страна' })
  country: string;

  @Field(() => String, { description: 'Город' })
  city: string;

  @Field(() => String, { description: 'Юридический адрес' })
  full_address: string;

  @Field(() => String, { description: 'Фактический адрес' })
  fact_address: string;

  @Field(() => String, { description: 'Телефон' })
  phone: string;

  @Field(() => String, { description: 'Email' })
  email: string;

  @Field(() => OrganizationDetailsDTO, { description: 'Детали организации' })
  details: OrganizationDetailsDTO;

  @Field(() => BankAccountDTO, { description: 'Банковский счет' })
  bank_account: BankAccountDTO;

  constructor(data: OrganizationDomainInterface) {
    this.username = data.username;
    this.type = data.type;
    this.short_name = data.short_name;
    this.full_name = data.full_name;
    this.represented_by = new RepresentedByDTO(data.represented_by);
    this.country = data.country;
    this.city = data.city;
    this.full_address = data.full_address;
    this.fact_address = data.fact_address;
    this.phone = data.phone;
    this.email = data.email;
    this.details = new OrganizationDetailsDTO(data.details);
    this.bank_account = new BankAccountDTO(data.bank_account);
  }
}
