import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DocumentExtensionPort, GetDocumentsExtensionInputInterface } from '../ports/document-extension-port';
import { DocumentInteractor } from '~/application/document/interactors/document.interactor';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';

@Injectable()
export class DocumentExtensionAdapter implements DocumentExtensionPort {
  constructor(
    @Inject(forwardRef(() => DocumentInteractor))
    private readonly documentInteractor: DocumentInteractor
  ) {}

  async getDocumentsAggregate(
    data: GetDocumentsExtensionInputInterface
  ): Promise<PaginationResultDomainInterface<DocumentPackageAggregateDomainInterface>> {
    return this.documentInteractor.getDocumentsAggregate({
      type: data.type,
      actions: data.actions,
      after_block: data.after_block,
      before_block: data.before_block,
      page: data.page,
      limit: data.limit,
      query: data.query ?? {},
    });
  }
}
