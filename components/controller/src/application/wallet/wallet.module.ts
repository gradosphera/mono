import { Module } from '@nestjs/common';
import { WalletResolver } from './resolvers/wallet.resolver';
import { WalletService } from './services/wallet.service';
import { WalletNotificationService } from './services/wallet-notification.service';
import { WalletDomainInteractor } from '~/domain/wallet/interactors/wallet.interactor';
import { DomainModule } from '~/domain/domain.module';
import { NovuModule } from '~/infrastructure/novu/novu.module';

/**
 * Модуль wallet для управления выводом средств, депозитными платежами и генерацией документов
 */
@Module({
  imports: [DomainModule, NovuModule],
  providers: [WalletResolver, WalletService, WalletNotificationService, WalletDomainInteractor],
  exports: [WalletService, WalletDomainInteractor],
})
export class WalletModule {}
