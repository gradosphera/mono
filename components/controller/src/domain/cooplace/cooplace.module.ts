// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { CooplaceDomainInteractor } from './interactors/cooplace.interactor';
import { DocumentDomainModule } from '../document/document.module';

@Module({
  imports: [DocumentDomainModule],
  providers: [CooplaceDomainInteractor],
  exports: [CooplaceDomainInteractor],
})
export class CooplaceDomainModule {}
