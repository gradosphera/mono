// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { FreeDecisionDomainInteractor } from './interactors/free-decision.interactor';
import { DocumentDomainModule } from '../document/document.module';

@Module({
  imports: [DocumentDomainModule],
  providers: [FreeDecisionDomainInteractor],
  exports: [FreeDecisionDomainInteractor],
})
export class FreeDecisionDomainModule {}
