import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { MeetResolver } from './resolvers/meet.resolver';
import { MeetService } from './services/meet.service';
import { MeetEventService } from './services/meet-event.service';
import { MeetInteractor } from './interactors/meet.interactor';
import { AgendaNotificationService } from '../agenda/services/agenda-notification.service';
import { DecisionNotificationService } from '../agenda/services/decision-notification.service';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { MeetDomainModule } from '~/domain/meet/meet-domain.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { UserCertificateInfrastructureModule } from '~/infrastructure/user-certificate/user-certificate-infrastructure.module';
import { MeetInfrastructureModule } from '~/infrastructure/meet/meet-infrastructure.module';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';
import { DatabaseModule } from '~/infrastructure/database/database.module';
import { BlockchainModule } from '~/infrastructure/blockchain/blockchain.module';
import { DocumentDomainModule } from '~/domain/document/document.module';

@Module({
  imports: [
    DocumentModule,
    DocumentDomainModule,
    DatabaseModule,
    BlockchainModule,
    NovuModule,
    MeetDomainModule,
    UserCertificateInfrastructureModule,
    UserCertificateDomainModule,
    MeetInfrastructureModule,
    AccountInfrastructureModule,
  ],
  controllers: [],
  providers: [
    MeetResolver,
    MeetService,
    MeetEventService,
    MeetInteractor,
    AgendaNotificationService,
    DecisionNotificationService,
  ],
  exports: [AgendaNotificationService, DecisionNotificationService],
})
export class MeetModule {}
