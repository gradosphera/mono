import { Injectable } from '@nestjs/common';
import type { EntrepreneurDomainInterface } from '~/domain/common/interfaces/entrepreneur-domain.interface';
import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';
import type {
  IndividualCertificateDomainInterface,
  EntrepreneurCertificateDomainInterface,
  OrganizationCertificateDomainInterface,
} from '../interfaces/user-certificate-domain.interface';
import { UserCertificateServiceInterface } from '../interfaces/user-certificate-service.interface';
import { AccountType } from '~/application/account/enum/account-type.enum';

@Injectable()
export class UserCertificateDomainService implements UserCertificateServiceInterface {
  /**
   * Создает сертификат из данных физического лица
   */
  createIndividualCertificate(data: IndividualDomainInterface): IndividualCertificateDomainInterface {
    return {
      type: AccountType.individual,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name,
    };
  }

  /**
   * Создает сертификат из данных ИП
   */
  createEntrepreneurCertificate(data: EntrepreneurDomainInterface): EntrepreneurCertificateDomainInterface {
    return {
      type: AccountType.entrepreneur,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      inn: data.details.inn,
      middle_name: data.middle_name,
    };
  }

  /**
   * Создает сертификат из данных организации
   */
  createOrganizationCertificate(data: OrganizationDomainInterface): OrganizationCertificateDomainInterface {
    return {
      type: AccountType.organization,
      username: data.username,
      short_name: data.short_name,
      inn: data.details.inn,
      ogrn: data.details.ogrn,
      represented_by: data.represented_by,
    };
  }

  /**
   * Создает сертификат из полных данных пользователя
   */
  createCertificateFromUserData(
    data: IndividualDomainInterface | EntrepreneurDomainInterface | OrganizationDomainInterface | null
  ):
    | IndividualCertificateDomainInterface
    | EntrepreneurCertificateDomainInterface
    | OrganizationCertificateDomainInterface
    | null {
    if (!data) return null;

    // Определяем тип пользователя и создаем соответствующий сертификат
    if ('short_name' in data && 'full_name' in data) {
      // Это организация
      return this.createOrganizationCertificate(data as OrganizationDomainInterface);
    } else if ('details' in data && 'first_name' in data) {
      // Это ИП
      return this.createEntrepreneurCertificate(data as EntrepreneurDomainInterface);
    } else {
      // Это физическое лицо
      return this.createIndividualCertificate(data as IndividualDomainInterface);
    }
  }
}

export const USER_CERTIFICATE_DOMAIN_SERVICE = Symbol('USER_CERTIFICATE_DOMAIN_SERVICE');
export const USER_CERTIFICATE_INTERACTOR = Symbol('USER_CERTIFICATE_INTERACTOR');
