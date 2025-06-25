import { Module } from '@nestjs/common';
import { WalletResolver } from './resolvers/wallet.resolver';
import { WalletService } from './services/wallet.service';
import { WalletDomainInteractor } from '~/domain/wallet/interactors/wallet.interactor';

/**
 * Модуль wallet для управления выводом средств и генерацией документов
 */
@Module({
  providers: [WalletResolver, WalletService, WalletDomainInteractor],
  exports: [WalletService, WalletDomainInteractor],
})
export class WalletModule {}
