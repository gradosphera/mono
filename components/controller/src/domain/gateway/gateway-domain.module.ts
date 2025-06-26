import { Module } from '@nestjs/common';
import { GatewayInteractor } from './interactors/gateway.interactor';
import { GatewayExpiryCronService } from './gateway-expiry-cron.service';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { AccountDomainModule } from '~/domain/account/account-domain.module';
import { ProviderDomainModule } from '~/domain/provider/provider.module';
import { SystemDomainModule } from '~/domain/system/system-domain.module';

@Module({
  imports: [InfrastructureModule, AccountDomainModule, ProviderDomainModule, SystemDomainModule],
  providers: [GatewayInteractor, GatewayExpiryCronService],
  exports: [GatewayInteractor],
})
export class GatewayDomainModule {}
