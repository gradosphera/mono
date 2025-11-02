import { Global, Module } from '@nestjs/common';
import { UserCertificateDomainService, USER_CERTIFICATE_DOMAIN_SERVICE } from './services/user-certificate-domain.service';
import { UserCertificateInteractor, USER_CERTIFICATE_INTERACTOR } from './interactors/user-certificate.interactor';

@Module({
  providers: [
    UserCertificateDomainService,
    {
      provide: USER_CERTIFICATE_DOMAIN_SERVICE,
      useExisting: UserCertificateDomainService,
    },
    UserCertificateInteractor,
    {
      provide: USER_CERTIFICATE_INTERACTOR,
      useExisting: UserCertificateInteractor,
    },
  ],
  exports: [
    UserCertificateDomainService,
    USER_CERTIFICATE_DOMAIN_SERVICE,
    UserCertificateInteractor,
    USER_CERTIFICATE_INTERACTOR,
  ],
})
export class UserCertificateDomainModule {}
