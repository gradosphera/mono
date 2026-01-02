import { Module } from '@nestjs/common';
import { WalletResolver } from './resolvers/wallet.resolver';
import { WalletService } from './services/wallet.service';
import { WalletInteractor } from './interactors/wallet.interactor';
import { WalletNotificationService } from './services/wallet-notification.service';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';
import { UserDomainModule } from '~/domain/user/user-domain.module';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';
import { GatewayInfrastructureModule } from '~/infrastructure/gateway/gateway-infrastructure.module';
import { UserInfrastructureModule } from '~/infrastructure/user/user-infrastructure.module';

/**
 * Модуль wallet для управления выводом средств, депозитными платежами и генерацией документов
 */
@Module({
  imports: [
    NovuModule,
    GatewayDomainModule,
    GatewayInfrastructureModule,
    UserInfrastructureModule,
    UserDomainModule,
    AccountInfrastructureModule,
  ],
  providers: [WalletResolver, WalletService, WalletInteractor, WalletNotificationService],
  exports: [WalletService],
})
export class WalletModule {}
