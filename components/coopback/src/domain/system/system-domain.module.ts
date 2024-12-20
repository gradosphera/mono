// domain/system/system-domain.module.ts
import { Module } from '@nestjs/common';
import { SystemDomainInteractor } from './interactors/system.interactor';
import { AccountDomainModule } from '../account/account-domain.module';

@Module({
  imports: [AccountDomainModule],
  providers: [SystemDomainInteractor],
  exports: [SystemDomainInteractor],
})
export class SystemDomainModule {}
