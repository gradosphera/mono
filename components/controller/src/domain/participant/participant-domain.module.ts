import { Module, forwardRef } from '@nestjs/common';
import { DocumentDomainModule } from '../document/document.module';
import { ParticipantDomainInteractor } from './interactors/participant-domain.interactor';
import { AccountDomainModule } from '../account/account-domain.module';
import { GatewayDomainModule } from '../gateway/gateway-domain.module';
import { NotificationDomainModule } from '../notification/notification-domain.module';
import { NotificationModule } from '~/application/notification/notification.module';
import { TokenApplicationModule } from '~/application/token/token-application.module';

@Module({
  imports: [
    forwardRef(() => AccountDomainModule),
    forwardRef(() => DocumentDomainModule),
    GatewayDomainModule,
    NotificationDomainModule,
    NotificationModule,
    TokenApplicationModule,
  ],
  providers: [ParticipantDomainInteractor],
  exports: [ParticipantDomainInteractor],
})
export class ParticipantDomainModule {}
