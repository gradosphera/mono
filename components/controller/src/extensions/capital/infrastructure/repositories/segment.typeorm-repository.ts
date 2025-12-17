import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SegmentRepository } from '../../domain/repositories/segment.repository';
import { SegmentDomainEntity } from '../../domain/entities/segment.entity';
import { SegmentTypeormEntity } from '../entities/segment.typeorm-entity';
import { SegmentMapper } from '../mappers/segment.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from '~/shared/sync/repositories/base-blockchain.repository';
import { EntityVersioningService } from '~/shared/sync/services/entity-versioning.service';
import type { ISegmentBlockchainData } from '../../domain/interfaces/segment-blockchain.interface';
import type { ISegmentDatabaseData } from '../../domain/interfaces/segment-database.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { SegmentFilterInputDTO } from '../../application/dto/segments/segment-filter.input';
import { PaginationUtils } from '~/shared/utils/pagination.utils';
import { ResultTypeormEntity } from '../entities/result.typeorm-entity';

/**
 * TypeORM реализация репозитория сегментов
 */
@Injectable()
export class SegmentTypeormRepository
  extends BaseBlockchainRepository<SegmentDomainEntity, SegmentTypeormEntity>
  implements SegmentRepository, IBlockchainSyncRepository<SegmentDomainEntity>
{
  constructor(
    @InjectRepository(SegmentTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<SegmentTypeormEntity>,
    entityVersioningService: EntityVersioningService
  ) {
    super(repository, entityVersioningService);
  }

  protected getMapper() {
    return {
      toDomain: SegmentMapper.toDomain,
      toEntity: SegmentMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: ISegmentDatabaseData,
    blockchainData: ISegmentBlockchainData
  ): SegmentDomainEntity {
    return new SegmentDomainEntity(databaseData, blockchainData);
  }

  protected getSyncKey(): string {
    return SegmentDomainEntity.getSyncKey();
  }

  /**
   * Применяет фильтры к QueryBuilder
   */
  private applyFiltersToQueryBuilder(
    queryBuilder: SelectQueryBuilder<SegmentTypeormEntity>,
    filter?: SegmentFilterInputDTO
  ): SelectQueryBuilder<SegmentTypeormEntity> {
    if (!filter) {
      return queryBuilder;
    }

    // Применяем базовые фильтры
    if (filter.coopname) {
      queryBuilder = queryBuilder.andWhere('s.coopname = :coopname', { coopname: filter.coopname });
    }
    if (filter.username) {
      queryBuilder = queryBuilder.andWhere('s.username = :username', { username: filter.username });
    }
    if (filter.project_hash) {
      queryBuilder = queryBuilder.andWhere('s.project_hash = :project_hash', { project_hash: filter.project_hash });
    }
    if (filter.status) {
      queryBuilder = queryBuilder.andWhere('s.status = :status', { status: filter.status });
    }
    if (filter.is_author !== undefined) {
      queryBuilder = queryBuilder.andWhere('s.is_author = :is_author', { is_author: filter.is_author });
    }
    if (filter.is_creator !== undefined) {
      queryBuilder = queryBuilder.andWhere('s.is_creator = :is_creator', { is_creator: filter.is_creator });
    }
    if (filter.is_coordinator !== undefined) {
      queryBuilder = queryBuilder.andWhere('s.is_coordinator = :is_coordinator', { is_coordinator: filter.is_coordinator });
    }
    if (filter.is_investor !== undefined) {
      queryBuilder = queryBuilder.andWhere('s.is_investor = :is_investor', { is_investor: filter.is_investor });
    }
    if (filter.is_propertor !== undefined) {
      queryBuilder = queryBuilder.andWhere('s.is_propertor = :is_propertor', { is_propertor: filter.is_propertor });
    }
    if (filter.is_contributor !== undefined) {
      queryBuilder = queryBuilder.andWhere('s.is_contributor = :is_contributor', { is_contributor: filter.is_contributor });
    }
    if (filter.has_vote !== undefined) {
      queryBuilder = queryBuilder.andWhere('s.has_vote = :has_vote', { has_vote: filter.has_vote });
    }
    if (filter.parent_hash !== undefined) {
      queryBuilder = queryBuilder.andWhere('project.parent_hash = :parent_hash', { parent_hash: filter.parent_hash });
    }

    return queryBuilder;
  }

  /**
   * Заполняет результаты для массива сегментов
   * Результаты связываются по username и project_hash, выбирается с максимальным id
   */
  private async populateResultsForSegments(segments: SegmentTypeormEntity[]): Promise<void> {
    if (segments.length === 0) {
      return;
    }

    // Собираем уникальные комбинации username + project_hash
    const segmentKeys = segments.map((segment) => ({
      username: segment.username,
      project_hash: segment.project_hash,
    }));

    // Группируем по username и project_hash для пакетного запроса
    const groupedKeys = segmentKeys.reduce((acc, key) => {
      const keyStr = `${key.username}_${key.project_hash}`;
      if (!acc[keyStr]) {
        acc[keyStr] = key;
      }
      return acc;
    }, {} as Record<string, { username: string; project_hash: string }>);

    // Получаем результаты с максимальным id для каждой комбинации
    const resultPromises = Object.values(groupedKeys).map(async ({ username, project_hash }) => {
      const result = await this.repository.manager
        .createQueryBuilder(ResultTypeormEntity, 'r')
        .where('r.username = :username AND r.project_hash = :project_hash', { username, project_hash })
        .orderBy('r.id', 'DESC')
        .limit(1)
        .getOne();

      return result ? { username, project_hash, result } : null;
    });

    const results = await Promise.all(resultPromises);
    const resultMap = new Map<string, ResultTypeormEntity>();

    results.forEach((item) => {
      if (item) {
        const key = `${item.username}_${item.project_hash}`;
        resultMap.set(key, item.result);
      }
    });

    // Заполняем результаты в сегментах
    segments.forEach((segment) => {
      const key = `${segment.username}_${segment.project_hash}`;
      segment.result = resultMap.get(key) || undefined;
    });
  }

  /**
   * Найти все сегменты с пагинацией и фильтрацией
   */
  async findAllPaginated(
    filter?: SegmentFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<SegmentDomainEntity>> {
    // Валидируем параметры пагинации
    const validatedOptions: PaginationInputDomainInterface = options
      ? PaginationUtils.validatePaginationOptions(options)
      : {
          page: 1,
          limit: 10,
          sortBy: undefined,
          sortOrder: 'ASC' as const,
        };

    // Получаем параметры для SQL запроса
    const { limit, offset } = PaginationUtils.getSqlPaginationParams(validatedOptions);

    // Создаем query builder для гибкого построения запроса
    let queryBuilder = this.repository.createQueryBuilder('s').select('s').where('1=1'); // Начальное условие для удобства добавления AND

    // Добавляем join с contributor для получения display_name
    queryBuilder = queryBuilder.leftJoinAndSelect(
      's.contributor',
      'contributor',
      'contributor.coopname = s.coopname AND contributor.username = s.username'
    );

    // Добавляем join с проектами для получения статуса проекта (должен быть ДО применения фильтров, так как фильтр может использовать project.parent_hash)
    queryBuilder = queryBuilder.leftJoinAndSelect('s.project', 'project');

    // Применяем фильтры (после JOIN, чтобы фильтр по project.parent_hash работал корректно)
    queryBuilder = this.applyFiltersToQueryBuilder(queryBuilder, filter);

    // Получаем общее количество записей
    const totalCount = await queryBuilder.getCount();

    // Применяем сортировку
    if (validatedOptions.sortBy) {
      queryBuilder = queryBuilder.orderBy(`s.${validatedOptions.sortBy}`, validatedOptions.sortOrder);
    } else {
      queryBuilder = queryBuilder.orderBy('s._created_at', 'DESC');
    }

    // Применяем пагинацию
    queryBuilder = queryBuilder.skip(offset).take(limit);

    // Получаем записи
    const entities = await queryBuilder.getMany();

    // Заполняем результаты для сегментов
    await this.populateResultsForSegments(entities);

    // Преобразуем в доменные сущности
    const items = entities.map((entity) => SegmentMapper.toDomain(entity));

    // Возвращаем результат с пагинацией
    return PaginationUtils.createPaginationResult(items, totalCount, validatedOptions);
  }

  /**
   * Найти один сегмент по фильтрам
   */
  async findOne(filter?: SegmentFilterInputDTO): Promise<SegmentDomainEntity | null> {
    // Создаем query builder для гибкого построения запроса
    let queryBuilder = this.repository.createQueryBuilder('s').select('s').where('1=1'); // Начальное условие для удобства добавления AND

    // Добавляем join с contributor для получения display_name
    queryBuilder = queryBuilder.leftJoinAndSelect(
      's.contributor',
      'contributor',
      'contributor.coopname = s.coopname AND contributor.username = s.username'
    );

    // Добавляем join с проектами для получения статуса проекта (должен быть ДО применения фильтров)
    queryBuilder = queryBuilder.leftJoinAndSelect('s.project', 'project');

    // Применяем фильтры (после JOIN, чтобы фильтр по project.parent_hash работал корректно)
    queryBuilder = this.applyFiltersToQueryBuilder(queryBuilder, filter);

    // Получаем первую запись с сортировкой по дате создания (новые сначала)
    const entity = await queryBuilder.orderBy('s._created_at', 'DESC').getOne();

    // Возвращаем null, если запись не найдена
    if (!entity) {
      return null;
    }

    // Заполняем результат для сегмента
    await this.populateResultsForSegments([entity]);

    // Преобразуем в доменную сущность
    return SegmentMapper.toDomain(entity);
  }
}
