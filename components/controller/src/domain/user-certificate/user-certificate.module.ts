import { Global, Module } from '@nestjs/common';
import { UserCertificateDomainService, USER_CERTIFICATE_DOMAIN_SERVICE } from './services/user-certificate-domain.service';

@Global()
@Module({
  providers: [
    UserCertificateDomainService,
    {
      provide: USER_CERTIFICATE_DOMAIN_SERVICE,
      useExisting: UserCertificateDomainService,
    },
  ],
  exports: [UserCertificateDomainService, USER_CERTIFICATE_DOMAIN_SERVICE],
})
export class UserCertificateDomainModule {}
