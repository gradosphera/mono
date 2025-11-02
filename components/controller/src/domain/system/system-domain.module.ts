// domain/system/system-domain.module.ts
import { Module } from '@nestjs/common';
import { SystemDomainInteractor } from './interactors/system.interactor';
import { AccountDomainModule } from '../account/account-domain.module';
import { SystemDomainService } from './services/system-domain.service';
import { SettingsDomainModule } from '../settings/settings-domain.module';

@Module({
  imports: [AccountDomainModule, SettingsDomainModule],
  providers: [SystemDomainService, SystemDomainInteractor],
  exports: [SystemDomainService, SystemDomainInteractor, SettingsDomainModule],
})
export class SystemDomainModule {}
