import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, Raw } from 'typeorm';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ProjectDomainEntity } from '../../domain/entities/project.entity';
import { ProjectTypeormEntity } from '../entities/project.typeorm-entity';
import { ProjectMapper } from '../mappers/project.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from '~/shared/sync/repositories/base-blockchain.repository';
import { EntityVersioningService } from '~/shared/sync/services/entity-versioning.service';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { IProjectDomainInterfaceBlockchainData } from '../../domain/interfaces/project-blockchain.interface';
import type { IProjectDomainInterfaceDatabaseData } from '../../domain/interfaces/project-database.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { ProjectFilterInputDTO } from '../../application/dto/property_management/project-filter.input';
import { PaginationUtils } from '~/shared/utils/pagination.utils';
import { IssueIdGenerationService } from '../../domain/services/issue-id-generation.service';

@Injectable()
export class ProjectTypeormRepository
  extends BaseBlockchainRepository<ProjectDomainEntity, ProjectTypeormEntity>
  implements ProjectRepository, IBlockchainSyncRepository<ProjectDomainEntity>
{
  constructor(
    @InjectRepository(ProjectTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<ProjectTypeormEntity>,
    entityVersioningService: EntityVersioningService
  ) {
    super(repository, entityVersioningService);
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

  /**
   * Переопределяем метод создания сущности для проектов,
   * чтобы правильно инициализировать поля для генерации ID задач
   */
  async createIfNotExists(
    blockchainData: IProjectDomainInterfaceBlockchainData,
    blockNum: number,
    present = true
  ): Promise<ProjectDomainEntity> {
    // Получаем ключ синхронизации из доменной сущности
    const syncKey = this.getSyncKey();
    const syncValue = this.extractSyncValueFromBlockchainData(blockchainData, syncKey);

    // Проверяем, существует ли уже по кастомному ключу
    const existing = await this.findBySyncKey(syncKey, syncValue);
    if (existing) {
      // Обновляем существующую сущность
      existing.updateFromBlockchain(blockchainData, blockNum, present);
      return await this.save(existing);
    } else {
      // Создаем полную структуру databaseData для проекта
      const databaseData: IProjectDomainInterfaceDatabaseData = {
        _id: '',
        block_num: blockNum,
        present: present,
        project_hash: syncValue.toLowerCase(),
        prefix: IssueIdGenerationService.generateProjectPrefix(syncValue),
        issue_counter: 0,
        voting_deadline: null,
      };

      const newEntity = this.createDomainEntity(databaseData, blockchainData);
      return await this.save(newEntity);
    }
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
    if (filter?.has_voting) {
      where.voting_deadline = Not(IsNull());
    }
    if (filter?.has_invite) {
      where.invite = Not('');
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

    // Получаем parent_title для проектов, у которых есть parent_hash
    await this.populateParentTitles(items);

    // Возвращаем результат с пагинацией
    return PaginationUtils.createPaginationResult(items, totalCount, validatedOptions);
  }

  /**
   * Получение проектов с пагинацией и компонентами
   * Если parent_hash не указан - возвращает проекты верхнего уровня
   * Если parent_hash указан - фильтрует по нему
   */
  async findAllPaginatedWithComponents(
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

    // Строим условия поиска для проектов верхнего уровня или с указанным parent_hash
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
    if (filter?.is_opened !== undefined) {
      where.is_opened = filter.is_opened;
    }
    if (filter?.is_planed !== undefined) {
      where.is_planed = filter.is_planed;
    }
    if (filter?.has_voting) {
      where.voting_deadline = Not(IsNull());
    }
    if (filter?.has_invite) {
      where.invite = Not('');
    }

    // Логика для parent_hash и is_component:
    const emptyHash = DomainToBlockchainUtils.getEmptyHash();
    if (filter?.parent_hash !== undefined) {
      // Если parent_hash указан явно - фильтруем по нему
      where.parent_hash = filter.parent_hash;
    } else if (filter?.is_component !== undefined) {
      // Логика для is_component:
      if (filter.is_component) {
        // Компоненты: проекты с parent_hash не null и не пустым хэшем
        where.parent_hash = Raw((alias) => `${alias} IS NOT NULL AND ${alias} != '${emptyHash}'`);
      } else {
        // Основные проекты: parent_hash = null ИЛИ parent_hash = emptyHash
        where.parent_hash = Raw((alias) => `${alias} IS NULL OR ${alias} = '${emptyHash}'`);
      }
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

    // Получаем parent_title для проектов, у которых есть parent_hash
    await this.populateParentTitles(items);

    // Для каждого проекта получаем его компоненты
    for (const project of items) {
      const components = await this.findComponentsByParentHash(project.project_hash);
      // Получаем parent_title для компонентов
      await this.populateParentTitles(components);
      // Добавляем компоненты к проекту
      (project as any).components = components;
    }

    // Возвращаем результат с пагинацией
    return PaginationUtils.createPaginationResult(items, totalCount, validatedOptions);
  }

  /**
   * Получение проекта по хешу с его компонентами
   */
  async findByHashWithComponents(hash: string): Promise<ProjectDomainEntity | null> {
    const entity = await this.repository.findOneBy({ project_hash: hash });
    if (!entity) {
      return null;
    }

    const project = ProjectMapper.toDomain(entity);

    // Получаем parent_title для проекта
    await this.populateParentTitles([project]);

    // Получаем компоненты проекта
    const components = await this.findComponentsByParentHash(hash);
    // Получаем parent_title для компонентов
    await this.populateParentTitles(components);
    (project as any).components = components;

    return project;
  }

  /**
   * Получение компонентов проекта по хешу родительского проекта
   */
  async findComponentsByParentHash(parentHash: string): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find({
      where: { parent_hash: parentHash },
      order: { created_at: 'DESC' },
    });

    return entities.map((entity) => ProjectMapper.toDomain(entity));
  }

  /**
   * Заполняет поле parent_title для массива проектов на основе их parent_hash
   */
  private async populateParentTitles(projects: ProjectDomainEntity[]): Promise<void> {
    // Собираем все уникальные parent_hash из проектов
    const parentHashes = projects
      .map((project) => project.parent_hash)
      .filter(
        (hash) => hash && hash.trim() !== '' && hash !== '0000000000000000000000000000000000000000000000000000000000000000'
      )
      .filter((hash, index, arr) => arr.indexOf(hash) === index); // Убираем дубликаты

    if (parentHashes.length === 0) {
      return; // Нет родительских проектов для обработки
    }

    // Получаем родительские проекты по их хешам
    const parentEntities = await this.repository.find({
      where: parentHashes.map((hash) => ({ project_hash: hash })),
      select: ['project_hash', 'title'],
    });

    // Создаем карту хеш -> название для быстрого поиска
    const parentTitleMap = new Map<string, string>();
    parentEntities.forEach((entity) => {
      if (entity.title) {
        parentTitleMap.set(entity.project_hash, entity.title);
      }
    });

    // Присваиваем parent_title каждому проекту
    projects.forEach((project) => {
      if (project.parent_hash && parentTitleMap.has(project.parent_hash)) {
        (project as any).parent_title = parentTitleMap.get(project.parent_hash);
      }
    });
  }
}
