import { Module } from '@nestjs/common';
import { GatewayResolver } from './resolvers/gateway.resolver';
import { GatewayService } from './services/gateway.service';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';

@Module({
  imports: [GatewayDomainModule],
  providers: [GatewayResolver, GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
