import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { MeetResolver } from './resolvers/meet.resolver';
import { MeetService } from './services/meet.service';
import { AgendaNotificationService } from '../agenda/services/agenda-notification.service';
import { DecisionNotificationService } from '../agenda/services/decision-notification.service';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { MeetDomainModule } from '~/domain/meet/meet-domain.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { MeetInfrastructureModule } from '~/infrastructure/meet/meet-infrastructure.module';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';

@Module({
  imports: [
    DocumentModule,
    NovuModule,
    MeetDomainModule,
    UserCertificateDomainModule,
    MeetInfrastructureModule,
    AccountInfrastructureModule,
  ],
  controllers: [],
  providers: [MeetResolver, MeetService, AgendaNotificationService, DecisionNotificationService],
  exports: [AgendaNotificationService, DecisionNotificationService],
})
export class MeetModule {}
