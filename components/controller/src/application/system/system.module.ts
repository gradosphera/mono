import { Module } from '@nestjs/common';
import { SystemService } from './services/system.service';
import { SystemResolver } from './resolvers/system.resolver';
import { SystemDomainModule } from '~/domain/system/system-domain.module';
import { ProviderModule } from '~/application/provider/provider.module';

@Module({
  imports: [SystemDomainModule, ProviderModule],
  controllers: [],
  providers: [SystemService, SystemResolver],
  exports: [],
})
export class SystemModule {}
