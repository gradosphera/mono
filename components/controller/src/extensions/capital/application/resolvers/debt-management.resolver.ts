import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CapitalService } from '../services/capital.service';
import { CreateDebtInputDTO } from '../dto/debt_management/create-debt-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий управления долгами CAPITAL контракта
 */
@Resolver()
export class DebtManagementResolver {
  constructor(private readonly capitalService: CapitalService) {}

  /**
   * Мутация для получения ссуды в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'createCapitalDebt',
    description: 'Получение ссуды в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async createCapitalDebt(@Args('data', { type: () => CreateDebtInputDTO }) data: CreateDebtInputDTO): Promise<string> {
    const result = await this.capitalService.createDebt(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
