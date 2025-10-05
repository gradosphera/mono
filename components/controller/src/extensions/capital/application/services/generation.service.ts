import { Injectable, Inject } from '@nestjs/common';
import { generateUniqueHash } from '~/utils/generate-hash.util';
import { GenerationInteractor } from '../use-cases/generation.interactor';
import type { CreateCommitInputDTO } from '../dto/generation/create-commit-input.dto';
import type { RefreshSegmentInputDTO } from '../dto/generation/refresh-segment-input.dto';
import type { CreateStoryInputDTO } from '../dto/generation/create-story-input.dto';
import type { CreateIssueInputDTO } from '../dto/generation/create-issue-input.dto';
import type { CreateCycleInputDTO } from '../dto/generation/create-cycle-input.dto';
import type { UpdateStoryInputDTO } from '../dto/generation/update-story-input.dto';
import type { UpdateIssueInputDTO } from '../dto/generation/update-issue-input.dto';
import type { StoryFilterInputDTO } from '../dto/generation/story-filter.input';
import type { IssueFilterInputDTO } from '../dto/generation/issue-filter.input';
import type { CommitFilterInputDTO } from '../dto/generation/commit-filter.input';
import type { CycleFilterInputDTO } from '../dto/generation/cycle-filter.input';
import type { GetIssueByIdInputDTO } from '../dto/generation/get-issue-by-id.input';
import type { GetCommitByIdInputDTO } from '../dto/generation/get-commit-by-id.input';
import { STORY_REPOSITORY, StoryRepository } from '../../domain/repositories/story.repository';
import { ISSUE_REPOSITORY, IssueRepository } from '../../domain/repositories/issue.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/repositories/project.repository';
import { COMMIT_REPOSITORY, CommitRepository } from '../../domain/repositories/commit.repository';
import { CYCLE_REPOSITORY, CycleRepository } from '../../domain/repositories/cycle.repository';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../../domain/repositories/contributor.repository';
import { IssueIdGenerationService } from '../../domain/services/issue-id-generation.service';
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
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { DocumentDomainInteractor } from '~/domain/document/interactors/document.interactor';
import { Cooperative } from 'cooptypes';
import { IssuePermissionsService } from './issue-permissions.service';
import { PermissionsService } from './permissions.service';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';

/**
 * Сервис уровня приложения для генерации в CAPITAL
 * Обрабатывает запросы от GenerationResolver
 */
