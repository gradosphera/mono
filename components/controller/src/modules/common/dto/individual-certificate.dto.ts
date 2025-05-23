import { ObjectType, Field } from '@nestjs/graphql';
import { AccountType } from '~/modules/account/enum/account-type.enum';
import { IndividualCertificateDomainInterface } from '../../../domain/user-certificate/interfaces/user-certificate-domain.interface';

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
