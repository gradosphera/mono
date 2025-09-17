import { Injectable, Inject } from '@nestjs/common';
import { GenerationInteractor } from '../use-cases/generation.interactor';
import type { CreateCommitInputDTO } from '../dto/generation/create-commit-input.dto';
import type { RefreshSegmentInputDTO } from '../dto/generation/refresh-segment-input.dto';
import type { CreateStoryInputDTO } from '../dto/generation/create-story-input.dto';
import type { CreateIssueInputDTO } from '../dto/generation/create-issue-input.dto';
import type { CreateCycleInputDTO } from '../dto/generation/create-cycle-input.dto';
import type { StoryFilterInputDTO } from '../dto/generation/story-filter.input';
import type { IssueFilterInputDTO } from '../dto/generation/issue-filter.input';
import type { CommitFilterInputDTO } from '../dto/generation/commit-filter.input';
import type { CycleFilterInputDTO } from '../dto/generation/cycle-filter.input';
import type { GetIssueByIdInputDTO } from '../dto/generation/get-issue-by-id.input';
import type { GetCommitByIdInputDTO } from '../dto/generation/get-commit-by-id.input';
import { STORY_REPOSITORY, StoryRepository } from '../../domain/repositories/story.repository';
import { ISSUE_REPOSITORY, IssueRepository } from '../../domain/repositories/issue.repository';
import { COMMIT_REPOSITORY, CommitRepository } from '../../domain/repositories/commit.repository';
import { CYCLE_REPOSITORY, CycleRepository } from '../../domain/repositories/cycle.repository';
import { StoryOutputDTO } from '../dto/generation/story.dto';
import { IssueOutputDTO } from '../dto/generation/issue.dto';
import { CommitOutputDTO } from '../dto/generation/commit.dto';
import { CycleOutputDTO } from '../dto/generation/cycle.dto';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { TransactResult } from '@wharfkit/session';
import { StoryStatus } from '../../domain/enums/story-status.enum';
import { IssuePriority } from '../../domain/enums/issue-priority.enum';
import { IssueStatus } from '../../domain/enums/issue-status.enum';
import { CycleStatus } from '../../domain/enums/cycle-status.enum';
import { StoryDomainEntity } from '../../domain/entities/story.entity';
import { IssueDomainEntity } from '../../domain/entities/issue.entity';
import { CycleDomainEntity } from '../../domain/entities/cycle.entity';
import type { IStoryDatabaseData } from '../../domain/interfaces/story-database.interface';
import type { IIssueDatabaseData } from '../../domain/interfaces/issue-database.interface';
import type { ICycleDatabaseData } from '../../domain/interfaces/cycle-database.interface';

/**
 * Сервис уровня приложения для генерации в CAPITAL
 * Обрабатывает запросы от GenerationResolver
 */
@Injectable()
export class GenerationService {
  constructor(
    private readonly generationInteractor: GenerationInteractor,
    @Inject(STORY_REPOSITORY)
    private readonly storyRepository: StoryRepository,
    @Inject(ISSUE_REPOSITORY)
    private readonly issueRepository: IssueRepository,
    @Inject(COMMIT_REPOSITORY)
    private readonly commitRepository: CommitRepository,
    @Inject(CYCLE_REPOSITORY)
    private readonly cycleRepository: CycleRepository
  ) {}

  /**
   * Создание коммита в CAPITAL контракте
   */
  async createCommit(data: CreateCommitInputDTO): Promise<TransactResult> {
    return await this.generationInteractor.createCommit(data);
  }

  /**
   * Обновление сегмента в CAPITAL контракте
   */
  async refreshSegment(data: RefreshSegmentInputDTO): Promise<TransactResult> {
    return await this.generationInteractor.refreshSegment(data);
  }

  // ============ STORY METHODS ============

  /**
   * Создание истории
   */
  async createStory(data: CreateStoryInputDTO): Promise<StoryOutputDTO> {
    // Создаем данные для доменной сущности
    const storyDatabaseData: IStoryDatabaseData = {
      _id: '',
      title: data.title,
      description: data.description,
      status: data.status || StoryStatus.PENDING,
      project_hash: data.project_hash,
      issue_id: data.issue_id,
      created_by: data.created_by,
      sort_order: data.sort_order || 0,
      block_num: 0,
      present: false,
    };

    // Создаем доменную сущность
    const storyEntity = new StoryDomainEntity(storyDatabaseData);

    // Сохраняем через репозиторий
    const savedStory = await this.storyRepository.create(storyEntity);
    return savedStory;
  }

