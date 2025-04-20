import { Injectable } from '@nestjs/common';
import type { GenerateDocumentDomainInterfaceWithOptions } from '../interfaces/generate-document-domain-with-options.interface';
import { DocumentDomainService } from '../services/document-domain.service';
import type { DocumentDomainEntity } from '../entity/document-domain.entity';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageDomainInterface } from '~/domain/agenda/interfaces/document-package-domain.interface';
import type { GetDocumentsInputDomainInterface } from '../interfaces/get-documents-input-domain.interface';
import { toDotNotation } from '~/utils/toDotNotation';
import { getActions } from '~/utils/getFetch';
import { SovietContract } from 'cooptypes';

@Injectable()
export class DocumentDomainInteractor {
  constructor(private readonly documentDomainService: DocumentDomainService) {}

  public async generateDocument(data: GenerateDocumentDomainInterfaceWithOptions): Promise<DocumentDomainEntity> {
    return await this.documentDomainService.generateDocument(data);
  }

  public async getDocuments(
    data: GetDocumentsInputDomainInterface
  ): Promise<PaginationResultDomainInterface<DocumentPackageDomainInterface>> {
    const { type = 'newsubmitted', page = 1, limit = 100, query } = data;

    const actions = await getActions<SovietContract.Actions.Registry.NewResolved.INewResolved>(
      `${process.env.SIMPLE_EXPLORER_API}/get-actions`,
      {
        filter: JSON.stringify({
          account: SovietContract.contractName.production,
          name: type,
          ...toDotNotation(query),
        }),
        page,
        limit,
      }
    );

    const response: PaginationResultDomainInterface<DocumentPackageDomainInterface> = {
      items: [],
      totalCount: actions.results.length,
      totalPages: 0,
      currentPage: page,
    };

    for (const raw_action_document of actions.results) {
      const documentPackage = await this.documentDomainService.buildDocumentPackage(raw_action_document);

      if (documentPackage.statement.action) response.items.push(documentPackage);
    }

    return response;
  }
}
