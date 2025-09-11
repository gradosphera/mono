import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { DistributionManagementService } from '../services/distribution-management.service';
import { FundProgramInputDTO } from '../dto/distribution_management/fund-program-input.dto';
import { FundProjectInputDTO } from '../dto/distribution_management/fund-project-input.dto';
import { RefreshProgramInputDTO } from '../dto/distribution_management/refresh-program-input.dto';
import { RefreshProjectInputDTO } from '../dto/distribution_management/refresh-project-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий распределения средств CAPITAL контракта
 */
@Resolver()
export class DistributionManagementResolver {
  constructor(private readonly distributionManagementService: DistributionManagementService) {}

  /**
   * Мутация для финансирования программы CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalFundProgram',
    description: 'Финансирование программы CAPITAL контракта',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async fundCapitalProgram(@Args('data', { type: () => FundProgramInputDTO }) data: FundProgramInputDTO): Promise<string> {
    const result = await this.distributionManagementService.fundProgram(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для финансирования проекта CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalFundProject',
    description: 'Финансирование проекта CAPITAL контракта',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async fundCapitalProject(@Args('data', { type: () => FundProjectInputDTO }) data: FundProjectInputDTO): Promise<string> {
    const result = await this.distributionManagementService.fundProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для обновления CRPS пайщика в программе CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalRefreshProgram',
    description: 'Обновление CRPS пайщика в программе CAPITAL контракта',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async refreshCapitalProgram(
    @Args('data', { type: () => RefreshProgramInputDTO }) data: RefreshProgramInputDTO
  ): Promise<string> {
    const result = await this.distributionManagementService.refreshProgram(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для обновления CRPS пайщика в проекте CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalRefreshProject',
    description: 'Обновление CRPS пайщика в проекте CAPITAL контракта',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async refreshCapitalProject(
    @Args('data', { type: () => RefreshProjectInputDTO }) data: RefreshProjectInputDTO
  ): Promise<string> {
    const result = await this.distributionManagementService.refreshProject(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
