import { Module } from '@nestjs/common';
import { WalletResolver } from './resolvers/wallet.resolver';
import { WalletService } from './services/wallet.service';
import { WalletNotificationService } from './services/wallet-notification.service';
import { WalletDomainInteractor } from '~/domain/wallet/interactors/wallet.interactor';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { WalletDomainModule } from '~/domain/wallet/wallet-domain.module';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { ExtensionPortsModule } from '~/domain/extension/extension-ports.module';

/**
 * Модуль wallet для управления выводом средств, депозитными платежами и генерацией документов
 */
@Module({
  imports: [NovuModule, WalletDomainModule, GatewayDomainModule, UserCertificateDomainModule, ExtensionPortsModule],
  providers: [WalletResolver, WalletService, WalletNotificationService, WalletDomainInteractor],
  exports: [WalletService, WalletDomainInteractor],
})
export class WalletModule {}
