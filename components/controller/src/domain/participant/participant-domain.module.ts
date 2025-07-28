import { Module } from '@nestjs/common';
import { DocumentDomainModule } from '../document/document.module';
import { ParticipantDomainInteractor } from './interactors/participant-domain.interactor';
import { AccountDomainModule } from '../account/account-domain.module';
import { GatewayDomainModule } from '../gateway/gateway-domain.module';
import { NotificationDomainModule } from '../notification/notification-domain.module';

@Module({
  imports: [AccountDomainModule, DocumentDomainModule, GatewayDomainModule, NotificationDomainModule],
  providers: [ParticipantDomainInteractor],
  exports: [ParticipantDomainInteractor],
})
export class ParticipantDomainModule {}
