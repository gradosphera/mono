import { Module } from '@nestjs/common';
import { SystemService } from './services/system.service';
import { SystemResolver } from './resolvers/system.resolver';
import { SystemDomainModule } from '~/domain/system/system-domain.module';
import { SettingsDomainModule } from '~/domain/settings/settings-domain.module';

@Module({
  imports: [SystemDomainModule, SettingsDomainModule],
  controllers: [],
  providers: [SystemService, SystemResolver],
  exports: [],
})
export class SystemModule {}
