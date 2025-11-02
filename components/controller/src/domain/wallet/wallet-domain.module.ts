import { Module } from '@nestjs/common';
import { WalletDomainInteractor } from './interactors/wallet.interactor';
import { GatewayDomainModule } from '../gateway/gateway-domain.module';

/**
 * Доменный модуль Wallet
 */
@Module({
  imports: [GatewayDomainModule],
  providers: [WalletDomainInteractor],
  exports: [WalletDomainInteractor],
})
export class WalletDomainModule {}
