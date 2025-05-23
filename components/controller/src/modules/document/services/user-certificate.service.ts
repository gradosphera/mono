import { Injectable } from '@nestjs/common';
import type { EntrepreneurDomainInterface } from '~/domain/common/interfaces/entrepreneur-domain.interface';
import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';
import { UserCertificateDomainService } from '~/domain/user-certificate/services/user-certificate-domain.service';
import {
  EntrepreneurCertificateDTO,
  IndividualCertificateDTO,
  OrganizationCertificateDTO,
} from '~/modules/common/dto/user-certificate.dto';
import {
  EntrepreneurCertificateDomainInterface,
  IndividualCertificateDomainInterface,
  OrganizationCertificateDomainInterface,
  UserCertificateDomainInterface,
} from '~/domain/user-certificate/interfaces/user-certificate-domain.interface';

@Injectable()
export class UserCertificateService {
  constructor(private readonly userCertificateDomainService: UserCertificateDomainService) {}

  /**
   * Создает сертификат из данных физического лица
   */
  createIndividualCertificate(data: IndividualDomainInterface): IndividualCertificateDTO {
    const certificateDomain = this.userCertificateDomainService.createIndividualCertificate(data);
    return new IndividualCertificateDTO(certificateDomain as IndividualCertificateDomainInterface);
  }

  /**
   * Создает сертификат из данных ИП
   */
  createEntrepreneurCertificate(data: EntrepreneurDomainInterface): EntrepreneurCertificateDTO {
    const certificateDomain = this.userCertificateDomainService.createEntrepreneurCertificate(data);
    return new EntrepreneurCertificateDTO(certificateDomain as EntrepreneurCertificateDomainInterface);
  }

  /**
   * Создает сертификат из данных организации
   */
  createOrganizationCertificate(data: OrganizationDomainInterface): OrganizationCertificateDTO {
    const certificateDomain = this.userCertificateDomainService.createOrganizationCertificate(data);
    return new OrganizationCertificateDTO(certificateDomain as OrganizationCertificateDomainInterface);
  }

  /**
   * Функция для проверки, является ли объект сертификатом организации
   */
  private isOrganizationCertificate(
    certificate: UserCertificateDomainInterface
  ): certificate is OrganizationCertificateDomainInterface {
    return 'ogrn' in certificate && 'short_name' in certificate;
  }

  /**
   * Функция для проверки, является ли объект сертификатом ИП
   */
  private isEntrepreneurCertificate(
    certificate: UserCertificateDomainInterface
  ): certificate is EntrepreneurCertificateDomainInterface {
    return 'inn' in certificate && 'first_name' in certificate && !('ogrn' in certificate);
  }

  /**
   * Функция для проверки, является ли объект сертификатом физлица
   */
  private isIndividualCertificate(
    certificate: UserCertificateDomainInterface
  ): certificate is IndividualCertificateDomainInterface {
    return 'first_name' in certificate && !('inn' in certificate) && !('ogrn' in certificate);
  }

  /**
   * Создает сертификат из полных данных пользователя
   */
  createCertificateFromUserData(
    data: IndividualDomainInterface | EntrepreneurDomainInterface | OrganizationDomainInterface | null
  ): IndividualCertificateDTO | EntrepreneurCertificateDTO | OrganizationCertificateDTO | null {
    if (!data) return null;

    const certificateDomain = this.userCertificateDomainService.createCertificateFromUserData(data);

    if (!certificateDomain) return null;

    // Используем type guards для определения типа сертификата
    if (this.isOrganizationCertificate(certificateDomain)) {
      return new OrganizationCertificateDTO(certificateDomain);
    } else if (this.isEntrepreneurCertificate(certificateDomain)) {
      return new EntrepreneurCertificateDTO(certificateDomain);
    } else if (this.isIndividualCertificate(certificateDomain)) {
      return new IndividualCertificateDTO(certificateDomain);
    }

    // Этот случай не должен наступить, но TypeScript требует возврат
    return null;
  }
}
