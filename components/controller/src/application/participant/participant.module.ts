import { Module } from '@nestjs/common';
import { ParticipantResolver } from './resolvers/participant.resolver';
import { ParticipantService } from './services/participant.service';
import { ParticipantNotificationService } from './services/participant-notification.service';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { ParticipantDomainModule } from '~/domain/participant/participant-domain.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';

@Module({
  imports: [NovuModule, ParticipantDomainModule, UserCertificateDomainModule, AccountInfrastructureModule],
  controllers: [],
  providers: [ParticipantResolver, ParticipantService, ParticipantNotificationService],
  exports: [ParticipantNotificationService],
})
export class ParticipantModule {}
