import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ExpensesManagementService } from '../services/expenses-management.service';
import { CreateExpenseInputDTO } from '../dto/expenses_management/create-expense-input.dto';
import { ExpenseFilterInputDTO } from '../dto/expenses_management/expense-filter.input';
import { GetExpenseInputDTO } from '../dto/expenses_management/get-expense-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { ExpenseOutputDTO } from '../dto/expenses_management/expense.dto';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';

// Пагинированные результаты
const paginatedExpensesResult = createPaginationResult(ExpenseOutputDTO, 'PaginatedCapitalExpenses');

/**
 * GraphQL резолвер для действий управления расходами CAPITAL контракта
 */
@Resolver()
export class ExpensesManagementResolver {
  constructor(private readonly expensesManagementService: ExpensesManagementService) {}

  /**
   * Мутация для создания расхода в CAPITAL контракте
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalCreateExpense',
    description: 'Создание расхода в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async createCapitalExpense(
    @Args('data', { type: () => CreateExpenseInputDTO }) data: CreateExpenseInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.expensesManagementService.createExpense(data);
    return result;
  }

  // ============ ЗАПРОСЫ РАСХОДОВ ============

  /**
   * Получение всех расходов с фильтрацией
   */
  @Query(() => paginatedExpensesResult, {
    name: 'capitalExpenses',
    description: 'Получение списка расходов кооператива с фильтрацией',
  })
  async getExpenses(
    @Args('filter', { nullable: true }) filter?: ExpenseFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<ExpenseOutputDTO>> {
    return await this.expensesManagementService.getExpenses(filter, options);
  }

  /**
   * Получение расхода по ID
   */
  @Query(() => ExpenseOutputDTO, {
    name: 'capitalExpense',
    description: 'Получение расхода по внутреннему ID базы данных',
    nullable: true,
  })
  async getExpense(@Args('data') data: GetExpenseInputDTO): Promise<ExpenseOutputDTO | null> {
    return await this.expensesManagementService.getExpenseById(data);
  }
}
