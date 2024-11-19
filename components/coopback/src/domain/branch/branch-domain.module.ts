// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { BranchDomainInteractor } from './interactors/branch.interactor';

@Module({
  imports: [],
  providers: [BranchDomainInteractor],
  exports: [BranchDomainInteractor],
})
export class BranchDomainModule {}
