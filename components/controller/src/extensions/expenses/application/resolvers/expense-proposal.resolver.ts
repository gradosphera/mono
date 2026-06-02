import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { ExpensesManagementService } from '../services/expenses-management.service';
import { ExpenseProposalOutputDTO } from '../dto/expense-proposal.output';

/**
 * GraphQL-резолвер чтения смет расходов (контракт `expense`).
 *
 * Read-only: read-path тянется из PG-зеркала (см. ADR-011 в controller/CLAUDE.md).
 * Mutation-резолвер (payexp/reportexp/returnexp/upload) — отдельный файл, следующий шаг.
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

  @Query(() => [ExpenseProposalOutputDTO], {
    name: 'expenseProposalsByCooperative',
    description: 'Список смет расходов кооператива (без пагинации, MVP).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async listByCooperative(
    @Args('coopname', { type: () => String }) coopname: string
  ): Promise<ExpenseProposalOutputDTO[]> {
    const entities = await this.expenses.listProposalsByCooperative(coopname);
    return entities.map((e) => ExpenseProposalOutputDTO.fromDomain(e));
  }

  @Query(() => [ExpenseProposalOutputDTO], {
    name: 'expenseProposalsByMember',
    description: 'Список смет расходов пайщика (свои/созданные им).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async listByMember(
    @Args('coopname', { type: () => String }) coopname: string,
    @Args('username', { type: () => String }) username: string
  ): Promise<ExpenseProposalOutputDTO[]> {
    const entities = await this.expenses.listProposalsByMember(coopname, username);
    return entities.map((e) => ExpenseProposalOutputDTO.fromDomain(e));
  }
}
