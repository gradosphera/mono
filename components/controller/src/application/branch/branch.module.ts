import { Module } from '@nestjs/common';
import { BranchService } from './services/branch.service';
import { BranchResolver } from './resolvers/branch.resolver';
import { BranchInteractor } from './use-cases/branch.interactor';
import { DomainModule } from '~/domain/domain.module';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';

@Module({
  imports: [DomainModule, InfrastructureModule],
  controllers: [],
  providers: [BranchInteractor, BranchService, BranchResolver],
  exports: [],
})
export class BranchModule {}
