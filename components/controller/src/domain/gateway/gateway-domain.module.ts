import { Module } from '@nestjs/common';
import { GatewayInteractor } from './interactors/gateway.interactor';
import { GatewayExpiryCronService } from './gateway-expiry-cron.service';
import { GatewayInteractorAdapter } from './adapters/gateway-interactor.adapter';
import { AccountDomainModule } from '~/domain/account/account-domain.module';
import { ProviderDomainModule } from '~/domain/provider/provider.module';
import { SystemDomainModule } from '~/domain/system/system-domain.module';
import { GATEWAY_INTERACTOR_PORT } from '~/domain/wallet/ports/gateway-interactor.port';

@Module({
  imports: [AccountDomainModule, ProviderDomainModule, SystemDomainModule],
  providers: [
    GatewayInteractor,
    GatewayExpiryCronService,
    GatewayInteractorAdapter,
    {
      provide: GATEWAY_INTERACTOR_PORT,
      useClass: GatewayInteractorAdapter,
    },
  ],
  exports: [GatewayInteractor, GATEWAY_INTERACTOR_PORT],
})
export class GatewayDomainModule {}
