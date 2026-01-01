import { Module } from '@nestjs/common';
import { WalletDomainInteractor } from './interactors/wallet.interactor';
import { GatewayDomainModule } from '../gateway/gateway-domain.module';
import { GatewayInfrastructureModule } from '~/infrastructure/gateway/gateway-infrastructure.module';

/**
 * Доменный модуль Wallet
 */
@Module({
  imports: [GatewayDomainModule, GatewayInfrastructureModule],
  providers: [WalletDomainInteractor],
  exports: [WalletDomainInteractor],
})
export class WalletDomainModule {}
