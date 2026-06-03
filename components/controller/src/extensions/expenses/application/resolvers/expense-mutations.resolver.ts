import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { ExpenseProposalStatementGenerateDocumentInputDTO } from '~/application/document/documents-dto/expense-proposal-statement-document.dto';
import { ExpenseProposalDecisionGenerateDocumentInputDTO } from '~/application/document/documents-dto/expense-proposal-decision-document.dto';
import { ExpensesMutationsService } from '../services/expenses-mutations.service';
import { CreateExpenseProposalInputDTO } from '../dto/create-expense-proposal.input';
import { PayExpenseItemInputDTO } from '../dto/pay-expense-item.input';
import { ReportExpenseItemInputDTO } from '../dto/report-expense-item.input';
import { ReturnExpenseItemInputDTO } from '../dto/return-expense-item.input';
import { OverspendExpenseItemInputDTO } from '../dto/overspend-expense-item.input';
import { SubmitExpenseReportInputDTO } from '../dto/submit-expense-report.input';
import { AuthorizeExpenseReportInputDTO } from '../dto/authorize-expense-report.input';
import { DeclineExpenseReportInputDTO } from '../dto/decline-expense-report.input';

/**
 * GraphQL Mutation-резолвер контракта `expense`.
 *
 * 8 actions полного lifecycle: createExpenseProposal / authorizeExpenseReport /
 * payExpenseItem / reportExpenseItem / returnExpenseItem / overspendExpenseItem /
 * submitExpenseReport / declineExpenseReport. Все маршрутизируются в
 * `ExpensesMutationsService`, который сабмитит через `ExpensesBlockchainPort`.
 */
@Resolver()
export class ExpenseMutationsResolver {
  constructor(private readonly expensesMutations: ExpensesMutationsService) {}

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateExpenseProposalStatementDocument',
    description: 'Сгенерировать документ СЗ-заявления (registry 2010) для последующей подписи.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async generateExpenseProposalStatementDocument(
    @Args('data', { type: () => ExpenseProposalStatementGenerateDocumentInputDTO })
    data: ExpenseProposalStatementGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO,
  ): Promise<GeneratedDocumentDTO> {
    return this.expensesMutations.generateExpenseProposalStatementDocument(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateExpenseProposalDecisionDocument',
    description: 'Сгенерировать документ-решение по СЗ (registry 2011) для последующей подписи.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async generateExpenseProposalDecisionDocument(
    @Args('data', { type: () => ExpenseProposalDecisionGenerateDocumentInputDTO })
    data: ExpenseProposalDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO,
  ): Promise<GeneratedDocumentDTO> {
    return this.expensesMutations.generateExpenseProposalDecisionDocument(data, options);
  }

  @Mutation(() => TransactionDTO, {
    name: 'createExpenseProposal',
    description: 'Подать СЗ-расход (создать смету с подписью пайщика/председателя).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async createExpenseProposal(
    @Args('data', { type: () => CreateExpenseProposalInputDTO }) data: CreateExpenseProposalInputDTO
  ): Promise<TransactionDTO> {
    return this.expensesMutations.createExpenseProposal(data);
  }

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
    name: 'overspendExpenseItem',
    description: 'Доплатить сумму перерасхода по строке расхода (ADVANCE-механика).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async overspendExpenseItem(
    @Args('data', { type: () => OverspendExpenseItemInputDTO }) data: OverspendExpenseItemInputDTO
  ): Promise<TransactionDTO> {
    return this.expensesMutations.overspendExpenseItem(data);
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

  @Mutation(() => TransactionDTO, {
    name: 'authorizeExpenseReport',
    description: 'Утвердить СЗ-отчёт (закрытие сметы). Триггерит капитализацию РИД в Благоросте.',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async authorizeExpenseReport(
    @Args('data', { type: () => AuthorizeExpenseReportInputDTO }) data: AuthorizeExpenseReportInputDTO
  ): Promise<TransactionDTO> {
    return this.expensesMutations.authorizeExpenseReport(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'declineExpenseReport',
    description: 'Отклонить СЗ-отчёт с указанием причины. Смета переходит в DECLINED.',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async declineExpenseReport(
    @Args('data', { type: () => DeclineExpenseReportInputDTO }) data: DeclineExpenseReportInputDTO
  ): Promise<TransactionDTO> {
    return this.expensesMutations.declineExpenseReport(data);
  }
}
