import { Module } from '@nestjs/common';
import { BranchService } from './services/branch.service';
import { BranchResolver } from './resolvers/branch.resolver';
import { BranchInteractor } from './use-cases/branch.interactor';
import { DocumentDomainModule } from '~/domain/document/document.module';

@Module({
  imports: [DocumentDomainModule],
  controllers: [],
  providers: [BranchInteractor, BranchService, BranchResolver],
  exports: [],
})
export class BranchModule {}
