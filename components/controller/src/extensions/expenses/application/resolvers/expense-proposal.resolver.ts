import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import {
  createPaginationResult,
  PaginationInputDTO,
  PaginationResult,
} from '~/application/common/dto/pagination.dto';
import { ExpensesManagementService } from '../services/expenses-management.service';
import { ExpenseProposalOutputDTO } from '../dto/expense-proposal.output';

const paginatedExpenseProposalsResult = createPaginationResult(
  ExpenseProposalOutputDTO,
  'PaginatedExpenseProposals'
);

/**
 * GraphQL-резолвер чтения смет расходов (контракт `expense`).
 *
 * Read-only: read-path тянется из PG-зеркала (см. ADR-011 в controller/CLAUDE.md).
 * Mutation-резолвер (payexp/reportexp/returnexp/submitReport) — `ExpenseMutationsResolver`.
 *
 * Пагинация — единый паттерн controller'а (см. controller/CLAUDE.md «Пагинация — единый паттерн»):
 * input `PaginationInputDTO`, выход `PaginationResult<T>` через `createPaginationResult`.
 */
@Resolver(() => ExpenseProposalOutputDTO)
export class ExpenseProposalResolver {
  constructor(private readonly expenses: ExpensesManagementService) {}

  @Query(() => ExpenseProposalOutputDTO, {
    name: 'expenseProposal',
    description: 'Получить смету расхода по хешу.',
    nullable: true,
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async getExpenseProposal(
    @Args('proposal_hash', { type: () => String }) proposalHash: string
  ): Promise<ExpenseProposalOutputDTO | null> {
    const entity = await this.expenses.getProposalByHash(proposalHash);
    return entity ? ExpenseProposalOutputDTO.fromDomain(entity) : null;
  }

  @Query(() => paginatedExpenseProposalsResult, {
    name: 'expenseProposalsByCooperative',
    description: 'Список смет расходов кооператива (paginated).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async listByCooperative(
    @Args('coopname', { type: () => String }) coopname: string,
    @Args('options', { type: () => PaginationInputDTO, nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<ExpenseProposalOutputDTO>> {
    const result = await this.expenses.listProposalsByCooperativePaginated(coopname, options);
    return {
      ...result,
      items: result.items.map((e) => ExpenseProposalOutputDTO.fromDomain(e)),
    };
  }

  @Query(() => paginatedExpenseProposalsResult, {
    name: 'expenseProposalsByMember',
    description: 'Список смет расходов пайщика (свои/созданные им, paginated).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async listByMember(
    @Args('coopname', { type: () => String }) coopname: string,
    @Args('username', { type: () => String }) username: string,
    @Args('options', { type: () => PaginationInputDTO, nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<ExpenseProposalOutputDTO>> {
    const result = await this.expenses.listProposalsByMemberPaginated(coopname, username, options);
    return {
      ...result,
      items: result.items.map((e) => ExpenseProposalOutputDTO.fromDomain(e)),
    };
  }
}
