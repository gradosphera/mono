import { forwardRef, Module } from '@nestjs/common';
import { DocumentDomainInteractor } from './interactors/document.interactor';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { DocumentDomainService } from './services/document-domain.service';
import { DocumentAggregator } from './aggregators/document.aggregator';
import { AccountDomainModule } from '~/domain/account/account-domain.module';

@Module({
  imports: [InfrastructureModule, forwardRef(() => AccountDomainModule)],
  providers: [DocumentDomainInteractor, DocumentDomainService, DocumentAggregator],
  exports: [DocumentDomainInteractor, DocumentDomainService, DocumentAggregator],
})
export class DocumentDomainModule {}
