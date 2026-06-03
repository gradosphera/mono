import { Module } from '@nestjs/common';
import { GatewayModule } from '../gateway/gateway.module';
import { CompositionController } from './composition.controller';
import { InstallController } from './install.controller';

@Module({
  imports: [GatewayModule],
  controllers: [CompositionController, InstallController],
})
export class OrchestratorModule {}
