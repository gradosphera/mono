import { Module } from '@nestjs/common';
import { DocumentDomainModule } from '../document/document.module';
import { ParticipantDomainInteractor } from './interactors/participant-domain.interactor';
import { AccountDomainModule } from '../account/account-domain.module';
import { GatewayDomainModule } from '../gateway/gateway-domain.module';

@Module({
  imports: [AccountDomainModule, DocumentDomainModule, GatewayDomainModule],
  providers: [ParticipantDomainInteractor],
  exports: [ParticipantDomainInteractor],
})
export class ParticipantDomainModule {}
