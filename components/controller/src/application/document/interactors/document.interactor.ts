import { Injectable, Inject, forwardRef } from '@nestjs/common';
import type { GenerateDocumentDomainInterfaceWithOptions } from '~/domain/document/interfaces/generate-document-domain-with-options.interface';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import type { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';
import type { GetDocumentsInputDomainInterface } from '~/domain/document/interfaces/get-documents-input-domain.interface';
import { DocumentPackageAggregator } from '~/domain/document/aggregators/document-package.aggregator';
import { DocumentAggregator } from '~/domain/document/aggregators/document.aggregator';
import type { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

@Injectable()
export class DocumentInteractor {
  constructor(
    @Inject(forwardRef(() => DocumentDomainService)) private readonly documentDomainService: DocumentDomainService,
    @Inject(forwardRef(() => DocumentPackageAggregator))
    private readonly documentPackageAggregator: DocumentPackageAggregator,
    @Inject(forwardRef(() => DocumentAggregator)) private readonly documentAggregator: DocumentAggregator
  ) {}

  public async generateDocument(data: GenerateDocumentDomainInterfaceWithOptions): Promise<DocumentDomainEntity> {
    return await this.documentDomainService.generateDocument(data);
  }

  public async getDocumentsAggregate(
    data: GetDocumentsInputDomainInterface
  ): Promise<PaginationResultDomainInterface<DocumentPackageAggregateDomainInterface>> {
    const { type = 'newsubmitted', page = 1, limit = 100, query, after_block, before_block, actions } = data;

    // Добавляем фильтры по блокам в query
    const blockFilters: Record<string, unknown> = { ...query };
    if (after_block !== undefined || before_block !== undefined) {
      const blockFilter: Record<string, unknown> = {};

      if (after_block !== undefined) {
        blockFilter.$gte = after_block;
      }
      if (before_block !== undefined) {
        blockFilter.$lte = before_block;
      }

      blockFilters.block_num = blockFilter;
    }

    // Добавляем фильтр по массиву действий (data.action)
    // DocumentAction enum значения автоматически преобразуются в строки
    if (actions && actions.length > 0) {
      blockFilters['data.action'] = { $in: actions };
    }

    const signedDocuments = await this.documentDomainService.getImmutableSignedDocuments({
      type,
      page,
      limit,
      query: blockFilters,
    });

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
   * Получает документ по хэшу
   * @param hash Хэш документа
   * @returns Документ или null
   */
  async getDocumentByHash(hash: string): Promise<DocumentDomainEntity | null> {
    return await this.documentDomainService.getDocumentByHash(hash);
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
