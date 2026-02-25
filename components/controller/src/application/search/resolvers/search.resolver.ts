import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SearchResultDTO } from '../dto/search-result.dto';
import { SearchDocumentsInputDTO } from '../dto/search-input.dto';
import { DocumentSearchService } from '~/infrastructure/search/opensearch.service';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import config from '~/config/config';

@Resolver()
export class SearchResolver {
  constructor(private readonly documentSearch: DocumentSearchService) {}

  @Query(() => [SearchResultDTO], { description: 'Полнотекстовый поиск по документам кооператива' })
  @UseGuards(GqlJwtAuthGuard)
  async searchDocuments(
    @Args('data') input: SearchDocumentsInputDTO,
  ): Promise<SearchResultDTO[]> {
    if (!this.documentSearch.isAvailable()) {
      return [];
    }

    return this.documentSearch.search(input.query, config.coopname, input.limit || 20);
  }
}
