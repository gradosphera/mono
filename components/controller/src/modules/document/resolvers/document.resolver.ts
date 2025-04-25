import { Resolver, Query, Args } from '@nestjs/graphql';
import { GetDocumentsInputDTO } from '../dto/get-documents-input.dto';
import { createPaginationResult } from '~/modules/common/dto/pagination.dto';
import { DocumentPackageAggregateDTO } from '~/modules/agenda/dto/document-package-aggregate.dto';
import { DocumentService } from '../services/document.service';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';

const paginationResultAggregate = createPaginationResult(DocumentPackageAggregateDTO, 'DocumentsAggregate');

@Resolver()
export class DocumentResolver {
  constructor(private readonly documentService: DocumentService) {}

  @Query(() => paginationResultAggregate)
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async getDocuments(
    @Args('data', { type: () => GetDocumentsInputDTO }) data: GetDocumentsInputDTO
  ): Promise<PaginationResultDomainInterface<DocumentPackageAggregateDomainInterface>> {
    return this.documentService.getDocumentsAggregate(data);
  }
}
