import type { UserCertificateDomainInterface } from '~/domain/user/interfaces/user-certificate-domain.interface';

/**
 * Доменный порт для операций с сертификатами пользователей
 * Используется для получения сертификатов пользователей
 */
export interface UserCertificateDomainPort {
  /**
   * Получает сертификат пользователя по имени аккаунта
   * @param username Имя аккаунта пользователя
   * @returns Сертификат пользователя или null
   */
  getCertificateByUsername(username: string): Promise<UserCertificateDomainInterface | null>;
}

export const USER_CERTIFICATE_DOMAIN_PORT = Symbol('UserCertificateDomainPort');
