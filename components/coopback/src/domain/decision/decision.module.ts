// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { DecisionDomainInteractor } from './interactors/decision.interactor';
import { DocumentDomainModule } from '../document/document.module';

@Module({
  imports: [DocumentDomainModule],
  providers: [DecisionDomainInteractor],
  exports: [DecisionDomainInteractor],
})
export class DecisionDomainModule {}
