import { forwardRef, Module } from '@nestjs/common';
import { RegistrationResolver } from './resolvers/registration.resolver';
import { RegistrationService } from './services/registration.service';
import { AccountDomainModule } from '~/domain/account/account-domain.module';
import { RegistrationDomainModule } from '~/domain/registration/registration-domain.module';
import { ParticipantModule } from '../participant/participant.module';
import { UserDomainModule } from '~/domain/user/user-domain.module';
import { UserInfrastructureModule } from '~/infrastructure/user/user-infrastructure.module';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';

@Module({
  imports: [
    AccountDomainModule,
    AccountInfrastructureModule,
    RegistrationDomainModule,
    UserDomainModule,
    UserInfrastructureModule,
    ParticipantModule,
  ],
  providers: [
    RegistrationResolver,
    RegistrationService,
  ],
  exports: [RegistrationService],
})
export class RegistrationModule {}
