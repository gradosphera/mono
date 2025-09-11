import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssueRepository } from '../../domain/repositories/issue.repository';
import { IssueDomainEntity } from '../../domain/entities/issue.entity';
import { IssueTypeormEntity } from '../entities/issue.typeorm-entity';
import { IssueMapper } from '../mappers/issue.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IssuePriority } from '../../domain/enums/issue-priority.enum';
import type { IssueStatus } from '../../domain/enums/issue-status.enum';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { IssueFilterInputDTO } from '../../application/dto/generation/issue-filter.input';
import { PaginationUtils } from '~/shared/utils/pagination.utils';

@Injectable()
export class IssueTypeormRepository implements IssueRepository {
  constructor(
    @InjectRepository(IssueTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly issueTypeormRepository: Repository<IssueTypeormEntity>
  ) {}

  async create(issue: IssueDomainEntity): Promise<IssueDomainEntity> {
    const entity = this.issueTypeormRepository.create(IssueMapper.toEntity(issue));
    const savedEntity = await this.issueTypeormRepository.save(entity);
    return IssueMapper.toDomain(savedEntity);
  }

  async findById(_id: string): Promise<IssueDomainEntity | null> {
    const entity = await this.issueTypeormRepository.findOne({ where: { _id } });
    return entity ? IssueMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository.find();
    return entities.map(IssueMapper.toDomain);
  }

  async findByProjectHash(projectHash: string): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository.find({
      where: { project_hash: projectHash },
    });
    return entities.map(IssueMapper.toDomain);
  }

  async findByCreatedBy(createdBy: string): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository.find({
      where: { created_by: createdBy },
    });
    return entities.map(IssueMapper.toDomain);
  }

  async findByCreatorsIds(creatorsIds: string[]): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository
      .createQueryBuilder('issue')
      .where('issue.creators_ids && :creatorsIds', { creatorsIds })
      .getMany();

    return entities.map(IssueMapper.toDomain);
  }

  async findBySubmasterId(submasterId: string): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository.find({
      where: { submaster_id: submasterId },
    });
    return entities.map(IssueMapper.toDomain);
  }

  async findByCycleId(cycleId: string): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository.find({
      where: { cycle_id: cycleId },
    });
    return entities.map(IssueMapper.toDomain);
  }

  async findByStatus(status: IssueStatus): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository.find({
      where: { status },
    });
    return entities.map(IssueMapper.toDomain);
  }

  async findByPriority(priority: IssuePriority): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository.find({
      where: { priority },
    });
    return entities.map(IssueMapper.toDomain);
  }

  async update(entity: IssueDomainEntity): Promise<IssueDomainEntity> {
    const typeormEntity = IssueMapper.toEntity(entity);
    await this.issueTypeormRepository.update(entity._id, typeormEntity);
    const updatedEntity = await this.issueTypeormRepository.findOne({
      where: { _id: entity._id },
    });
    return updatedEntity ? IssueMapper.toDomain(updatedEntity) : entity;
  }

  async delete(_id: string): Promise<void> {
    await this.issueTypeormRepository.delete(_id);
  }

  /**
   * Найти задачу с комментариями
   */
  async findByIdWithComments(issueId: string): Promise<IssueDomainEntity | null> {
    const entity = await this.issueTypeormRepository.findOne({
      where: { _id: issueId },
      relations: ['comments'],
    });
    return entity ? IssueMapper.toDomain(entity) : null;
  }

  /**
   * Найти задачу с историями
   */
  async findByIdWithStories(issueId: string): Promise<IssueDomainEntity | null> {
    const entity = await this.issueTypeormRepository.findOne({
      where: { _id: issueId },
      relations: ['stories'],
    });
    return entity ? IssueMapper.toDomain(entity) : null;
  }

  /**
   * Найти задачу со всеми связанными данными
   */
  async findByIdWithAllRelations(issueId: string): Promise<IssueDomainEntity | null> {
    const entity = await this.issueTypeormRepository.findOne({
      where: { _id: issueId },
      relations: ['comments', 'stories', 'project', 'cycle'],
    });
    return entity ? IssueMapper.toDomain(entity) : null;
  }

  /**
   * Найти задачи проекта с комментариями
   */
  async findByProjectHashWithComments(projectHash: string): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository.find({
      where: { project_hash: projectHash },
      relations: ['comments'],
      order: { sort_order: 'ASC' },
    });
    return entities.map(IssueMapper.toDomain);
  }

  /**
   * Найти задачи проекта с историями
   */
  async findByProjectHashWithStories(projectHash: string): Promise<IssueDomainEntity[]> {
    const entities = await this.issueTypeormRepository.find({
      where: { project_hash: projectHash },
      relations: ['stories'],
      order: { sort_order: 'ASC' },
    });
    return entities.map(IssueMapper.toDomain);
  }

  async findAllPaginated(
    filter?: IssueFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<IssueDomainEntity>> {
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
    if (filter?.title) {
      where.title = filter.title;
    }
    if (filter?.priority) {
      where.priority = filter.priority;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.project_hash) {
      where.project_hash = filter.project_hash;
    }
    if (filter?.created_by) {
      where.created_by = filter.created_by;
    }
    if (filter?.submaster_id) {
      where.submaster_id = filter.submaster_id;
    }
    if (filter?.cycle_id) {
      where.cycle_id = filter.cycle_id;
    }

    // Получаем общее количество записей
    const totalCount = await this.issueTypeormRepository.count({ where });

    // Получаем записи с пагинацией
    const orderBy: any = {};
    if (validatedOptions.sortBy) {
      orderBy[validatedOptions.sortBy] = validatedOptions.sortOrder;
    } else {
      orderBy.sort_order = 'ASC';
    }

    const entities = await this.issueTypeormRepository.find({
      where,
      skip: offset,
      take: limit,
      order: orderBy,
    });

    // Преобразуем в доменные сущности
    const items = entities.map((entity) => IssueMapper.toDomain(entity));

    // Возвращаем результат с пагинацией
    return PaginationUtils.createPaginationResult(items, totalCount, validatedOptions);
  }
}
