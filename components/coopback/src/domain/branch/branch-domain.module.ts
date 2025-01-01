import { Module } from '@nestjs/common';
import { BranchDomainInteractor } from './interactors/branch.interactor';
import { DocumentDomainModule } from '../document/document.module';

@Module({
  imports: [DocumentDomainModule],
  providers: [BranchDomainInteractor],
  exports: [BranchDomainInteractor],
})
export class BranchDomainModule {}
