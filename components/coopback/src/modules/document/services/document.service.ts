import { Injectable } from '@nestjs/common';
import { DocumentDomainInteractor } from '~/domain/document/interactors/document.interactor';
import type { GetDocumentsInputDTO } from '../dto/get-documents-input.dto';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageDomainInterface } from '~/domain/agenda/interfaces/document-package-domain.interface';

@Injectable()
export class DocumentService {
  constructor(private readonly documentDomainInteractor: DocumentDomainInteractor) {}

  async getDocuments(data: GetDocumentsInputDTO): Promise<PaginationResultDomainInterface<DocumentPackageDomainInterface>> {
    const query = {
      receiver: data.filter.receiver,
      ...data.filter.additionalFilters,
    };

    return this.documentDomainInteractor.getDocuments({ query, page: data.page, limit: data.limit, type: data.type });
  }
}
