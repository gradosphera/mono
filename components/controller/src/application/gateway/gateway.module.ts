import { Module, forwardRef } from '@nestjs/common';
import { GatewayResolver } from './resolvers/gateway.resolver';
import { GatewayService } from './services/gateway.service';
import { PaymentNotificationService } from './services/payment-notification.service';
import { PaymentController } from './controllers/payment.controller';
import { GatewayInteractor } from './interactors/gateway.interactor';
import { GatewayNotificationHandler } from './handlers/gateway-notification.handler';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';
import { SystemModule } from '~/application/system/system.module';
import { GatewayInfrastructureModule } from '~/infrastructure/gateway/gateway-infrastructure.module';
import { UserCertificateInfrastructureModule } from '~/infrastructure/user-certificate/user-certificate-infrastructure.module';
import { RedisModule } from '~/infrastructure/redis/redis.module';

@Module({
  imports: [
    forwardRef(() => GatewayDomainModule),
    forwardRef(() => GatewayInfrastructureModule),
    NovuModule,
    UserCertificateInfrastructureModule,
    UserCertificateDomainModule,
    AccountInfrastructureModule,
    AccountInfrastructureModule,
    SystemModule,
    RedisModule,
  ],
  controllers: [PaymentController],
  providers: [GatewayResolver, GatewayService, PaymentNotificationService, GatewayInteractor, GatewayNotificationHandler],
  exports: [GatewayService, PaymentNotificationService, GatewayInteractor],
})
export class GatewayModule {}
