import { ObjectType, Field } from '@nestjs/graphql';
import { AccountType } from '~/application/account/enum/account-type.enum';
import { OrganizationCertificateDomainInterface } from '../../../domain/user/interfaces/user-certificate-domain.interface';
import { RepresentedByCertificateDTO } from './represented-by-certificate.dto';

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
