import { Module, forwardRef } from '@nestjs/common';
import { GatewayExpiryCronService } from './gateway-expiry-cron.service';
import { AccountDomainModule } from '~/domain/account/account-domain.module';
import { AccountModule } from '~/application/account/account.module';
import { AccountInteractor } from '~/application/account/interactors/account.interactor';
import { NotificationDomainModule } from '~/domain/notification/notification-domain.module';
import { UserDomainModule } from '~/domain/user/user-domain.module';
import { TokenApplicationModule } from '~/application/token/token-application.module';
import { EventsInfrastructureModule } from '~/infrastructure/events/events.module';
import { ProviderDomainModule } from '~/domain/provider/provider.module';
import { SystemDomainModule } from '~/domain/system/system-domain.module';
import { GatewayInfrastructureModule } from '~/infrastructure/gateway/gateway-infrastructure.module';

@Module({
  imports: [
    AccountDomainModule,
    forwardRef(() => AccountModule),
    NotificationDomainModule,
    forwardRef(() => UserDomainModule),
    forwardRef(() => TokenApplicationModule),
    EventsInfrastructureModule,
    ProviderDomainModule,
    SystemDomainModule,
    GatewayInfrastructureModule,
  ],
  exports: [],
  providers: [GatewayExpiryCronService, AccountInteractor],
})
export class GatewayDomainModule {}
