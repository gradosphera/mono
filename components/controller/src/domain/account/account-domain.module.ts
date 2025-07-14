// domain/account/account-domain.module.ts

import { Global, Module } from '@nestjs/common';
import { AccountDomainInteractor } from './interactors/account.interactor';
import { AccountDomainService, ACCOUNT_DOMAIN_SERVICE } from './services/account-domain.service';
import {
  NotificationSubscriberSyncService,
  NOTIFICATION_SUBSCRIBER_SYNC_SERVICE,
} from './services/notification-subscriber-sync.service';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { NotificationDomainModule } from '~/domain/notification/notification-domain.module';

@Global()
@Module({
  imports: [InfrastructureModule, NotificationDomainModule],
  providers: [
    AccountDomainInteractor,
    AccountDomainService,
    NotificationSubscriberSyncService,
    {
      provide: ACCOUNT_DOMAIN_SERVICE,
      useExisting: AccountDomainService,
    },
    {
      provide: NOTIFICATION_SUBSCRIBER_SYNC_SERVICE,
      useExisting: NotificationSubscriberSyncService,
    },
  ],
  exports: [
    AccountDomainInteractor,
    AccountDomainService,
    NotificationSubscriberSyncService,
    ACCOUNT_DOMAIN_SERVICE,
    NOTIFICATION_SUBSCRIBER_SYNC_SERVICE,
  ],
})
export class AccountDomainModule {}
