import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ProjectDomainEntity } from '../../domain/entities/project.entity';
import { ProjectTypeormEntity } from '../entities/project.typeorm-entity';
import { ProjectMapper } from '../mappers/project.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { IProjectDomainInterfaceBlockchainData } from '../../domain/interfaces/project-blockchain.interface';
import type { IProjectDomainInterfaceDatabaseData } from '../../domain/interfaces/project-database.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { ProjectFilterInputDTO } from '../../application/dto/property_management/project-filter.input';
import { PaginationUtils } from '~/shared/utils/pagination.utils';

@Injectable()
export class ProjectTypeormRepository
  extends BaseBlockchainRepository<ProjectDomainEntity, ProjectTypeormEntity>
  implements ProjectRepository, IBlockchainSyncRepository<ProjectDomainEntity>
{
  constructor(
    @InjectRepository(ProjectTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ProjectTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: ProjectMapper.toDomain,
      toEntity: ProjectMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: IProjectDomainInterfaceDatabaseData,
    blockchainData: IProjectDomainInterfaceBlockchainData
  ): ProjectDomainEntity {
    return new ProjectDomainEntity(databaseData, blockchainData);
  }

  protected getSyncKey(): string {
    return ProjectDomainEntity.getSyncKey();
  }

  async create(project: ProjectDomainEntity): Promise<ProjectDomainEntity> {
    const entity = this.repository.create(ProjectMapper.toEntity(project));
    const savedEntity = await this.repository.save(entity);
    return ProjectMapper.toDomain(savedEntity);
  }
  async findByHash(hash: string): Promise<ProjectDomainEntity | null> {
    const entity = await this.repository.findOneBy({ project_hash: hash });
    return entity ? ProjectMapper.toDomain(entity) : null;
  }
  async findByMaster(master: string): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find({ where: { master } });
    return entities.map((entity) => ProjectMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ProjectMapper.toDomain(entity));
  }

  /**
   * Найти проект с задачами
   */
  async findByIdWithIssues(projectHash: string): Promise<ProjectDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { project_hash: projectHash },
      relations: ['issues'],
    });
    return entity ? ProjectMapper.toDomain(entity) : null;
  }

  /**
   * Найти проект с историями
   */
  async findByIdWithStories(projectHash: string): Promise<ProjectDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { project_hash: projectHash },
      relations: ['stories'],
    });
    return entity ? ProjectMapper.toDomain(entity) : null;
  }

  /**
   * Найти проект со всеми связанными данными
   */
  async findByIdWithAllRelations(projectHash: string): Promise<ProjectDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { project_hash: projectHash },
      relations: ['issues', 'stories', 'issues.comments', 'issues.stories'],
    });
    return entity ? ProjectMapper.toDomain(entity) : null;
  }

  async findAllPaginated(
    filter?: ProjectFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<ProjectDomainEntity>> {
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
    if (filter?.master) {
      where.master = filter.master;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.project_hash) {
      where.project_hash = filter.project_hash;
    }
    if (filter?.parent_hash) {
      where.parent_hash = filter.parent_hash;
    }
    if (filter?.is_opened !== undefined) {
      where.is_opened = filter.is_opened;
    }
    if (filter?.is_planed !== undefined) {
      where.is_planed = filter.is_planed;
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
    const items = entities.map((entity) => ProjectMapper.toDomain(entity));

    // Возвращаем результат с пагинацией
    return PaginationUtils.createPaginationResult(items, totalCount, validatedOptions);
  }
}
