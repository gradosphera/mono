import { ObjectType, Field } from '@nestjs/graphql';
import {
  IndividualCertificateDomainInterface,
  EntrepreneurCertificateDomainInterface,
  OrganizationCertificateDomainInterface,
  type RepresentedByCertificateDomainInterface,
} from '../../../domain/user-certificate/interfaces/user-certificate-domain.interface';
import { AccountType } from '~/modules/account/enum/account-type.enum';

/**
 * DTO для упрощенного представления представителя в сертификате
 */
@ObjectType('RepresentedByCertificate')
export class RepresentedByCertificateDTO {
  @Field(() => String, { description: 'Имя' })
  first_name: string;

  @Field(() => String, { description: 'Фамилия' })
  last_name: string;

  @Field(() => String, { description: 'Отчество' })
  middle_name: string;

  @Field(() => String, { description: 'Должность' })
  position: string;

  constructor(data: RepresentedByCertificateDomainInterface) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.middle_name = data.middle_name;
    this.position = data.position;
  }
}

/**
 * Сертификат физического лица
 */
@ObjectType('IndividualCertificate')
export class IndividualCertificateDTO implements IndividualCertificateDomainInterface {
  @Field(() => AccountType, { description: 'Тип аккаунта' })
  type: AccountType.individual;

  @Field(() => String, { description: 'Имя аккаунта' })
  username: string;

  @Field(() => String, { description: 'Имя' })
  first_name: string;

  @Field(() => String, { description: 'Фамилия' })
  last_name: string;

  @Field(() => String, { nullable: true, description: 'Отчество' })
  middle_name?: string;

  constructor(data: IndividualCertificateDomainInterface) {
    this.type = AccountType.individual;
    this.username = data.username;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.middle_name = data.middle_name;
  }

  static isTypeOf(value: any): boolean {
    return value.username && value.first_name && value.last_name && !value.details && !value.ogrn && !value.inn;
  }
}

/**
 * Сертификат ИП
 */
@ObjectType('EntrepreneurCertificate')
export class EntrepreneurCertificateDTO implements EntrepreneurCertificateDomainInterface {
  @Field(() => AccountType, { description: 'Тип аккаунта' })
  type: AccountType.entrepreneur;

  @Field(() => String, { description: 'Имя аккаунта' })
  username: string;

  @Field(() => String, { description: 'Имя' })
  first_name: string;

  @Field(() => String, { description: 'Фамилия' })
  last_name: string;

  @Field(() => String, { nullable: true, description: 'Отчество' })
  middle_name?: string;

  @Field(() => String, { description: 'ИНН' })
  inn: string;

  constructor(data: EntrepreneurCertificateDomainInterface) {
    this.type = AccountType.entrepreneur;
    this.username = data.username;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.middle_name = data.middle_name;
    this.inn = data.inn;
  }

  static isTypeOf(value: any): boolean {
    return value.username && value.first_name && value.last_name && value.inn && !value.ogrn;
  }
}

/**
 * Сертификат организации
 */
@ObjectType('OrganizationCertificate')
export class OrganizationCertificateDTO implements OrganizationCertificateDomainInterface {
  @Field(() => AccountType, { description: 'Тип аккаунта' })
  type: AccountType.organization;

  @Field(() => String, { description: 'Имя аккаунта' })
  username: string;

  // Дополнительное поле для короткого имени организации
  @Field(() => String, { description: 'Короткое название организации' })
  short_name: string;

  @Field(() => String, { description: 'ИНН' })
  inn: string;

  @Field(() => String, { description: 'ОГРН' })
  ogrn: string;

  // Поле для хранения данных представителя
  @Field(() => RepresentedByCertificateDTO, { description: 'Данные представителя' })
  represented_by: RepresentedByCertificateDTO;

  constructor(data: OrganizationCertificateDomainInterface) {
    this.type = AccountType.organization;
    this.username = data.username;
    this.short_name = data.short_name;
    this.inn = data.inn;
    this.ogrn = data.ogrn;
    this.represented_by = new RepresentedByCertificateDTO(data.represented_by);
  }

  static isTypeOf(value: any): boolean {
    return value.username && value.inn && value.ogrn;
  }
}
