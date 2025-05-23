import { Module, forwardRef } from '@nestjs/common';
import { UserCertificateDomainService } from './services/user-certificate-domain.service';
import { UserCertificateInteractor } from './interactors/user-certificate.interactor';
import { AccountDomainModule } from '../account/account-domain.module';

@Module({
  imports: [forwardRef(() => AccountDomainModule)],
  providers: [UserCertificateDomainService, UserCertificateInteractor],
  exports: [UserCertificateDomainService, UserCertificateInteractor],
})
export class UserCertificateDomainModule {}
