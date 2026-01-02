import type { EntrepreneurDomainInterface } from '~/domain/common/interfaces/entrepreneur-domain.interface';
import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';
import type {
  EntrepreneurCertificateDomainInterface,
  IndividualCertificateDomainInterface,
  OrganizationCertificateDomainInterface,
} from './user-certificate-domain.interface';

/**
 * Интерфейс сервиса сертификатов пользователей
 */
export interface UserCertificateServiceInterface {
  /**
   * Создает сертификат из данных физического лица
   */
  createIndividualCertificate(data: IndividualDomainInterface): IndividualCertificateDomainInterface;

  /**
   * Создает сертификат из данных ИП
   */
  createEntrepreneurCertificate(data: EntrepreneurDomainInterface): EntrepreneurCertificateDomainInterface;

  /**
   * Создает сертификат из данных организации
   */
  createOrganizationCertificate(data: OrganizationDomainInterface): OrganizationCertificateDomainInterface;

  /**
   * Создает сертификат из полных данных пользователя
   */
  createCertificateFromUserData(
    data: IndividualDomainInterface | EntrepreneurDomainInterface | OrganizationDomainInterface | null
  ):
    | IndividualCertificateDomainInterface
    | EntrepreneurCertificateDomainInterface
    | OrganizationCertificateDomainInterface
    | null;
}
