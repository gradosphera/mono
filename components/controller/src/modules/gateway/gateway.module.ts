import { Module } from '@nestjs/common';
import { GatewayResolver } from './resolvers/gateway.resolver';
import { GatewayService } from './services/gateway.service';
import { PaymentController } from './controllers/payment.controller';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';
import { DomainModule } from '~/domain/domain.module';

@Module({
  imports: [GatewayDomainModule, DomainModule],
  controllers: [PaymentController],
  providers: [GatewayResolver, GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
