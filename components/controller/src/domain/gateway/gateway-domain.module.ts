import { Module, forwardRef } from '@nestjs/common';
import { GatewayExpiryCronService } from './gateway-expiry-cron.service';
import { GatewayInteractor } from './interactors/gateway.interactor';
import { GatewayInteractorAdapter } from './adapters/gateway-interactor.adapter';
import { GatewayAdapter } from './adapters/gateway.adapter';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';
import { AccountDomainModule } from '~/domain/account/account-domain.module';
import { AccountModule } from '~/application/account/account.module';
import { AccountInteractor } from '~/application/account/interactors/account.interactor';
import { NotificationDomainModule } from '~/domain/notification/notification-domain.module';
import { UserDomainModule } from '~/domain/user/user-domain.module';
import { TokenApplicationModule } from '~/application/token/token-application.module';
import { EventsInfrastructureModule } from '~/infrastructure/events/events.module';
import { ProviderDomainModule } from '~/domain/provider/provider.module';
import { SystemDomainModule } from '~/domain/system/system-domain.module';
import { GATEWAY_INTERACTOR_PORT } from '~/domain/wallet/ports/gateway-interactor.port';
import { GATEWAY_PORT } from './ports/gateway.port';

@Module({
  imports: [
    AccountDomainModule,
    forwardRef(() => AccountModule),
    AccountInfrastructureModule,
    NotificationDomainModule,
    forwardRef(() => UserDomainModule),
    forwardRef(() => TokenApplicationModule),
    EventsInfrastructureModule,
    ProviderDomainModule,
    SystemDomainModule,
  ],
  providers: [
    GatewayExpiryCronService,
    GatewayInteractor,
    GatewayInteractorAdapter,
    GatewayAdapter,
    AccountInteractor,
    {
      provide: GATEWAY_INTERACTOR_PORT,
      useClass: GatewayInteractorAdapter,
    },
    {
      provide: GATEWAY_PORT,
      useClass: GatewayAdapter,
    },
  ],
  exports: [GATEWAY_INTERACTOR_PORT, GATEWAY_PORT],
})
export class GatewayDomainModule {}
