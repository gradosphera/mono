import type { AccountType } from '~/modules/account/enum/account-type.enum';

/**
 * Интерфейс сертификата физического лица
 */
export interface IndividualCertificateDomainInterface {
  type: AccountType.individual;
  username: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
}

/**
 * Интерфейс сертификата ИП
 */
export interface EntrepreneurCertificateDomainInterface {
  type: AccountType.entrepreneur;
  username: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  inn: string;
}

/**
 * Интерфейс представителя в сертификате организации
 */
export interface RepresentedByCertificateDomainInterface {
  first_name: string;
  last_name: string;
  middle_name: string;
  position: string;
}

/**
 * Интерфейс сертификата организации
 */
export interface OrganizationCertificateDomainInterface {
  type: AccountType.organization;
  username: string;
  short_name: string;
  inn: string;
  ogrn: string;
  represented_by: RepresentedByCertificateDomainInterface;
}

/**
 * Объединённый тип сертификатов
 */
export type UserCertificateDomainInterface =
  | IndividualCertificateDomainInterface
  | EntrepreneurCertificateDomainInterface
  | OrganizationCertificateDomainInterface;
