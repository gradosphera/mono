import { Module } from '@nestjs/common';
import { RegistrationResolver } from './resolvers/registration.resolver';
import { RegistrationService } from './services/registration.service';
import { RegistrationDomainModule } from '~/domain/registration/registration-domain.module';

@Module({
  imports: [RegistrationDomainModule],
  providers: [RegistrationResolver, RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
