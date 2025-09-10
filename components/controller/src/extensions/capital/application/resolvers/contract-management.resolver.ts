import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CapitalService } from '../services/capital.service';
import { SetConfigInputDTO } from '../dto/contract_management';
import { CreateProjectInputDTO } from '../dto/project_management';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий управления контрактом CAPITAL
 */
@Resolver()
export class ContractManagementResolver {
  constructor(private readonly capitalService: CapitalService) {}

  /**
   * Мутация для установки конфигурации CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalSetConfig',
    description: 'Установка конфигурации CAPITAL контракта',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async setCapitalConfig(@Args('data', { type: () => SetConfigInputDTO }) data: SetConfigInputDTO): Promise<string> {
    const result = await this.capitalService.setConfig(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

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
    const result = await this.capitalService.createProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
