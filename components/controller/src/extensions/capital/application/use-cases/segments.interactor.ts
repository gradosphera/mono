import { Injectable, Inject } from '@nestjs/common';
import { SEGMENT_REPOSITORY, SegmentRepository } from '../../domain/repositories/segment.repository';
import { SegmentDomainEntity } from '../../domain/entities/segment.entity';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { SegmentFilterInputDTO } from '../dto/segments/segment-filter.input';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';

/**
 * Интерактор домена для управления сегментами CAPITAL контракта
 * Обрабатывает запросы на чтение данных сегментов
 */
@Injectable()
export class SegmentsInteractor {
  constructor(
    @Inject(SEGMENT_REPOSITORY)
    private readonly segmentRepository: SegmentRepository,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(SegmentsInteractor.name);
  }

  /**
   * Получить все сегменты с пагинацией и фильтрацией
   */
  async getSegments(
    filter?: SegmentFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<SegmentDomainEntity>> {
    return await this.segmentRepository.findAllPaginated(filter, options);
  }

  /**
   * Получить один сегмент по фильтрам
   */
  async getSegment(filter?: SegmentFilterInputDTO): Promise<SegmentDomainEntity | null> {
    return await this.segmentRepository.findOne(filter);
  }
}
