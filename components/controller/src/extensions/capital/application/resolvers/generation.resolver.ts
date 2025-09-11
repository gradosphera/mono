import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GenerationService } from '../services/generation.service';
import { CreateCommitInputDTO } from '../dto/generation/create-commit-input.dto';
import { RefreshSegmentInputDTO } from '../dto/generation/refresh-segment-input.dto';
import { CreateStoryInputDTO } from '../dto/generation/create-story-input.dto';
import { CreateIssueInputDTO } from '../dto/generation/create-issue-input.dto';
import { CreateCycleInputDTO } from '../dto/generation/create-cycle-input.dto';
import { StoryFilterInputDTO } from '../dto/generation/story-filter.input';
import { IssueFilterInputDTO } from '../dto/generation/issue-filter.input';
import { CommitFilterInputDTO } from '../dto/generation/commit-filter.input';
import { CycleFilterInputDTO } from '../dto/generation/cycle-filter.input';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { StoryOutputDTO } from '../dto/generation/story.dto';
import { IssueOutputDTO } from '../dto/generation/issue.dto';
import { CommitOutputDTO } from '../dto/generation/commit.dto';
import { CycleOutputDTO } from '../dto/generation/cycle.dto';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';

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
  @AuthRoles(['participant'])
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
  @AuthRoles(['participant'])
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
  @AuthRoles(['participant'])
  async createCapitalStory(
    @Args('data', { type: () => CreateStoryInputDTO }) data: CreateStoryInputDTO
  ): Promise<StoryOutputDTO> {
    const result = await this.generationService.createStory(data);
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
  @AuthRoles(['participant'])
  async createCapitalIssue(
    @Args('data', { type: () => CreateIssueInputDTO }) data: CreateIssueInputDTO
  ): Promise<IssueOutputDTO> {
    const result = await this.generationService.createIssue(data);
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
}
