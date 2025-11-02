import { Module } from '@nestjs/common';
import { GatewayResolver } from './resolvers/gateway.resolver';
import { GatewayService } from './services/gateway.service';
import { PaymentNotificationService } from './services/payment-notification.service';
import { PaymentController } from './controllers/payment.controller';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';
import { NovuModule } from '~/infrastructure/novu/novu.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { ExtensionPortsModule } from '~/domain/extension/extension-ports.module';

@Module({
  imports: [GatewayDomainModule, NovuModule, UserCertificateDomainModule, ExtensionPortsModule],
  controllers: [PaymentController],
  providers: [GatewayResolver, GatewayService, PaymentNotificationService],
  exports: [GatewayService, PaymentNotificationService],
})
export class GatewayModule {}
