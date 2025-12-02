import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OneCoopApplicationService } from '../services/oneccoop.service';
import { GetOneCoopDocumentsInputDTO } from '../dto/get-oneccoop-documents-input.dto';
import { OneCoopDocumentsResponseDTO } from '../dto/oneccoop-documents-response.dto';
import type { OneCoopDocumentOutputDTO } from '../dto/oneccoop-document-output.dto';
import { OneCoopSecretKeyGuard } from '../guards/oneccoop-secret-key.guard';

/**
 * GraphQL резолвер для API интеграции с 1С
 * Предоставляет методы для извлечения документов кооператива
 *
 * Аутентификация осуществляется через секретный ключ в заголовке x-onecoop-secret-key
 */
@Resolver()
export class OneCoopResolver {
  constructor(private readonly oneCoopService: OneCoopApplicationService) {}

  /**
   * Получает документы для синхронизации с внешней бухгалтерией
   * Возвращает утверждённые пакеты документов начиная с указанного блока
   *
   * Требует заголовок: x-onecoop-secret-key
   */
  @Query(() => OneCoopDocumentsResponseDTO, {
    name: 'onecoopGetDocuments',
    description:
      'Получение документов кооператива для синхронизации с 1С. Требует секретный ключ в заголовке x-onecoop-secret-key.',
  })
  @UseGuards(OneCoopSecretKeyGuard)
  async getDocuments(
    @Args('data', { type: () => GetOneCoopDocumentsInputDTO })
    data: GetOneCoopDocumentsInputDTO
  ): Promise<OneCoopDocumentsResponseDTO> {
    const result = await this.oneCoopService.getDocuments({
      block_from: data.block_from,
      block_to: data.block_to,
      page: data.page,
      limit: data.limit,
    });

    return {
      items: result.items.map((item) => ({
        action: item.action,
        block_num: item.block_num,
        package: item.package,
        hash: item.hash,
        data: item.data as Record<string, unknown>,
      })) as OneCoopDocumentOutputDTO[],
      total_count: result.total_count,
      total_pages: result.total_pages,
      current_page: result.current_page,
      max_block_num: result.max_block_num,
    };
  }
}
