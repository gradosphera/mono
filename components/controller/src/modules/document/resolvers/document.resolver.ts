import { Resolver, Query, Args } from '@nestjs/graphql';
import { GetDocumentsInputDTO } from '../dto/get-documents-input.dto';
import { createPaginationResult } from '~/modules/common/dto/pagination.dto';
import { DocumentPackageDTO } from '~/modules/agenda/dto/document-package.dto';
import { DocumentService } from '../services/document.service';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageDomainInterface } from '~/domain/agenda/interfaces/document-package-domain.interface';

const paginationResult = createPaginationResult(DocumentPackageDTO, 'Documents');

@Resolver()
export class DocumentResolver {
  constructor(private readonly documentService: DocumentService) {}

  @Query(() => paginationResult)
  async getDocuments(
    @Args('data', { type: () => GetDocumentsInputDTO }) data: GetDocumentsInputDTO
  ): Promise<PaginationResultDomainInterface<DocumentPackageDomainInterface>> {
    return this.documentService.getDocuments(data);
  }
}
