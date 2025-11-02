import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { FreeDecisionResolver } from './resolvers/free-decision.resolver';
import { FreeDecisionService } from './services/free-decision.service';
import { FreeDecisionDomainModule } from '~/domain/free-decision/free-decision.module';

@Module({
  imports: [DocumentModule, FreeDecisionDomainModule],
  controllers: [],
  providers: [FreeDecisionResolver, FreeDecisionService],
  exports: [],
})
export class DecisionModule {}
