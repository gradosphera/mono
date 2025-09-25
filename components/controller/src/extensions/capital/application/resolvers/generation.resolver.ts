import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GenerationService } from '../services/generation.service';
import { CreateCommitInputDTO } from '../dto/generation/create-commit-input.dto';
import { RefreshSegmentInputDTO } from '../dto/generation/refresh-segment-input.dto';
import { CreateStoryInputDTO } from '../dto/generation/create-story-input.dto';
import { CreateIssueInputDTO } from '../dto/generation/create-issue-input.dto';
import { CreateCycleInputDTO } from '../dto/generation/create-cycle-input.dto';
import { UpdateStoryInputDTO } from '../dto/generation/update-story-input.dto';
import { UpdateIssueInputDTO } from '../dto/generation/update-issue-input.dto';
import { StoryFilterInputDTO } from '../dto/generation/story-filter.input';
import { IssueFilterInputDTO } from '../dto/generation/issue-filter.input';
import { CommitFilterInputDTO } from '../dto/generation/commit-filter.input';
import { CycleFilterInputDTO } from '../dto/generation/cycle-filter.input';
import { GetIssueByHashInputDTO } from '../dto/generation/get-issue-by-hash.input';
import { GetCommitByHashInputDTO } from '../dto/generation/get-commit-by-hash.input';
import { GetStoryByHashInputDTO } from '../dto/generation/get-story-by-hash.input';
import { DeleteStoryByHashInputDTO } from '../dto/generation/delete-story-by-hash.input';
import { DeleteIssueByHashInputDTO } from '../dto/generation/delete-issue-by-hash.input';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { StoryOutputDTO } from '../dto/generation/story.dto';
import { IssueOutputDTO } from '../dto/generation/issue.dto';
import { CommitOutputDTO } from '../dto/generation/commit.dto';
import { CycleOutputDTO } from '../dto/generation/cycle.dto';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';

// Пагинированные результаты
const paginatedStoriesResult = createPaginationResult(StoryOutputDTO, 'PaginatedCapitalStories');
const paginatedIssuesResult = createPaginationResult(IssueOutputDTO, 'PaginatedCapitalIssues');
const paginatedCommitsResult = createPaginationResult(CommitOutputDTO, 'PaginatedCapitalCommits');
const paginatedCyclesResult = createPaginationResult(CycleOutputDTO, 'PaginatedCapitalCycles');

/**
 * GraphQL резолвер для действий генерации CAPITAL контракта
 */
@Resolver()
export class GenerationResolver {
  constructor(private readonly generationService: GenerationService) {}

