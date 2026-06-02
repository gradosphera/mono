import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { ExpensesMutationsService } from '../services/expenses-mutations.service';
import { PayExpenseItemInputDTO } from '../dto/pay-expense-item.input';
import { ReportExpenseItemInputDTO } from '../dto/report-expense-item.input';
import { ReturnExpenseItemInputDTO } from '../dto/return-expense-item.input';
import { SubmitExpenseReportInputDTO } from '../dto/submit-expense-report.input';

/**
 * GraphQL Mutation-резолвер контракта `expense` (платёж / отчёт / возврат).
 *
 * Сервис пока бросает `NotImplementedException` (см. `ExpensesMutationsService`) —
 * подключение write-mutation pool отложено до Эпика 0 (cooptypes regen).
 * Резолвер регистрируется в схеме, чтобы UI и SDK сразу видели сигнатуру.
 */
@Resolver()
export class ExpenseMutationsResolver {
  constructor(private readonly expensesMutations: ExpensesMutationsService) {}

  @Mutation(() => TransactionDTO, {
    name: 'payExpenseItem',
    description: 'Оплатить строку расхода (выдача аванса ADVANCE или прямая оплата DIRECT).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async payExpenseItem(
    @Args('data', { type: () => PayExpenseItemInputDTO }) data: PayExpenseItemInputDTO
  ): Promise<TransactionDTO> {
    return this.expensesMutations.payExpenseItem(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'reportExpenseItem',
    description: 'Закрыть строку расхода чеком (ADVANCE-отчёт пайщика).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async reportExpenseItem(
    @Args('data', { type: () => ReportExpenseItemInputDTO }) data: ReportExpenseItemInputDTO
  ): Promise<TransactionDTO> {
    return this.expensesMutations.reportExpenseItem(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'returnExpenseItem',
    description: 'Вернуть неиспользованный аванс по строке расхода (ADVANCE-остаток).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async returnExpenseItem(
    @Args('data', { type: () => ReturnExpenseItemInputDTO }) data: ReturnExpenseItemInputDTO
  ): Promise<TransactionDTO> {
    return this.expensesMutations.returnExpenseItem(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'submitExpenseReport',
    description: 'Финализировать СЗ-отчёт по смете расхода (все items закрыты — оплата/чек/возврат).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async submitExpenseReport(
    @Args('data', { type: () => SubmitExpenseReportInputDTO }) data: SubmitExpenseReportInputDTO
  ): Promise<TransactionDTO> {
    return this.expensesMutations.submitExpenseReport(data);
  }
}
