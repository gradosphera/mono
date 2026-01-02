import { Module } from '@nestjs/common';
import { ParticipantResolver } from './resolvers/participant.resolver';
import { ParticipantService } from './services/participant.service';
import { ParticipantNotificationService } from './services/participant-notification.service';
import { ParticipantInteractor } from './interactors/participant.interactor';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { DocumentDomainModule } from '~/domain/document/document.module';
import { AccountDomainModule } from '~/domain/account/account-domain.module';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';
import { NotificationDomainModule } from '~/domain/notification/notification-domain.module';
import { NotificationModule } from '~/application/notification/notification.module';
import { TokenApplicationModule } from '~/application/token/token-application.module';
import { UserDomainModule } from '~/domain/user/user-domain.module';
import { GatewayInfrastructureModule } from '~/infrastructure/gateway/gateway-infrastructure.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';

@Module({
  imports: [
    NovuModule,
    DocumentDomainModule,
    AccountDomainModule,
    GatewayDomainModule,
    GatewayInfrastructureModule,
    NotificationDomainModule,
    NotificationModule,
    TokenApplicationModule,
    UserDomainModule,
    UserCertificateDomainModule,
    AccountInfrastructureModule,
  ],
  controllers: [],
  providers: [ParticipantResolver, ParticipantService, ParticipantNotificationService, ParticipantInteractor],
  exports: [ParticipantNotificationService],
})
export class ParticipantModule {}
