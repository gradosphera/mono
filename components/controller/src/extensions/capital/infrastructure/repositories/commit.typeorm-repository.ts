import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommitRepository } from '../../domain/repositories/commit.repository';
import { CommitDomainEntity } from '../../domain/entities/commit.entity';
import { CommitTypeormEntity } from '../entities/commit.typeorm-entity';
import { CommitMapper } from '../mappers/commit.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { ICommitBlockchainData } from '../../domain/interfaces/commit-blockchain.interface';
import { BaseBlockchainRepository } from '~/shared/sync/repositories/base-blockchain.repository';
import { EntityVersioningService } from '~/shared/sync/services/entity-versioning.service';
import type { ICommitDatabaseData } from '../../domain/interfaces/commit-database.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { CommitFilterInputDTO } from '../../application/dto/generation/commit-filter.input';
import { PaginationUtils } from '~/shared/utils/pagination.utils';

@Injectable()
export class CommitTypeormRepository
  extends BaseBlockchainRepository<CommitDomainEntity, CommitTypeormEntity>
  implements CommitRepository, IBlockchainSyncRepository<CommitDomainEntity>
{
  constructor(
    @InjectRepository(CommitTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<CommitTypeormEntity>,
    entityVersioningService: EntityVersioningService
  ) {
    super(repository, entityVersioningService);
  }

  protected getMapper() {
    return {
      toDomain: CommitMapper.toDomain,
      toEntity: CommitMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: ICommitDatabaseData,
    blockchainData: ICommitBlockchainData
  ): CommitDomainEntity {
    return new CommitDomainEntity(databaseData, blockchainData);
  }

  protected getSyncKey(): string {
    return CommitDomainEntity.getSyncKey();
  }

  // Специфичные методы для CommitRepository

  async findByCommitHash(commitHash: string): Promise<CommitDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { commit_hash: commitHash } });
    return entity ? CommitMapper.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }

  async findAllPaginated(
    filter?: CommitFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<CommitDomainEntity>> {
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
    if (filter?.commit_hash) {
      where.commit_hash = filter.commit_hash;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.coopname) {
      where.coopname = filter.coopname;
    }
    if (filter?.username) {
      where.username = filter.username;
    }
    if (filter?.project_hash) {
      where.project_hash = filter.project_hash;
    }
    if (filter?.blockchain_status) {
      where.blockchain_status = filter.blockchain_status;
    }
    if (filter?.created_date) {
      // Фильтр по дате создания
      where.created_at = filter.created_date;
    }

    // Получаем общее количество записей
    const totalCount = await this.repository.count({ where });

    // Получаем записи с пагинацией
    const orderBy: any = {};
    if (validatedOptions.sortBy) {
      orderBy[validatedOptions.sortBy] = validatedOptions.sortOrder;
    } else {
      orderBy.created_at = 'DESC';
    }

    const entities = await this.repository.find({
      where,
      skip: offset,
      take: limit,
      order: orderBy,
    });

    // Преобразуем в доменные сущности
    const items = entities.map((entity) => CommitMapper.toDomain(entity));

    // Возвращаем результат с пагинацией
    return PaginationUtils.createPaginationResult(items, totalCount, validatedOptions);
  }
}
