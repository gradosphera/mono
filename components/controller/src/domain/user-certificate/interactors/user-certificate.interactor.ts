import { Injectable } from '@nestjs/common';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { UserCertificateDomainService } from '../services/user-certificate-domain.service';
import type { UserCertificateDomainInterface } from '../interfaces/user-certificate-domain.interface';

@Injectable()
export class UserCertificateInteractor {
  constructor(
    private readonly accountDomainService: AccountDomainService,
    private readonly userCertificateDomainService: UserCertificateDomainService
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
