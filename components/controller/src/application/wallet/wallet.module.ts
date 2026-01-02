import { Module } from '@nestjs/common';
import { WalletResolver } from './resolvers/wallet.resolver';
import { WalletService } from './services/wallet.service';
import { WalletInteractor } from './interactors/wallet.interactor';
import { WalletNotificationService } from './services/wallet-notification.service';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';
import { GatewayInfrastructureModule } from '~/infrastructure/gateway/gateway-infrastructure.module';
import { UserCertificateInfrastructureModule } from '~/infrastructure/user-certificate/user-certificate-infrastructure.module';

/**
 * Модуль wallet для управления выводом средств, депозитными платежами и генерацией документов
 */
@Module({
  imports: [
    NovuModule,
    GatewayDomainModule,
    GatewayInfrastructureModule,
    UserCertificateInfrastructureModule,
    UserCertificateDomainModule,
    AccountInfrastructureModule,
  ],
  providers: [WalletResolver, WalletService, WalletInteractor, WalletNotificationService],
  exports: [WalletService],
})
export class WalletModule {}
