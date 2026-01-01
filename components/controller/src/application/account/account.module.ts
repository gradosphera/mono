import { Module, forwardRef } from '@nestjs/common';
import { AccountResolver } from './resolvers/account.resolver';
import { AccountService } from './services/account.service';
import { AccountInteractor } from './interactors/account.interactor';
import { AccountDomainModule } from '~/domain/account/account-domain.module';
import { NotificationDomainModule } from '~/domain/notification/notification-domain.module';
import { UserDomainModule } from '~/domain/user/user-domain.module';
import { TokenApplicationModule } from '~/application/token/token-application.module';
import { EventsInfrastructureModule } from '~/infrastructure/events/events.module';

@Module({
  imports: [
    AccountDomainModule,
    NotificationDomainModule,
    forwardRef(() => UserDomainModule),
    forwardRef(() => TokenApplicationModule),
    EventsInfrastructureModule,
  ],
  controllers: [],
  providers: [AccountInteractor, AccountService, AccountResolver],
  exports: [AccountInteractor, AccountService],
})
export class AccountModule {}
