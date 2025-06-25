import { Module } from '@nestjs/common';
import { GatewayInteractor } from './interactors/gateway.interactor';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [GatewayInteractor],
  exports: [GatewayInteractor],
})
export class GatewayDomainModule {}
