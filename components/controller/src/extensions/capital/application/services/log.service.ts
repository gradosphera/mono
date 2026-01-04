import { Injectable, Inject } from '@nestjs/common';
import { LogRepository, LOG_REPOSITORY, ILogFilterInput } from '../../domain/repositories/log.repository';
import { LogDomainEntity } from '../../domain/entities/log.entity';
import { LogEventType } from '../../domain/enums/log-event-type.enum';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';

/**
 * Сервис для работы с логами событий
 * Предоставляет удобный API для создания и получения логов
 */
@Injectable()
export class LogService {
  constructor(
    @Inject(LOG_REPOSITORY)
    private readonly logRepository: LogRepository,
    private readonly logger: WinstonLoggerService
  ) {}

  /**
   * Создание новой записи лога
   * Основной метод для логирования событий
   */
  async createLog(params: {
    coopname: string;
    project_hash: string;
    event_type: LogEventType;
    initiator: string;
    reference_id?: string;
    metadata?: Record<string, any>;
  }): Promise<LogDomainEntity> {
    try {
      const logData = LogDomainEntity.create(params);
      const createdLog = await this.logRepository.create(logData);

      this.logger.debug(
        `Создан лог события: ${params.event_type} для проекта ${params.project_hash} от ${params.initiator}`
      );

      return createdLog;
    } catch (error) {
      this.logger.error(`Ошибка создания лога: ${error}`, { params });
      throw error;
    }
  }

  /**
   * Получение логов с фильтрацией и пагинацией
   */
  async getLogs(
    filter?: ILogFilterInput,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<LogDomainEntity>> {
    return this.logRepository.findAll(filter, options);
  }

  /**
   * Получение логов по хешу проекта
   */
  async getLogsByProjectHash(
    projectHash: string,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<LogDomainEntity>> {
    return this.logRepository.findByProjectHash(projectHash, options);
  }

  /**
   * Получение логов по инициатору
   */
  async getLogsByInitiator(
    initiator: string,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<LogDomainEntity>> {
    return this.logRepository.findByInitiator(initiator, options);
  }

  /**
   * Получение лога по ID
   */
  async getLogById(id: string): Promise<LogDomainEntity | null> {
    return this.logRepository.findById(id);
  }

  // Специализированные методы для логирования конкретных событий

  /**
   * Логирование добавления соавтора
   */
  async logAuthorAdded(params: {
    coopname: string;
    project_hash: string;
    initiator: string;
    author_username: string;
  }): Promise<LogDomainEntity> {
    return this.createLog({
      coopname: params.coopname,
      project_hash: params.project_hash,
      event_type: LogEventType.AUTHOR_ADDED,
      initiator: params.initiator,
      metadata: {
        author_username: params.author_username,
      },
    });
  }

  /**
   * Логирование создания проекта
   */
  async logProjectCreated(params: {
    coopname: string;
    project_hash: string;
    initiator: string;
    title: string;
  }): Promise<LogDomainEntity> {
    return this.createLog({
      coopname: params.coopname,
      project_hash: params.project_hash,
      event_type: LogEventType.PROJECT_CREATED,
      initiator: params.initiator,
      reference_id: params.project_hash,
      metadata: {
        title: params.title,
      },
    });
  }

  /**
   * Логирование создания компонента
   */
  async logComponentCreated(params: {
    coopname: string;
    project_hash: string;
    parent_hash: string;
    initiator: string;
    title: string;
  }): Promise<LogDomainEntity> {
    return this.createLog({
      coopname: params.coopname,
      project_hash: params.project_hash,
      event_type: LogEventType.COMPONENT_CREATED,
      initiator: params.initiator,
      reference_id: params.project_hash,
      metadata: {
        title: params.title,
        parent_hash: params.parent_hash,
      },
    });
  }

  /**
   * Логирование получения коммита
   */
  async logCommitReceived(params: {
    coopname: string;
    project_hash: string;
    initiator: string;
    commit_hash: string;
    amount: string;
    symbol: string;
  }): Promise<LogDomainEntity> {
    return this.createLog({
      coopname: params.coopname,
      project_hash: params.project_hash,
      event_type: LogEventType.COMMIT_RECEIVED,
      initiator: params.initiator,
      reference_id: params.commit_hash,
      metadata: {
        amount: params.amount,
        symbol: params.symbol,
      },
    });
  }

  /**
   * Логирование получения инвестиции
   */
  async logInvestmentReceived(params: {
    coopname: string;
    project_hash: string;
    initiator: string;
    invest_hash: string;
    amount: string;
    symbol: string;
  }): Promise<LogDomainEntity> {
    return this.createLog({
      coopname: params.coopname,
      project_hash: params.project_hash,
      event_type: LogEventType.INVESTMENT_RECEIVED,
      initiator: params.initiator,
      reference_id: params.invest_hash,
      metadata: {
        amount: params.amount,
        symbol: params.symbol,
      },
    });
  }

  /**
   * Логирование назначения мастера на проект
   */
  async logProjectMasterAssigned(params: {
    coopname: string;
    project_hash: string;
    initiator: string;
    master: string;
  }): Promise<LogDomainEntity> {
    return this.createLog({
      coopname: params.coopname,
      project_hash: params.project_hash,
      event_type: LogEventType.PROJECT_MASTER_ASSIGNED,
      initiator: params.initiator,
      metadata: {
        master: params.master,
      },
    });
  }

  /**
   * Логирование назначения мастера на компонент
   */
  async logComponentMasterAssigned(params: {
    coopname: string;
    project_hash: string;
    initiator: string;
    master: string;
  }): Promise<LogDomainEntity> {
    return this.createLog({
      coopname: params.coopname,
      project_hash: params.project_hash,
      event_type: LogEventType.COMPONENT_MASTER_ASSIGNED,
      initiator: params.initiator,
      metadata: {
        master: params.master,
      },
    });
  }

  /**
   * Логирование получения взноса результатом
   */
  async logResultContributionReceived(params: {
    coopname: string;
    project_hash: string;
    initiator: string;
    result_hash: string;
    amount: string;
    symbol: string;
  }): Promise<LogDomainEntity> {
    return this.createLog({
      coopname: params.coopname,
      project_hash: params.project_hash,
      event_type: LogEventType.RESULT_CONTRIBUTION_RECEIVED,
      initiator: params.initiator,
      reference_id: params.result_hash,
      metadata: {
        amount: params.amount,
        symbol: params.symbol,
      },
    });
  }
}
