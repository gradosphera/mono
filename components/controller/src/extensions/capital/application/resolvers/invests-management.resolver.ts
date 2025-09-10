import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CapitalService } from '../services/capital.service';
import { CreateProjectInvestInputDTO } from '../dto/invests_management/create-project-invest-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий управления инвестициями CAPITAL контракта
 */
@Resolver()
export class InvestsManagementResolver {
  constructor(private readonly capitalService: CapitalService) {}

  /**
   * Мутация для инвестирования в проект CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'createCapitalProjectInvest',
    description: 'Инвестирование в проект CAPITAL контракта',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async createCapitalProjectInvest(
    @Args('data', { type: () => CreateProjectInvestInputDTO }) data: CreateProjectInvestInputDTO
  ): Promise<string> {
    const result = await this.capitalService.createProjectInvest(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
