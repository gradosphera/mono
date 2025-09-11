import { Injectable } from '@nestjs/common';
import { ExpensesManagementInteractor } from '../use-cases/expenses-management.interactor';
import type { CreateExpenseInputDTO } from '../dto/expenses_management';
import type { TransactResult } from '@wharfkit/session';

/**
 * Сервис уровня приложения для управления расходами CAPITAL
 * Обрабатывает запросы от ExpensesManagementResolver
 */
@Injectable()
export class ExpensesManagementService {
  constructor(private readonly expensesManagementInteractor: ExpensesManagementInteractor) {}

  /**
   * Создание расхода в CAPITAL контракте
   */
  async createExpense(data: CreateExpenseInputDTO): Promise<TransactResult> {
    return await this.expensesManagementInteractor.createExpense(data);
  }
}
