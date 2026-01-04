import { Injectable } from '@nestjs/common';
import { LogService } from '../services/log.service';
import { LogOutputDTO } from '../dto/logs/log.dto';
import { GetLogsInputDTO } from '../dto/logs/get-logs.input';
import { PaginationResult, PaginationInputDTO } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

/**
 * Интерактор для работы с логами
 * Обрабатывает бизнес-логику для получения логов событий
 */
@Injectable()
export class LogInteractor {
  constructor(private readonly logService: LogService) {}

  /**
   * Получение логов с фильтрацией и пагинацией
   */
  async getLogs(input: GetLogsInputDTO): Promise<PaginationResult<LogOutputDTO>> {
    const { filter, pagination } = input;

    // Преобразование фильтров из DTO в доменный интерфейс
    const domainFilter = filter
      ? {
          coopname: filter.coopname,
          project_hash: filter.project_hash,
          event_types: filter.event_types,
          initiator: filter.initiator,
          date_from: filter.date_from,
          date_to: filter.date_to,
        }
      : undefined;

    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = pagination;

    // Получение логов из сервиса
    const result = await this.logService.getLogs(domainFilter, domainOptions);

    // Преобразование доменных сущностей в DTO
    const items = result.items.map((log) => this.mapToDTO(log));

    return {
      items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение логов по хешу проекта
   */
  async getLogsByProjectHash(
    project_hash: string,
    pagination?: PaginationInputDTO
  ): Promise<PaginationResult<LogOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = pagination;

    const result = await this.logService.getLogsByProjectHash(project_hash, domainOptions);
    const items = result.items.map((log) => this.mapToDTO(log));

    return {
      items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение лога по ID
   */
  async getLogById(id: string): Promise<LogOutputDTO | null> {
    const log = await this.logService.getLogById(id);
    return log ? this.mapToDTO(log) : null;
  }

  /**
   * Маппинг доменной сущности в DTO
   */
  private mapToDTO(log: any): LogOutputDTO {
    return {
      _id: log._id,
      coopname: log.coopname,
      project_hash: log.project_hash,
      event_type: log.event_type,
      initiator: log.initiator,
      reference_id: log.reference_id,
      metadata: log.metadata,
      message: log.message,
      created_at: log.created_at,
    };
  }
}