@Injectable()
export class GenerationService {
  /**
   * Проверяет доступ пользователя к проекту
   */
  private async checkProjectAccess(username: string, coopname: string, projectHash: string): Promise<void> {
    // Находим вкладчика по username и coopname
    const contributor = await this.contributorRepository.findByUsernameAndCoopname(username, coopname);
    if (!contributor) {
      throw new Error(`Вкладчик с договором не найден`);
    }

    // Проверяем, что у вкладчика есть доступ к проекту
    if (!contributor.appendixes.includes(projectHash)) {
      throw new Error(`У вас нет доступа к проекту`);
    }
  }
  constructor(
    private readonly generationInteractor: GenerationInteractor,
    @Inject(STORY_REPOSITORY)
    private readonly storyRepository: StoryRepository,
    @Inject(ISSUE_REPOSITORY)
    private readonly issueRepository: IssueRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(COMMIT_REPOSITORY)
    private readonly commitRepository: CommitRepository,
    @Inject(CYCLE_REPOSITORY)
    private readonly cycleRepository: CycleRepository,
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository,
    private readonly issueIdGenerationService: IssueIdGenerationService,
    private readonly documentDomainInteractor: DocumentDomainInteractor,
    private readonly issuePermissionsService: IssuePermissionsService,
    private readonly permissionsService: PermissionsService
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
  async createStory(data: CreateStoryInputDTO, username: string): Promise<StoryOutputDTO> {
    // Проверяем доступ к проекту, если он указан
    if (data.project_hash) {
      await this.checkProjectAccess(username, data.coopname, data.project_hash);
    }

    // Создаем данные для доменной сущности
    const storyDatabaseData: IStoryDatabaseData = {
      _id: '',
      story_hash: data.story_hash,
      coopname: data.coopname,
      title: data.title,
      description: data.description,
      status: data.status || StoryStatus.PENDING,
      project_hash: data.project_hash,
      issue_id: data.issue_id,
      created_by: username, // Сохраняем username пользователя
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
   * Обновление истории
   */
  async updateStory(data: UpdateStoryInputDTO, username: string): Promise<StoryOutputDTO> {
    // Получаем существующую историю
    const existingStory = await this.storyRepository.findByStoryHash(data.story_hash);

    if (!existingStory) {
      throw new Error(`История с хэшем ${data.story_hash} не найдена`);
    }

    // Проверяем доступ к проекту
    const projectHash = data.project_hash ?? existingStory.project_hash;
    if (projectHash) {
      await this.checkProjectAccess(username, existingStory.coopname, projectHash);
    }

    // Создаем обновленные данные для доменной сущности
    const updatedStoryDatabaseData: IStoryDatabaseData = {
      _id: existingStory._id,
      story_hash: existingStory.story_hash,
      coopname: existingStory.coopname,
      title: data.title ?? existingStory.title,
      description: data.description ?? existingStory.description,
      status: data.status ?? existingStory.status,
      project_hash: data.project_hash ?? existingStory.project_hash,
      issue_id: data.issue_id ?? existingStory.issue_id,
      created_by: existingStory.created_by,
      sort_order: data.sort_order ?? existingStory.sort_order,
      block_num: existingStory.block_num,
      present: existingStory.present,
    };

    // Создаем доменную сущность с обновленными данными
    const storyEntity = new StoryDomainEntity(updatedStoryDatabaseData);

    // Сохраняем через репозиторий
    const updatedStory = await this.storyRepository.update(storyEntity);
    return updatedStory;
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

  /**
   * Получение истории по хэшу
   */
  async getStoryByHash(storyHash: string): Promise<StoryOutputDTO | null> {
    const storyEntity = await this.storyRepository.findByStoryHash(storyHash);
    return storyEntity ? (storyEntity as StoryOutputDTO) : null;
  }

  /**
   * Удаление истории по хэшу
   */
  async deleteStoryByHash(storyHash: string): Promise<boolean> {
    const storyEntity = await this.storyRepository.findByStoryHash(storyHash);
    if (!storyEntity) {
      throw new Error(`История с хэшем ${storyHash} не найдена`);
    }
    await this.storyRepository.delete(storyEntity._id);
    return true;
  }

  // ============ ISSUE METHODS ============

  /**
   * Создание задачи
   */
  async createIssue(
    data: CreateIssueInputDTO,
    username: string,
    currentUser?: MonoAccountDomainInterface
  ): Promise<IssueOutputDTO> {
    // Проверяем доступ к проекту
    await this.checkProjectAccess(username, data.coopname, data.project_hash);

    // Проверяем права на установку статуса задачи
    if (data.status) {
      await this.issuePermissionsService.validateIssueStatusPermission(
        username,
        data.coopname,
        data.project_hash,
        data.submaster,
        data.status
      );
    }

    // Находим проект для генерации ID
    const project = await this.projectRepository.findByHash(data.project_hash);
    if (!project) {
      throw new Error(`Проект с хэшем ${data.project_hash} не найден`);
    }

    // Генерируем уникальный хэш для задачи
    const issueHash = generateUniqueHash();

    // Подготавливаем данные задачи без ID
    const issueDataWithoutId: Omit<IIssueDatabaseData, 'id'> = {
      _id: '',
      issue_hash: issueHash,
      coopname: data.coopname,
      title: data.title,
      description: data.description,
      priority: data.priority || IssuePriority.MEDIUM,
      status: data.status || IssueStatus.BACKLOG,
      estimate: data.estimate || 0,
      sort_order: data.sort_order || 0,
      created_by: username, // Сохраняем имя пользователя
      submaster: data.submaster,
      creators: data.creators || [],
      project_hash: data.project_hash,
      cycle_id: data.cycle_id,
      metadata: {
        labels: data.labels || [],
        attachments: data.attachments || [],
      },
      present: false,
    };

    // Генерируем ID через доменный сервис
    const { issueData } = this.issueIdGenerationService.generateIssueId(project, issueDataWithoutId);

    // Увеличиваем счетчик в проекте
    this.issueIdGenerationService.incrementProjectIssueCounter(project);

    // Сохраняем обновленный проект
    await this.projectRepository.update(project);

    // Создаем доменную сущность с готовым ID
    const issueEntity = new IssueDomainEntity(issueData);

    // Сохраняем задачу через репозиторий
    const savedIssue = await this.issueRepository.create(issueEntity);

    // Рассчитываем права доступа для задачи
    const permissions = await this.permissionsService.calculateIssuePermissions(savedIssue, currentUser);

    // Возвращаем задачу с правами доступа
    return {
      ...savedIssue,
      permissions,
    } as IssueOutputDTO;
  }

  /**
   * Обновление задачи
   */
  async updateIssue(
    data: UpdateIssueInputDTO,
    username: string,
    currentUser?: MonoAccountDomainInterface
  ): Promise<IssueOutputDTO> {
    // Получаем существующую задачу
    const existingIssue = await this.issueRepository.findByIssueHash(data.issue_hash);

    if (!existingIssue) {
      throw new Error(`Задача с хэшем ${data.issue_hash} не найдена`);
    }

    // Проверяем доступ к проекту
    await this.checkProjectAccess(username, existingIssue.coopname, existingIssue.project_hash);

    // Проверяем права на изменение статуса задачи
    if (data.status !== undefined) {
      await this.issuePermissionsService.validateIssueStatusPermission(
        username,
        existingIssue.coopname,
        existingIssue.project_hash,
        existingIssue.submaster,
        data.status,
        existingIssue.status
      );
    }

    // Создаем обновленные данные для доменной сущности
    const updatedIssueDatabaseData: IIssueDatabaseData = {
      _id: existingIssue._id,
      id: existingIssue.id,
      issue_hash: existingIssue.issue_hash,
      coopname: existingIssue.coopname,
      title: data.title ?? existingIssue.title,
      description: data.description ?? existingIssue.description,
      priority: data.priority ?? existingIssue.priority,
      status: data.status ?? existingIssue.status,
      estimate: data.estimate ?? existingIssue.estimate,
      sort_order: data.sort_order ?? existingIssue.sort_order,
      created_by: existingIssue.created_by, // Сохраняем существующее значение created_by (username)
      submaster: data.submaster ?? existingIssue.submaster,
      creators: data.creators ?? existingIssue.creators,
      project_hash: existingIssue.project_hash,
      cycle_id: data.cycle_id ?? existingIssue.cycle_id,
      metadata: {
        labels: data.labels ?? existingIssue.metadata.labels,
        attachments: data.attachments ?? existingIssue.metadata.attachments,
      },
      present: existingIssue.present,
    };

    // Создаем доменную сущность с обновленными данными
    const issueEntity = new IssueDomainEntity(updatedIssueDatabaseData);

    // Сохраняем через репозиторий
    const updatedIssue = await this.issueRepository.update(issueEntity);

    // Рассчитываем права доступа для задачи
    const permissions = await this.permissionsService.calculateIssuePermissions(updatedIssue, currentUser);

    // Возвращаем задачу с правами доступа
    return {
      ...updatedIssue,
      permissions,
    } as IssueOutputDTO;
  }

  /**
   * Получение задач с фильтрацией
   */
  async getIssues(
    filter?: IssueFilterInputDTO,
    options?: PaginationInputDTO,
    currentUser?: MonoAccountDomainInterface
  ): Promise<PaginationResult<IssueOutputDTO>> {
    // Получаем результат с пагинацией из домена
    const result = await this.issueRepository.findAllPaginated(filter, options);

    // Рассчитываем права доступа для всех задач пакетно
    const permissionsMap = await this.permissionsService.calculateBatchIssuePermissions(result.items, currentUser);

    // Обогащаем задачи правами доступа
    const itemsWithPermissions = result.items.map((issue) => {
      const permissions = permissionsMap.get(issue.issue_hash);
      return {
        ...issue,
        permissions,
      } as IssueOutputDTO;
    });

    // Конвертируем результат в DTO
    return {
      items: itemsWithPermissions,
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };
  }

  /**
   * Получение задачи по ID
   */
  async getIssueById(data: GetIssueByIdInputDTO, currentUser?: MonoAccountDomainInterface): Promise<IssueOutputDTO | null> {
    const issueEntity = await this.issueRepository.findById(data.id);

    if (!issueEntity) {
      return null;
    }

    // Рассчитываем права доступа для задачи
    const permissions = await this.permissionsService.calculateIssuePermissions(issueEntity, currentUser);

    // Возвращаем задачу с правами доступа
    return {
      ...issueEntity,
      permissions,
    } as IssueOutputDTO;
  }

  /**
   * Получение задачи по хэшу
   */
  async getIssueByHash(issueHash: string, currentUser?: MonoAccountDomainInterface): Promise<IssueOutputDTO | null> {
    const issueEntity = await this.issueRepository.findByIssueHash(issueHash);

    if (!issueEntity) {
      return null;
    }

    // Рассчитываем права доступа для задачи
    const permissions = await this.permissionsService.calculateIssuePermissions(issueEntity, currentUser);

    // Возвращаем задачу с правами доступа
    return {
      ...issueEntity,
      permissions,
    } as IssueOutputDTO;
  }

  /**
   * Удаление задачи по хэшу
   */
  async deleteIssueByHash(issueHash: string): Promise<boolean> {
    const issueEntity = await this.issueRepository.findByIssueHash(issueHash);
    if (!issueEntity) {
      throw new Error(`Задача с хэшем ${issueHash} не найдена`);
    }
    await this.issueRepository.delete(issueEntity._id);
    return true;
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
      present: false,
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

  // ============ МЕТОДЫ ГЕНЕРАЦИИ ДОКУМЕНТОВ ============

  /**
   * Генерация заявления об инвестировании в генерацию
   */
  async generateGenerationMoneyInvestStatement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentDomainInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.GenerationMoneyInvestStatement.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }

  /**
   * Генерация заявления о возврате неиспользованных средств генерации
   */
  async generateGenerationMoneyReturnUnusedStatement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentDomainInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.GenerationMoneyReturnUnusedStatement.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }
}
