import { Module } from '@nestjs/common';
import { WalletDomainInteractor } from './interactors/wallet.interactor';
import { DocumentDomainModule } from '~/domain/document/document.module';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { GatewayDomainModule } from '../gateway/gateway-domain.module';

/**
 * Доменный модуль Wallet
 */
@Module({
  imports: [DocumentDomainModule, InfrastructureModule, GatewayDomainModule],
  providers: [WalletDomainInteractor],
  exports: [WalletDomainInteractor],
})
export class WalletDomainModule {}
