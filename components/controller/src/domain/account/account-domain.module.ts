// domain/account/account-domain.module.ts

import { Global, Module } from '@nestjs/common';
import { AccountDomainInteractor } from './interactors/account.interactor';
import { AccountDomainService, ACCOUNT_DOMAIN_SERVICE } from './services/account-domain.service';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { NotificationDomainModule } from '~/domain/notification/notification-domain.module';

@Global()
@Module({
  imports: [InfrastructureModule, NotificationDomainModule],
  providers: [
    AccountDomainInteractor,
    AccountDomainService,
    {
      provide: ACCOUNT_DOMAIN_SERVICE,
      useExisting: AccountDomainService,
    },
  ],
  exports: [AccountDomainInteractor, AccountDomainService, ACCOUNT_DOMAIN_SERVICE],
})
export class AccountDomainModule {}
