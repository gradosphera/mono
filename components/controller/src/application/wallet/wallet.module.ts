import { Module } from '@nestjs/common';
import { WalletResolver } from './resolvers/wallet.resolver';
import { WalletService } from './services/wallet.service';
import { WalletNotificationService } from './services/wallet-notification.service';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { WalletDomainModule } from '~/domain/wallet/wallet-domain.module';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';
import { GatewayInfrastructureModule } from '~/infrastructure/gateway/gateway-infrastructure.module';

/**
 * Модуль wallet для управления выводом средств, депозитными платежами и генерацией документов
 */
@Module({
  imports: [
    NovuModule,
    WalletDomainModule,
    GatewayDomainModule,
    GatewayInfrastructureModule,
    UserCertificateDomainModule,
    AccountInfrastructureModule,
  ],
  providers: [WalletResolver, WalletService, WalletNotificationService],
  exports: [WalletService],
})
export class WalletModule {}