  /**
   * Получение историй с фильтрацией
   */
  async getStories(filter?: StoryFilterInputDTO, options?: PaginationInputDTO): Promise<PaginationResult<StoryOutputDTO>> {
    // Получаем результат с пагинацией из домена
    const result = await this.storyRepository.findAllPaginated(filter, options);

    // Конвертируем результат в DTO
    return {
      items: result.items as StoryOutputDTO[],
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };
  }

  // ============ ISSUE METHODS ============

  /**
   * Создание задачи
   */
  async createIssue(data: CreateIssueInputDTO): Promise<IssueOutputDTO> {
    // Создаем данные для доменной сущности
    const issueDatabaseData: IIssueDatabaseData = {
      _id: '',
      issue_hash: data.issue_hash,
      coopname: data.coopname,
      title: data.title,
      description: data.description,
      priority: data.priority || IssuePriority.MEDIUM,
      status: data.status || IssueStatus.BACKLOG,
      estimate: data.estimate || 0,
      sort_order: data.sort_order || 0,
      created_by: data.created_by,
      submaster_id: data.submaster_id,
      creators_ids: data.creators_ids || [],
      project_hash: data.project_hash,
      cycle_id: data.cycle_id,
      metadata: {
        labels: data.labels || [],
        attachments: data.attachments || [],
      },
    };

    // Создаем доменную сущность
    const issueEntity = new IssueDomainEntity(issueDatabaseData);

    // Сохраняем через репозиторий
    const savedIssue = await this.issueRepository.create(issueEntity);
    return savedIssue;
  }

  /**
   * Получение задач с фильтрацией
   */
  async getIssues(filter?: IssueFilterInputDTO, options?: PaginationInputDTO): Promise<PaginationResult<IssueOutputDTO>> {
    // Получаем результат с пагинацией из домена
    const result = await this.issueRepository.findAllPaginated(filter, options);

    // Конвертируем результат в DTO
    return {
      items: result.items as IssueOutputDTO[],
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };
  }

  /**
   * Получение задачи по ID
   */
  async getIssueById(data: GetIssueByIdInputDTO): Promise<IssueOutputDTO | null> {
    const issueEntity = await this.issueRepository.findById(data.id);
    return issueEntity ? (issueEntity as IssueOutputDTO) : null;
  }

  /**
   * Получение задачи по хэшу
   */
  async getIssueByHash(issueHash: string): Promise<IssueOutputDTO | null> {
    const issueEntity = await this.issueRepository.findByIssueHash(issueHash);
    return issueEntity ? (issueEntity as IssueOutputDTO) : null;
  }

  // ============ COMMIT METHODS ============

  /**
   * Получение коммитов с фильтрацией
   */
  async getCommits(filter?: CommitFilterInputDTO, options?: PaginationInputDTO): Promise<PaginationResult<CommitOutputDTO>> {
    // Получаем результат с пагинацией из домена
    const result = await this.commitRepository.findAllPaginated(filter, options);

    // Конвертируем результат в DTO
    return {
      items: result.items as CommitOutputDTO[],
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };
  }

  /**
   * Получение коммита по ID
   */
  async getCommitById(data: GetCommitByIdInputDTO): Promise<CommitOutputDTO | null> {
    const commitEntity = await this.commitRepository.findById(data.id);
    return commitEntity ? (commitEntity as CommitOutputDTO) : null;
  }

  /**
   * Получение коммита по хэшу
   */
  async getCommitByHash(commitHash: string): Promise<CommitOutputDTO | null> {
    const commitEntity = await this.commitRepository.findByCommitHash(commitHash);
    return commitEntity ? (commitEntity as CommitOutputDTO) : null;
  }

  // ============ CYCLE METHODS ============

  /**
   * Создание цикла
   */
  async createCycle(data: CreateCycleInputDTO): Promise<CycleOutputDTO> {
    // Создаем данные для доменной сущности
    const cycleDatabaseData: ICycleDatabaseData = {
      _id: '',
      name: data.name,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      status: data.status || CycleStatus.FUTURE,
    };

    // Создаем доменную сущность
    const cycleEntity = new CycleDomainEntity(cycleDatabaseData);

    // Сохраняем через репозиторий
    const savedCycle = await this.cycleRepository.create(cycleEntity);
    return savedCycle;
  }

  /**
   * Получение циклов с фильтрацией
   */
  async getCycles(filter?: CycleFilterInputDTO, options?: PaginationInputDTO): Promise<PaginationResult<CycleOutputDTO>> {
    // Получаем результат с пагинацией из домена
    const result = await this.cycleRepository.findAllPaginated(filter, options);

    // Конвертируем результат в DTO
    return {
      items: result.items as CycleOutputDTO[],
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };
  }
}
