import { Module } from '@nestjs/common';
import { UserCertificateInteractor } from './interactors/user-certificate.interactor';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';

@Module({
  imports: [UserCertificateDomainModule],
  providers: [
    UserCertificateInteractor,
    {
      provide: Symbol('USER_CERTIFICATE_INTERACTOR'),
      useExisting: UserCertificateInteractor,
    },
  ],
  exports: [UserCertificateInteractor, Symbol('USER_CERTIFICATE_INTERACTOR')],
})
export class UserCertificateModule {}
