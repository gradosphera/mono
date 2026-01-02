import { Module } from '@nestjs/common';
import { RegistrationResolver } from './resolvers/registration.resolver';
import { RegistrationService } from './services/registration.service';
import { UserCertificateInteractor } from './interactors/user-certificate.interactor';
import { RegistrationDomainModule } from '~/domain/registration/registration-domain.module';
import { UserDomainModule } from '~/domain/user/user-domain.module';

@Module({
  imports: [RegistrationDomainModule, UserDomainModule],
  providers: [RegistrationResolver, RegistrationService, UserCertificateInteractor],
  exports: [RegistrationService, UserCertificateInteractor],
})
export class UserModule {}
