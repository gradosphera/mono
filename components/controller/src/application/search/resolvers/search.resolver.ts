import { Resolver, Query, Args } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { SearchResultDTO } from '../dto/search-result.dto';
import { SearchDocumentsInputDTO } from '../dto/search-input.dto';
import {
  SIGNED_DOCUMENT_REPOSITORY,
  type SignedDocumentRepository,
} from '~/domain/document/repository/signed-document.repository';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import config from '~/config/config';

@Resolver()
export class SearchResolver {
  constructor(
    @Inject(SIGNED_DOCUMENT_REPOSITORY) private readonly signedDocuments: SignedDocumentRepository
  ) {}

  @Query(() => [SearchResultDTO], { description: 'Полнотекстовый поиск по документам кооператива' })
  @UseGuards(GqlJwtAuthGuard)
  async searchDocuments(@Args('data') input: SearchDocumentsInputDTO): Promise<SearchResultDTO[]> {
    const hits = await this.signedDocuments.search({
      coopname: config.coopname,
      query: input.query,
      limit: input.limit || 20,
    });

    return hits.map((hit) => ({
      hash: hit.hash,
      full_title: hit.full_title,
      username: hit.username,
      coopname: hit.coopname,
      registry_id: hit.registry_id,
      created_at: hit.created_at ?? undefined,
      highlights: hit.highlights,
    }));
  }
}