  /**
   * Мутация для создания коммита в CAPITAL контракте
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalCreateCommit',
    description: 'Создание коммита в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async createCapitalCommit(
    @Args('data', { type: () => CreateCommitInputDTO }) data: CreateCommitInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.generationService.createCommit(data);
    return result;
  }

  /**
   * Мутация для обновления сегмента в CAPITAL контракте
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalRefreshSegment',
    description: 'Обновление сегмента в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async refreshCapitalSegment(
    @Args('data', { type: () => RefreshSegmentInputDTO }) data: RefreshSegmentInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.generationService.refreshSegment(data);
    return result;
  }

  // ============ STORY MUTATIONS ============

  /**
   * Мутация для создания истории
   */
  @Mutation(() => StoryOutputDTO, {
    name: 'capitalCreateStory',
    description: 'Создание истории в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async createCapitalStory(
    @Args('data', { type: () => CreateStoryInputDTO }) data: CreateStoryInputDTO
  ): Promise<StoryOutputDTO> {
    const result = await this.generationService.createStory(data);
    return result;
  }

  /**
   * Мутация для обновления истории
   */
  @Mutation(() => StoryOutputDTO, {
    name: 'capitalUpdateStory',
    description: 'Обновление истории в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async updateCapitalStory(
    @Args('data', { type: () => UpdateStoryInputDTO }) data: UpdateStoryInputDTO
  ): Promise<StoryOutputDTO> {
    const result = await this.generationService.updateStory(data);
    return result;
  }

  // ============ ISSUE MUTATIONS ============

  /**
   * Мутация для создания задачи
   */
  @Mutation(() => IssueOutputDTO, {
    name: 'capitalCreateIssue',
    description: 'Создание задачи в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async createCapitalIssue(
    @Args('data', { type: () => CreateIssueInputDTO }) data: CreateIssueInputDTO
  ): Promise<IssueOutputDTO> {
    const result = await this.generationService.createIssue(data);
    return result;
  }

  /**
   * Мутация для обновления задачи
   */
  @Mutation(() => IssueOutputDTO, {
    name: 'capitalUpdateIssue',
    description: 'Обновление задачи в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async updateCapitalIssue(
    @Args('data', { type: () => UpdateIssueInputDTO }) data: UpdateIssueInputDTO
  ): Promise<IssueOutputDTO> {
    const result = await this.generationService.updateIssue(data);
    return result;
  }

  // ============ CYCLE MUTATIONS ============

  /**
   * Мутация для создания цикла
   */
  @Mutation(() => CycleOutputDTO, {
    name: 'capitalCreateCycle',
    description: 'Создание цикла в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async createCapitalCycle(
    @Args('data', { type: () => CreateCycleInputDTO }) data: CreateCycleInputDTO
  ): Promise<CycleOutputDTO> {
    const result = await this.generationService.createCycle(data);
    return result;
  }

  // ============ STORY QUERIES ============

  /**
   * Получение историй с фильтрацией
   */
  @Query(() => paginatedStoriesResult, {
    name: 'capitalStories',
    description: 'Получение списка историй кооператива с фильтрацией',
  })
  async getCapitalStories(
    @Args('filter', { nullable: true }) filter?: StoryFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<StoryOutputDTO>> {
    return await this.generationService.getStories(filter, options);
  }

  // ============ ISSUE QUERIES ============

  /**
   * Получение задач с фильтрацией
   */
  @Query(() => paginatedIssuesResult, {
    name: 'capitalIssues',
    description: 'Получение списка задач кооператива с фильтрацией',
  })
  async getCapitalIssues(
    @Args('filter', { nullable: true }) filter?: IssueFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<IssueOutputDTO>> {
    return await this.generationService.getIssues(filter, options);
  }

  // ============ COMMIT QUERIES ============

  /**
   * Получение коммитов с фильтрацией
   */
  @Query(() => paginatedCommitsResult, {
    name: 'capitalCommits',
    description: 'Получение списка коммитов кооператива с фильтрацией',
  })
  async getCapitalCommits(
    @Args('filter', { nullable: true }) filter?: CommitFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<CommitOutputDTO>> {
    return await this.generationService.getCommits(filter, options);
  }

  // ============ CYCLE QUERIES ============

  /**
   * Получение циклов с фильтрацией
   */
  @Query(() => paginatedCyclesResult, {
    name: 'capitalCycles',
    description: 'Получение списка циклов кооператива с фильтрацией',
  })
  async getCapitalCycles(
    @Args('filter', { nullable: true }) filter?: CycleFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<CycleOutputDTO>> {
    return await this.generationService.getCycles(filter, options);
  }

  // ============ GET BY HASH QUERIES ============

  /**
   * Получение истории по хэшу
   */
  @Query(() => StoryOutputDTO, {
    name: 'capitalStory',
    description: 'Получение истории по хэшу',
    nullable: true,
  })
  async getCapitalStory(@Args('data') data: GetStoryByHashInputDTO): Promise<StoryOutputDTO | null> {
    return await this.generationService.getStoryByHash(data.story_hash);
  }

  /**
   * Получение задачи по хэшу
   */
  @Query(() => IssueOutputDTO, {
    name: 'capitalIssue',
    description: 'Получение задачи по хэшу',
    nullable: true,
  })
  async getCapitalIssue(@Args('data') data: GetIssueByHashInputDTO): Promise<IssueOutputDTO | null> {
    return await this.generationService.getIssueByHash(data.issue_hash);
  }

  /**
   * Получение коммита по хэшу
   */
  @Query(() => CommitOutputDTO, {
    name: 'capitalCommit',
    description: 'Получение коммита по хэшу',
    nullable: true,
  })
  async getCapitalCommit(@Args('data') data: GetCommitByHashInputDTO): Promise<CommitOutputDTO | null> {
    return await this.generationService.getCommitByHash(data.commit_hash);
  }

  // ============ DELETE MUTATIONS ============

  /**
   * Мутация для удаления истории по хэшу
   */
  @Mutation(() => Boolean, {
    name: 'capitalDeleteStory',
    description: 'Удаление истории по хэшу',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async deleteCapitalStory(
    @Args('data', { type: () => DeleteStoryByHashInputDTO }) data: DeleteStoryByHashInputDTO
  ): Promise<boolean> {
    return await this.generationService.deleteStoryByHash(data.story_hash);
  }

  /**
   * Мутация для удаления задачи по хэшу
   */
  @Mutation(() => Boolean, {
    name: 'capitalDeleteIssue',
    description: 'Удаление задачи по хэшу',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async deleteCapitalIssue(
    @Args('data', { type: () => DeleteIssueByHashInputDTO }) data: DeleteIssueByHashInputDTO
  ): Promise<boolean> {
    return await this.generationService.deleteIssueByHash(data.issue_hash);
  }

  // ============ ГЕНЕРАЦИЯ ДОКУМЕНТОВ ============

  /**
   * Мутация для генерации заявления об инвестировании в генерацию
   */
  @Mutation(() => GeneratedDocumentDTO, {
    name: 'capitalGenerateGenerationMoneyInvestStatement',
    description: 'Сгенерировать заявление об инвестировании в генерацию',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateGenerationMoneyInvestStatement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.generationService.generateGenerationMoneyInvestStatement(data, options);
  }

  /**
   * Мутация для генерации заявления о возврате неиспользованных средств генерации
   */
  @Mutation(() => GeneratedDocumentDTO, {
    name: 'capitalGenerateGenerationMoneyReturnUnusedStatement',
    description: 'Сгенерировать заявление о возврате неиспользованных средств генерации',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateGenerationMoneyReturnUnusedStatement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.generationService.generateGenerationMoneyReturnUnusedStatement(data, options);
  }
}
