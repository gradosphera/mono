import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ProjectManagementService } from '../services/project-management.service';
import { SetMasterInputDTO } from '../dto/project_management/set-master-input.dto';
import { AddAuthorInputDTO } from '../dto/project_management/add-author-input.dto';
import { SetPlanInputDTO } from '../dto/project_management/set-plan-input.dto';
import { StartProjectInputDTO } from '../dto/project_management/start-project-input.dto';
import { OpenProjectInputDTO } from '../dto/project_management/open-project-input.dto';
import { DeleteProjectInputDTO } from '../dto/project_management/delete-project-input.dto';
import { CreateProjectInputDTO } from '../dto/project_management/create-project-input.dto';
import { GetProjectInputDTO } from '../dto/project_management/get-project-input.dto';
import { GetProjectWithRelationsInputDTO } from '../dto/project_management/get-project-with-relations-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
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
  @Mutation(() => TransactionDTO, {
    name: 'capitalCreateProject',
    description: 'Создание проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async createCapitalProject(
    @Args('data', { type: () => CreateProjectInputDTO }) data: CreateProjectInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.projectManagementService.createProject(data);
    return result;
  }
  /**
   * Мутация для установки мастера проекта CAPITAL контракта
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalSetMaster',
    description: 'Установка мастера проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async setCapitalMaster(@Args('data', { type: () => SetMasterInputDTO }) data: SetMasterInputDTO): Promise<TransactionDTO> {
    const result = await this.projectManagementService.setMaster(data);
    return result;
  }

  /**
   * Мутация для добавления автора проекта CAPITAL контракта
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalAddAuthor',
    description: 'Добавление автора проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async addCapitalAuthor(@Args('data', { type: () => AddAuthorInputDTO }) data: AddAuthorInputDTO): Promise<TransactionDTO> {
    const result = await this.projectManagementService.addAuthor(data);
    return result;
  }

  /**
   * Мутация для установки плана проекта CAPITAL контракта
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalSetPlan',
    description: 'Установка плана проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async setCapitalPlan(@Args('data', { type: () => SetPlanInputDTO }) data: SetPlanInputDTO): Promise<TransactionDTO> {
    const result = await this.projectManagementService.setPlan(data);
    return result;
  }

  /**
   * Мутация для запуска проекта CAPITAL контракта
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalStartProject',
    description: 'Запуск проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async startCapitalProject(
    @Args('data', { type: () => StartProjectInputDTO }) data: StartProjectInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.projectManagementService.startProject(data);
    return result;
  }

  /**
   * Мутация для открытия проекта для инвестиций CAPITAL контракта
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalOpenProject',
    description: 'Открытие проекта для инвестиций в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async openCapitalProject(
    @Args('data', { type: () => OpenProjectInputDTO }) data: OpenProjectInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.projectManagementService.openProject(data);
    return result;
  }

  /**
   * Мутация для удаления проекта CAPITAL контракта
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalDeleteProject',
    description: 'Удаление проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async deleteCapitalProject(
    @Args('data', { type: () => DeleteProjectInputDTO }) data: DeleteProjectInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.projectManagementService.deleteProject(data);
    return result;
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
  async getProject(@Args('data') data: GetProjectInputDTO): Promise<ProjectOutputDTO | null> {
    return await this.projectManagementService.getProjectById(data._id);
  }

  /**
   * Получение проекта с отношениями
   */
  @Query(() => ProjectOutputDTO, {
    name: 'capitalProjectWithRelations',
    description: 'Получение проекта с полными отношениями по хешу проекта',
    nullable: true,
  })
  async getProjectWithRelations(@Args('data') data: GetProjectWithRelationsInputDTO): Promise<ProjectOutputDTO | null> {
    return await this.projectManagementService.getProjectWithRelations(data.projectHash);
  }
}
