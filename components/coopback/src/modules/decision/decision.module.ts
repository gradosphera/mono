import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { DecisionResolver } from './resolvers/decision.resolver';
import { DecisionService } from './services/decision.service';
import { DocumentModule } from '../document/document.module';
@Module({
  imports: [DomainModule, DocumentModule],
  controllers: [],
  providers: [DecisionResolver, DecisionService],
  exports: [],
})
export class DecisionModule {}
