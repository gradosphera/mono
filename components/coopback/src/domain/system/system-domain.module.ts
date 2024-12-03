// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { SystemDomainInteractor } from './interactors/system.interactor';

@Module({
  imports: [],
  providers: [SystemDomainInteractor],
  exports: [SystemDomainInteractor],
})
export class SystemDomainModule {}
