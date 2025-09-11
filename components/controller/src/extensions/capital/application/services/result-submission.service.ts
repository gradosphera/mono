import { Injectable } from '@nestjs/common';
import { ResultSubmissionInteractor } from '../../domain/interactors/result-submission.interactor';
import type { PushResultInputDTO } from '../dto/result_submission/push-result-input.dto';
import type { ConvertSegmentInputDTO } from '../dto/result_submission/convert-segment-input.dto';
import type { TransactResult } from '@wharfkit/session';
import { ResultOutputDTO } from '../dto/result_submission/result.dto';
import { ResultFilterInputDTO } from '../dto/result_submission/result-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

/**
 * Сервис уровня приложения для подачи результатов в CAPITAL
 * Обрабатывает запросы от ResultSubmissionResolver
 */
@Injectable()
export class ResultSubmissionService {
  constructor(private readonly resultSubmissionInteractor: ResultSubmissionInteractor) {}

  /**
   * Внесение результата в CAPITAL контракте
   */
  async pushResult(data: PushResultInputDTO): Promise<TransactResult> {
    return await this.resultSubmissionInteractor.pushResult(data);
  }

  /**
   * Конвертация сегмента в CAPITAL контракте
   */
  async convertSegment(data: ConvertSegmentInputDTO): Promise<TransactResult> {
    return await this.resultSubmissionInteractor.convertSegment(data);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех результатов с фильтрацией
   */
  async getResults(filter?: ResultFilterInputDTO, options?: PaginationInputDTO): Promise<PaginationResult<ResultOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.resultSubmissionInteractor.getResults(filter, domainOptions);

    // Конвертируем результат в DTO
    return {
      items: result.items as ResultOutputDTO[],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение результата по ID
   */
  async getResultById(_id: string): Promise<ResultOutputDTO | null> {
    const result = await this.resultSubmissionInteractor.getResultById(_id);
    return result as ResultOutputDTO | null;
  }
}
