import { Injectable } from '@nestjs/common';
import { DocumentDomainInteractor } from '~/domain/document/interactors/document.interactor';
import type { GetDocumentsInputDTO } from '../dto/get-documents-input.dto';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';

@Injectable()
export class DocumentService {
  constructor(private readonly documentDomainInteractor: DocumentDomainInteractor) {}

  async getDocumentsAggregate(
    data: GetDocumentsInputDTO
  ): Promise<PaginationResultDomainInterface<DocumentPackageAggregateDomainInterface>> {
    const query = {
      ...data.filter,
      receiver: data.username,
    };

    return this.documentDomainInteractor.getDocumentsAggregate({
      query,
      page: data.page,
      limit: data.limit,
      type: data.type,
      after_block: data.after_block,
      before_block: data.before_block,
      actions: data.actions,
    });
  }
}
