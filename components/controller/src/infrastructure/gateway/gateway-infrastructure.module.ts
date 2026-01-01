import { Module, forwardRef } from '@nestjs/common';
import { GatewayInteractorAdapter } from './gateway-interactor.adapter';
import { GatewayModule } from '~/application/gateway/gateway.module';
import { GATEWAY_INTERACTOR_PORT } from '~/domain/wallet/ports/gateway-interactor.port';

@Module({
  imports: [forwardRef(() => GatewayModule)],
  providers: [
    GatewayInteractorAdapter,
    {
      provide: GATEWAY_INTERACTOR_PORT,
      useClass: GatewayInteractorAdapter,
    },
  ],
  exports: [GATEWAY_INTERACTOR_PORT],
})
export class GatewayInfrastructureModule {}
