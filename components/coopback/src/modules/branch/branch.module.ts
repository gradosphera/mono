import { Module } from '@nestjs/common';
import { BranchService } from './services/branch.service';
import { BranchResolver } from './resolvers/branch.resolver';
import { BranchDomainInteractor } from '~/domain/branch/interactors/branch.interactor';

@Module({
  imports: [],
  controllers: [],
  providers: [BranchDomainInteractor, BranchService, BranchResolver],
  exports: [],
})
export class BranchModule {}
