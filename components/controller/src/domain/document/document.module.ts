import { forwardRef, Module } from '@nestjs/common';
import { DocumentDomainInteractor } from './interactors/document.interactor';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { DocumentDomainService } from './services/document-domain.service';
import { DocumentAggregator } from './aggregators/document.aggregator';
import { AccountDomainModule } from '~/domain/account/account-domain.module';
import { DocumentPackageAggregator } from './aggregators/document-package.aggregator';
import { DocumentPackageUtils } from './aggregators/document-package-utils.aggregator';
import { DocumentPackageV0Aggregator } from './aggregators/document-package-v0.aggregator';
import { DocumentPackageV1Aggregator } from './aggregators/document-package-v1.aggregator';

@Module({
  imports: [InfrastructureModule, forwardRef(() => AccountDomainModule)],
  providers: [
    DocumentDomainInteractor,
    DocumentDomainService,
    DocumentAggregator,
    DocumentPackageAggregator,
    DocumentPackageUtils,
    DocumentPackageV0Aggregator,
    DocumentPackageV1Aggregator,
  ],
  exports: [
    DocumentDomainInteractor,
    DocumentDomainService,
    DocumentAggregator,
    DocumentPackageAggregator,
    DocumentPackageUtils,
    DocumentPackageV0Aggregator,
    DocumentPackageV1Aggregator,
  ],
})
export class DocumentDomainModule {}
