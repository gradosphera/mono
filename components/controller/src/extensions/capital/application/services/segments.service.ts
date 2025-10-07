import { Injectable } from '@nestjs/common';
import { SegmentsInteractor } from '../use-cases/segments.interactor';
import { SegmentOutputDTO } from '../dto/segments/segment.dto';
import { SegmentFilterInputDTO } from '../dto/segments/segment-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

/**
 * Сервис уровня приложения для управления сегментами CAPITAL
 * Обрабатывает запросы от SegmentsResolver
 */
@Injectable()
export class SegmentsService {
  constructor(private readonly segmentsInteractor: SegmentsInteractor) {}

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

    // Конвертируем результат в DTO
    return {
      items: result.items as SegmentOutputDTO[],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }
}
