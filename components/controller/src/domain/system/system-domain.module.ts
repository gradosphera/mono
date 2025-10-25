// domain/system/system-domain.module.ts
import { Module } from '@nestjs/common';
import { SystemDomainInteractor } from './interactors/system.interactor';
import { AccountDomainModule } from '../account/account-domain.module';
import { SystemDomainService } from './services/system-domain.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [AccountDomainModule, SettingsModule],
  providers: [SystemDomainService, SystemDomainInteractor],
  exports: [SystemDomainService, SystemDomainInteractor],
})
export class SystemDomainModule {}
