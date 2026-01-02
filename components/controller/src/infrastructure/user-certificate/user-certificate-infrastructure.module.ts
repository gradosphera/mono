import { Module } from '@nestjs/common';
import { UserCertificateAdapter } from './user-certificate.adapter';
import { USER_CERTIFICATE_DOMAIN_PORT } from '~/domain/user-certificate/ports/user-certificate-domain.port';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { AccountDomainModule } from '~/domain/account/account-domain.module';

@Module({
  imports: [UserCertificateDomainModule, AccountDomainModule],
  providers: [
    UserCertificateAdapter,
    {
      provide: USER_CERTIFICATE_DOMAIN_PORT,
      useExisting: UserCertificateAdapter,
    },
  ],
  exports: [UserCertificateAdapter, USER_CERTIFICATE_DOMAIN_PORT],
})
export class UserCertificateInfrastructureModule {}
