import { Module, forwardRef } from '@nestjs/common';
import { DocumentDomainInteractor } from './interactors/document.interactor';
import { DocumentDomainService } from './services/document-domain.service';
import { DocumentAggregator } from './aggregators/document.aggregator';
import { DocumentPackageAggregator } from './aggregators/document-package.aggregator';
import { DocumentPackageUtils } from './aggregators/document-package-utils.aggregator';
import { DocumentPackageV0Aggregator } from './aggregators/document-package-v0.aggregator';
import { DocumentPackageV1Aggregator } from './aggregators/document-package-v1.aggregator';
import { DocumentAggregationService } from './services/document-aggregation.service';
import { DocumentValidationService, DOCUMENT_VALIDATION_SERVICE } from './services/document-validation.service';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';

@Module({
  imports: [forwardRef(() => UserCertificateDomainModule)],
  providers: [
    DocumentDomainInteractor,
    DocumentDomainService,
    DocumentAggregator,
    DocumentPackageAggregator,
    DocumentPackageUtils,
    DocumentPackageV0Aggregator,
    DocumentPackageV1Aggregator,
    DocumentAggregationService,
    DocumentValidationService,
    {
      provide: DOCUMENT_VALIDATION_SERVICE,
      useExisting: DocumentValidationService,
    },
  ],
  exports: [
    DocumentDomainInteractor,
    DocumentDomainService,
    DocumentAggregator,
    DocumentPackageAggregator,
    DocumentPackageUtils,
    DocumentPackageV0Aggregator,
    DocumentPackageV1Aggregator,
    DocumentAggregationService,
    DocumentValidationService,
    DOCUMENT_VALIDATION_SERVICE,
  ],
})
export class DocumentDomainModule {}
