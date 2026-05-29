import { Resolver, Query, Args } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { SearchResultDTO } from '../dto/search-result.dto';
import { SearchDocumentsInputDTO } from '../dto/search-input.dto';
import {
  SIGNED_DOCUMENT_REPOSITORY,
  type SignedDocumentRepository,
} from '~/domain/document/repository/signed-document.repository';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import config from '~/config/config';

@Resolver()
export class SearchResolver {
  constructor(
    @Inject(SIGNED_DOCUMENT_REPOSITORY) private readonly signedDocuments: SignedDocumentRepository
  ) {}

  // Поиск по документам кооператива — инструмент совета (видит весь документооборот).
  // Доступен только председателю и членам совета; поиск пайщиком по своим документам пока не делаем.
  @Query(() => [SearchResultDTO], { description: 'Полнотекстовый поиск по документам кооператива' })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
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
