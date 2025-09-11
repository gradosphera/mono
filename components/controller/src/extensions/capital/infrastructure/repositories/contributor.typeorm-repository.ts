import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributorRepository } from '../../domain/repositories/contributor.repository';
import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorTypeormEntity } from '../entities/contributor.typeorm-entity';
import { ContributorMapper } from '../mappers/contributor.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import { IContributorDatabaseData } from '../../domain/interfaces/contributor-database.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { ContributorFilterInputDTO } from '../../application/dto/participation_management/contributor-filter.input';
import { PaginationUtils } from '~/shared/utils/pagination.utils';

@Injectable()
export class ContributorTypeormRepository
  extends BaseBlockchainRepository<ContributorDomainEntity, ContributorTypeormEntity>
  implements ContributorRepository, IBlockchainSyncRepository<ContributorDomainEntity>
{
  constructor(
    @InjectRepository(ContributorTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ContributorTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: ContributorMapper.toDomain,
      toEntity: ContributorMapper.toEntity,
    };
  }

  protected getSyncKey(): string {
    return ContributorDomainEntity.getSyncKey();
  }

  protected createDomainEntity(databaseData: IContributorDatabaseData, blockchainData: any): ContributorDomainEntity {
    return new ContributorDomainEntity(databaseData, blockchainData);
  }

  async create(contributor: ContributorDomainEntity): Promise<ContributorDomainEntity> {
    const entity = this.repository.create(ContributorMapper.toEntity(contributor));
    const savedEntity = await this.repository.save(entity);
    return ContributorMapper.toDomain(savedEntity);
  }

  async findByUsername(username: string): Promise<ContributorDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => ContributorMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ContributorDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ContributorMapper.toDomain(entity));
  }

  async findAllPaginated(
    filter?: ContributorFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<ContributorDomainEntity>> {
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
    if (filter?.username) {
      where.username = filter.username;
    }
    if (filter?.status) {
      where.status = filter.status;
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
    const items = entities.map((entity) => ContributorMapper.toDomain(entity));

    // Возвращаем результат с пагинацией
    return PaginationUtils.createPaginationResult(items, totalCount, validatedOptions);
  }
}
