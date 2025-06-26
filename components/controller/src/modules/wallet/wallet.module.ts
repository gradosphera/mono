import { Module } from '@nestjs/common';
import { WalletResolver } from './resolvers/wallet.resolver';
import { WalletService } from './services/wallet.service';
import { WalletDomainInteractor } from '~/domain/wallet/interactors/wallet.interactor';
import { DomainModule } from '~/domain/domain.module';

/**
 * Модуль wallet для управления выводом средств, депозитными платежами и генерацией документов
 */
@Module({
  imports: [DomainModule],
  providers: [WalletResolver, WalletService, WalletDomainInteractor],
  exports: [WalletService, WalletDomainInteractor],
})
export class WalletModule {}
