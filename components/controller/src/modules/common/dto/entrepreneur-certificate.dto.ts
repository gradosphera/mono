import { ObjectType, Field } from '@nestjs/graphql';
import { AccountType } from '~/modules/account/enum/account-type.enum';
import { EntrepreneurCertificateDomainInterface } from '../../../domain/user-certificate/interfaces/user-certificate-domain.interface';

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
