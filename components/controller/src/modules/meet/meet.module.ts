import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { DocumentModule } from '../document/document.module';
import { FreeDecisionResolver } from './resolvers/free-decision.resolver';
import { FreeDecisionService } from './services/meet.service';

@Module({
  imports: [DomainModule, DocumentModule],
  controllers: [],
  providers: [FreeDecisionResolver, FreeDecisionService],
  exports: [],
})
export class DecisionModule {}
