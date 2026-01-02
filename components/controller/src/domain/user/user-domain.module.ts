import { Global, Module } from '@nestjs/common';
import { UserDomainService, USER_DOMAIN_SERVICE } from './services/user-domain.service';
import { UserCertificateDomainService, USER_CERTIFICATE_DOMAIN_SERVICE } from './services/user-certificate-domain.service';

/**
 * Доменный модуль пользователей
 * Предоставляет доменные сервисы для работы с пользователями и сертификатами
 */
@Global()
@Module({
  providers: [
    UserDomainService,
    {
      provide: USER_DOMAIN_SERVICE,
      useExisting: UserDomainService,
    },
    UserCertificateDomainService,
    {
      provide: USER_CERTIFICATE_DOMAIN_SERVICE,
      useExisting: UserCertificateDomainService,
    },
  ],
  exports: [UserDomainService, USER_DOMAIN_SERVICE, UserCertificateDomainService, USER_CERTIFICATE_DOMAIN_SERVICE],
})
export class UserDomainModule {}
