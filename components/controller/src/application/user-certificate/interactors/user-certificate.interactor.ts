import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AccountDomainService, ACCOUNT_DOMAIN_SERVICE } from '~/domain/account/services/account-domain.service';
import {
  UserCertificateDomainService,
  USER_CERTIFICATE_DOMAIN_SERVICE,
} from '~/domain/user-certificate/services/user-certificate-domain.service';
import type { UserCertificateDomainInterface } from '~/domain/user-certificate/interfaces/user-certificate-domain.interface';

@Injectable()
export class UserCertificateInteractor {
  constructor(
    @Inject(forwardRef(() => ACCOUNT_DOMAIN_SERVICE)) private readonly accountDomainService: AccountDomainService,
    @Inject(USER_CERTIFICATE_DOMAIN_SERVICE) private readonly userCertificateDomainService: UserCertificateDomainService
  ) {}

  /**
   * Получает сертификат пользователя по имени аккаунта
   * @param username Имя аккаунта пользователя
   * @returns Сертификат пользователя или null
   */
  async getCertificateByUsername(username: string): Promise<UserCertificateDomainInterface | null> {
    const account = await this.accountDomainService.getPrivateAccount(username);
    return this.userCertificateDomainService.createCertificateFromUserData(account);
  }
}

export const USER_CERTIFICATE_INTERACTOR = Symbol('USER_CERTIFICATE_INTERACTOR');
