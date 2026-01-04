import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogRepository, ILogFilterInput } from '../../domain/repositories/log.repository';
import { LogDomainEntity } from '../../domain/entities/log.entity';
import { LogTypeormEntity } from '../entities/log.typeorm-entity';
import { LogMapper } from '../mappers/log.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { PaginationUtils } from '~/shared/utils/pagination.utils';

/**
 * TypeORM реализация репозитория логов
 */
@Injectable()
export class LogTypeormRepository implements LogRepository {
  constructor(
    @InjectRepository(LogTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<LogTypeormEntity>
  ) {}

  /**
   * Создание новой записи лога
   */
  async create(log: Omit<LogDomainEntity, '_id' | 'created_at'>): Promise<LogDomainEntity> {
    const entity = this.repository.create(LogMapper.toEntity(log));
    const savedEntity = await this.repository.save(entity);
    return LogMapper.toDomain(savedEntity);
  }

  /**
   * Поиск лога по ID
   */
  async findById(id: string): Promise<LogDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { _id: id } });
    return entity ? LogMapper.toDomain(entity) : null;
  }

  /**
   * Получение всех логов с фильтрацией и пагинацией
   */
  async findAll(
    filter?: ILogFilterInput,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<LogDomainEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('log');

    // Применение фильтров
    if (filter) {
      if (filter.coopname) {
        queryBuilder.andWhere('log.coopname = :coopname', { coopname: filter.coopname });
      }

      if (filter.project_hash) {
        queryBuilder.andWhere('log.project_hash = :project_hash', {
          project_hash: filter.project_hash.toLowerCase(),
        });
      }

      if (filter.event_types && filter.event_types.length > 0) {
        queryBuilder.andWhere('log.event_type IN (:...event_types)', { event_types: filter.event_types });
      }

      if (filter.initiator) {
        queryBuilder.andWhere('log.initiator = :initiator', { initiator: filter.initiator });
      }

      if (filter.date_from) {
        queryBuilder.andWhere('log.created_at >= :date_from', { date_from: filter.date_from });
      }

      if (filter.date_to) {
        queryBuilder.andWhere('log.created_at <= :date_to', { date_to: filter.date_to });
      }
    }

    // Сортировка по умолчанию - по дате создания (новые первые)
    queryBuilder.orderBy('log.created_at', 'DESC');

    // Применение пагинации
    const { page = 1, limit = 20 } = options || {};
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    // Выполнение запроса
    const [entities, total] = await queryBuilder.getManyAndCount();

    const items = entities.map((entity) => LogMapper.toDomain(entity));

    return PaginationUtils.createPaginationResult(items, total, options || { page: 1, limit: 20, sortOrder: 'ASC' });
  }

  /**
   * Получение логов по хешу проекта
   */
  async findByProjectHash(
    projectHash: string,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<LogDomainEntity>> {
    return this.findAll({ project_hash: projectHash }, options);
  }

  /**
   * Получение логов по инициатору
   */
  async findByInitiator(
    initiator: string,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<LogDomainEntity>> {
    return this.findAll({ initiator }, options);
  }

  /**
   * Удаление лога
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
