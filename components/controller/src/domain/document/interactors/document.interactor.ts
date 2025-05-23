import { Injectable, Inject, forwardRef } from '@nestjs/common';
import type { GenerateDocumentDomainInterfaceWithOptions } from '../interfaces/generate-document-domain-with-options.interface';
import { DocumentDomainService } from '../services/document-domain.service';
import type { DocumentDomainEntity } from '../entity/document-domain.entity';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageAggregateDomainInterface } from '../interfaces/document-package-aggregate-domain.interface';
import type { GetDocumentsInputDomainInterface } from '../interfaces/get-documents-input-domain.interface';
import { toDotNotation } from '~/utils/toDotNotation';
import { getActions } from '~/utils/getFetch';
import { SovietContract } from 'cooptypes';
import { DocumentPackageAggregator } from '../aggregators/document-package.aggregator';
import { DocumentAggregator } from '../aggregators/document.aggregator';
import type { DocumentAggregateDomainInterface } from '../interfaces/document-domain-aggregate.interface';
import type { ISignedDocumentDomainInterface } from '../interfaces/signed-document-domain.interface';

@Injectable()
export class DocumentDomainInteractor {
  constructor(
    private readonly documentDomainService: DocumentDomainService,
    @Inject(forwardRef(() => DocumentPackageAggregator))
    private readonly documentPackageAggregator: DocumentPackageAggregator,
    private readonly documentAggregator: DocumentAggregator
  ) {}

  public async generateDocument(data: GenerateDocumentDomainInterfaceWithOptions): Promise<DocumentDomainEntity> {
    return await this.documentDomainService.generateDocument(data);
  }

  public async getDocumentsAggregate(
    data: GetDocumentsInputDomainInterface
  ): Promise<PaginationResultDomainInterface<DocumentPackageAggregateDomainInterface>> {
    const { type = 'newsubmitted', page = 1, limit = 100, query } = data;

    const signedDocuments = await this.documentDomainService.getImmutableSignedDocuments({ type, page, limit, query });

    const response: PaginationResultDomainInterface<DocumentPackageAggregateDomainInterface> = {
      items: [],
      totalCount: signedDocuments.total,
      totalPages: Math.ceil(signedDocuments.total / limit),
      currentPage: page,
    };

    for (const raw_action_document of signedDocuments.results) {
      const documentPackageAggregate = await this.documentPackageAggregator.buildDocumentPackageAggregate(
        raw_action_document
      );

      response.items.push(documentPackageAggregate);
    }

    return response;
  }

  /**
   * Строит агрегат документа
   * @param signedDocument Подписанный документ
   * @returns Агрегат документа или null
   */
  async buildDocumentAggregate(
    signedDocument: ISignedDocumentDomainInterface | null | undefined
  ): Promise<DocumentAggregateDomainInterface | null> {
    if (!signedDocument) return null;

    return await this.documentAggregator.buildDocumentAggregate(signedDocument);
  }
}
