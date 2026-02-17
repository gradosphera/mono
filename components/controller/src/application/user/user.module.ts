import { Module } from '@nestjs/common';
import { UserCertificateInteractor } from './interactors/user-certificate.interactor';
import { UserDomainModule } from '~/domain/user/user-domain.module';

@Module({
  imports: [UserDomainModule],
  providers: [UserCertificateInteractor],
  exports: [UserCertificateInteractor],
})
export class UserModule {}
