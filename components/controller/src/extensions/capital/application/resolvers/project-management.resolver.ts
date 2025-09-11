import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ProjectManagementService } from '../services/project-management.service';
import {
  SetMasterInputDTO,
  AddAuthorInputDTO,
  SetPlanInputDTO,
  StartProjectInputDTO,
  OpenProjectInputDTO,
  DeleteProjectInputDTO,
  CreateProjectInputDTO,
} from '../dto/project_management';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { ProjectOutputDTO } from '../dto/project_management/project.dto';
import { ProjectFilterInputDTO } from '../dto/property_management/project-filter.input';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';

// Пагинированные результаты
const paginatedProjectsResult = createPaginationResult(ProjectOutputDTO, 'PaginatedCapitalProjects');

/**
 * GraphQL резолвер для действий управления проектами CAPITAL контракта
 */
@Resolver()
export class ProjectManagementResolver {
  constructor(private readonly projectManagementService: ProjectManagementService) {}
  /**
   * Мутация для создания проекта в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalCreateProject',
    description: 'Создание проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async createCapitalProject(
    @Args('data', { type: () => CreateProjectInputDTO }) data: CreateProjectInputDTO
  ): Promise<string> {
    const result = await this.projectManagementService.createProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
  /**
   * Мутация для установки мастера проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalSetMaster',
    description: 'Установка мастера проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async setCapitalMaster(@Args('data', { type: () => SetMasterInputDTO }) data: SetMasterInputDTO): Promise<string> {
    const result = await this.projectManagementService.setMaster(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для добавления автора проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalAddAuthor',
    description: 'Добавление автора проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async addCapitalAuthor(@Args('data', { type: () => AddAuthorInputDTO }) data: AddAuthorInputDTO): Promise<string> {
    const result = await this.projectManagementService.addAuthor(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для установки плана проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalSetPlan',
    description: 'Установка плана проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async setCapitalPlan(@Args('data', { type: () => SetPlanInputDTO }) data: SetPlanInputDTO): Promise<string> {
    const result = await this.projectManagementService.setPlan(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для запуска проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalStartProject',
    description: 'Запуск проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async startCapitalProject(
    @Args('data', { type: () => StartProjectInputDTO }) data: StartProjectInputDTO
  ): Promise<string> {
    const result = await this.projectManagementService.startProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для открытия проекта для инвестиций CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalOpenProject',
    description: 'Открытие проекта для инвестиций в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async openCapitalProject(@Args('data', { type: () => OpenProjectInputDTO }) data: OpenProjectInputDTO): Promise<string> {
    const result = await this.projectManagementService.openProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для удаления проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalDeleteProject',
    description: 'Удаление проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async deleteCapitalProject(
    @Args('data', { type: () => DeleteProjectInputDTO }) data: DeleteProjectInputDTO
  ): Promise<string> {
    const result = await this.projectManagementService.deleteProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  // ============ ЗАПРОСЫ ПРОЕКТОВ ============

  /**
   * Получение всех проектов с фильтрацией
   */
  @Query(() => paginatedProjectsResult, {
    name: 'capitalProjects',
    description: 'Получение списка проектов кооператива с фильтрацией',
  })
  async getProjects(
    @Args('filter', { nullable: true }) filter?: ProjectFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<ProjectOutputDTO>> {
    return await this.projectManagementService.getProjects(filter, options);
  }

  /**
   * Получение проекта по ID
   */
  @Query(() => ProjectOutputDTO, {
    name: 'capitalProject',
    description: 'Получение проекта по внутреннему ID базы данных',
    nullable: true,
  })
  async getProject(@Args('_id') _id: string): Promise<ProjectOutputDTO | null> {
    return await this.projectManagementService.getProjectById(_id);
  }

  /**
   * Получение проекта с отношениями
   */
  @Query(() => ProjectOutputDTO, {
    name: 'capitalProjectWithRelations',
    description: 'Получение проекта с полными отношениями по хешу проекта',
    nullable: true,
  })
  async getProjectWithRelations(@Args('projectHash') projectHash: string): Promise<ProjectOutputDTO | null> {
    return await this.projectManagementService.getProjectWithRelations(projectHash);
  }
}
