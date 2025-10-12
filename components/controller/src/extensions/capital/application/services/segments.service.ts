import { Injectable } from '@nestjs/common';
import { SegmentsInteractor } from '../use-cases/segments.interactor';
import { SegmentOutputDTO } from '../dto/segments/segment.dto';
import { SegmentFilterInputDTO } from '../dto/segments/segment-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { DocumentAggregationService } from '~/domain/document/services/document-aggregation.service';
import { ResultOutputDTO } from '../dto/result_submission/result.dto';
import type { SegmentDomainEntity } from '../../domain/entities/segment.entity';
import { DocumentAggregateDTO } from '~/application/document/dto/document-aggregate.dto';

/**
 * Сервис уровня приложения для управления сегментами CAPITAL
 * Обрабатывает запросы от SegmentsResolver
 */
@Injectable()
export class SegmentsService {
  constructor(
    private readonly segmentsInteractor: SegmentsInteractor,
    private readonly documentAggregationService: DocumentAggregationService
  ) {}

  /**
   * Обогащает документы в result сегмента
   */
  private async enrichSegmentResult(segment: SegmentDomainEntity): Promise<SegmentOutputDTO> {
    let enrichedResult: ResultOutputDTO | undefined;

    if (segment.result) {
      // Обогащаем документы в result
      const enrichedStatement = segment.result.statement
        ? await this.documentAggregationService.buildDocumentAggregate(segment.result.statement)
        : null;

      const enrichedAuthorization = segment.result.authorization
        ? await this.documentAggregationService.buildDocumentAggregate(segment.result.authorization)
        : null;

      const enrichedAct = segment.result.act
        ? await this.documentAggregationService.buildDocumentAggregate(segment.result.act)
        : null;

      // Создаем ResultOutputDTO с обогащенными документами
      enrichedResult = {
        ...segment.result,
        statement: enrichedStatement ? new DocumentAggregateDTO(enrichedStatement) : undefined,
        authorization: enrichedAuthorization ? new DocumentAggregateDTO(enrichedAuthorization) : undefined,
        act: enrichedAct ? new DocumentAggregateDTO(enrichedAct) : undefined,
      } as ResultOutputDTO;
    }

    // Возвращаем SegmentOutputDTO с обогащенным result
    return {
      ...segment,
      result: enrichedResult,
    } as SegmentOutputDTO;
  }

  /**
   * Получить все сегменты с пагинацией и фильтрацией
   */
  async getSegments(
    filter?: SegmentFilterInputDTO,
    options?: PaginationInputDTO
  ): Promise<PaginationResult<SegmentOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.segmentsInteractor.getSegments(filter, domainOptions);

    // Обогащаем документы в result для каждого сегмента
    const enrichedItems = await Promise.all(result.items.map((segment) => this.enrichSegmentResult(segment)));

    // Конвертируем результат в DTO
    return {
      items: enrichedItems,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получить один сегмент по фильтрам
   */
  async getSegment(filter?: SegmentFilterInputDTO): Promise<SegmentOutputDTO | null> {
    // Получаем результат из домена
    const result = await this.segmentsInteractor.getSegment(filter);

    // Возвращаем null, если сегмент не найден
    if (!result) {
      return null;
    }

    // Обогащаем документы в result и конвертируем в DTO
    return await this.enrichSegmentResult(result);
  }
}
