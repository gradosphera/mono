import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ExpensesManagementService } from '../services/expenses-management.service';
import { CreateExpenseInputDTO } from '../dto/expenses_management';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий управления расходами CAPITAL контракта
 */
@Resolver()
export class ExpensesManagementResolver {
  constructor(private readonly expensesManagementService: ExpensesManagementService) {}

  /**
   * Мутация для создания расхода в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalCreateExpense',
    description: 'Создание расхода в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async createCapitalExpense(
    @Args('data', { type: () => CreateExpenseInputDTO }) data: CreateExpenseInputDTO
  ): Promise<string> {
    const result = await this.expensesManagementService.createExpense(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
