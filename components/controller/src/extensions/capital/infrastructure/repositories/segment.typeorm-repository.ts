import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    // Строим условия поиска
    const where: any = {};
    if (filter?.coopname) {
      where.coopname = filter.coopname;
    }
    if (filter?.username) {
      where.username = filter.username;
    }
    if (filter?.project_hash) {
      where.project_hash = filter.project_hash;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.is_author !== undefined) {
      where.is_author = filter.is_author;
    }
    if (filter?.is_creator !== undefined) {
      where.is_creator = filter.is_creator;
    }
    if (filter?.is_coordinator !== undefined) {
      where.is_coordinator = filter.is_coordinator;
    }
    if (filter?.is_investor !== undefined) {
      where.is_investor = filter.is_investor;
    }
    if (filter?.is_propertor !== undefined) {
      where.is_propertor = filter.is_propertor;
    }
    if (filter?.is_contributor !== undefined) {
      where.is_contributor = filter.is_contributor;
    }
    if (filter?.has_vote !== undefined) {
      where.has_vote = filter.has_vote;
    }

    // Получаем общее количество записей
    const totalCount = await this.repository.count({ where });

    // Получаем записи с пагинацией
    const orderBy: any = {};
    if (validatedOptions.sortBy) {
      orderBy[validatedOptions.sortBy] = validatedOptions.sortOrder;
    } else {
      orderBy._created_at = 'DESC';
    }

    const entities = await this.repository.find({
      where,
      skip: offset,
      take: limit,
      order: orderBy,
      relations: ['contributor'], // Добавляем join с contributor
    });

    // Преобразуем в доменные сущности
    const items = entities.map((entity) => SegmentMapper.toDomain(entity));

    // Возвращаем результат с пагинацией
    return PaginationUtils.createPaginationResult(items, totalCount, validatedOptions);
  }
}
