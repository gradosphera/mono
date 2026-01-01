import { Module } from '@nestjs/common';
import { FreeDecisionAdapter, FREE_DECISION_ADAPTER } from './free-decision.adapter';
import { DecisionModule } from '~/application/free-decision/decision.module';

@Module({
  imports: [DecisionModule],
  providers: [FreeDecisionAdapter, FREE_DECISION_ADAPTER],
  exports: [FREE_DECISION_ADAPTER],
})
export class FreeDecisionInfrastructureModule {}
