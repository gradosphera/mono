import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CapitalService } from '../services/capital.service';
import {
  SetMasterInputDTO,
  AddAuthorInputDTO,
  SetPlanInputDTO,
  StartProjectInputDTO,
  OpenProjectInputDTO,
  DeleteProjectInputDTO,
} from '../dto/project_management';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий управления проектами CAPITAL контракта
 */
@Resolver()
export class ProjectManagementResolver {
  constructor(private readonly capitalService: CapitalService) {}

  /**
   * Мутация для установки мастера проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'setCapitalMaster',
    description: 'Установка мастера проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async setCapitalMaster(@Args('data', { type: () => SetMasterInputDTO }) data: SetMasterInputDTO): Promise<string> {
    const result = await this.capitalService.setMaster(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для добавления автора проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'addCapitalAuthor',
    description: 'Добавление автора проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async addCapitalAuthor(@Args('data', { type: () => AddAuthorInputDTO }) data: AddAuthorInputDTO): Promise<string> {
    const result = await this.capitalService.addAuthor(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для установки плана проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'setCapitalPlan',
    description: 'Установка плана проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async setCapitalPlan(@Args('data', { type: () => SetPlanInputDTO }) data: SetPlanInputDTO): Promise<string> {
    const result = await this.capitalService.setPlan(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для запуска проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'startCapitalProject',
    description: 'Запуск проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async startCapitalProject(
    @Args('data', { type: () => StartProjectInputDTO }) data: StartProjectInputDTO
  ): Promise<string> {
    const result = await this.capitalService.startProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для открытия проекта для инвестиций CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'openCapitalProject',
    description: 'Открытие проекта для инвестиций в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async openCapitalProject(@Args('data', { type: () => OpenProjectInputDTO }) data: OpenProjectInputDTO): Promise<string> {
    const result = await this.capitalService.openProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для удаления проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'deleteCapitalProject',
    description: 'Удаление проекта в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async deleteCapitalProject(
    @Args('data', { type: () => DeleteProjectInputDTO }) data: DeleteProjectInputDTO
  ): Promise<string> {
    const result = await this.capitalService.deleteProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
