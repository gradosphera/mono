import { Inject, Injectable } from '@nestjs/common';
import {
  ExpenseProposalRepository,
  EXPENSE_PROPOSAL_REPOSITORY,
} from '../../domain/repositories/expense-proposal.repository';
import { ExpenseProposalDomainEntity } from '../../domain/entities/expense-proposal.entity';
import {
  PaginationInputDTO,
  PaginationResult,
} from '~/application/common/dto/pagination.dto';

/**
 * Read-сервис расходов: список и просмотр смет.
 *
 * Mutation-операции (`payexp`/`reportexp`/`returnexp`) — отдельные use-case-сервисы;
 * этот сервис только читает зеркало из PG (никаких RPC-fallback'ов, см. ADR-011).
 */
@Injectable()
export class ExpensesManagementService {
  constructor(
    @Inject(EXPENSE_PROPOSAL_REPOSITORY)
    private readonly proposals: ExpenseProposalRepository
  ) {}

  async getProposalByHash(proposalHash: string): Promise<ExpenseProposalDomainEntity | null> {
    return this.proposals.findByProposalHash(proposalHash);
  }

  async listProposalsByCooperative(coopname: string): Promise<ExpenseProposalDomainEntity[]> {
    return this.proposals.findByCoopname(coopname);
  }

  async listProposalsByMember(coopname: string, username: string): Promise<ExpenseProposalDomainEntity[]> {
    return this.proposals.findByUsername(coopname, username);
  }

  async listProposalsByCooperativePaginated(
    coopname: string,
    options?: PaginationInputDTO
  ): Promise<PaginationResult<ExpenseProposalDomainEntity>> {
    const { items, totalCount } = await this.proposals.findByCoopnamePaginated(coopname, options);
    return this.toPaginationResult(items, totalCount, options);
  }

  async listProposalsByMemberPaginated(
    coopname: string,
    username: string,
    options?: PaginationInputDTO
  ): Promise<PaginationResult<ExpenseProposalDomainEntity>> {
    const { items, totalCount } = await this.proposals.findByUsernamePaginated(coopname, username, options);
    return this.toPaginationResult(items, totalCount, options);
  }

  private toPaginationResult<T>(
    items: T[],
    totalCount: number,
    options?: PaginationInputDTO
  ): PaginationResult<T> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, options?.limit ?? 10);
    return {
      items,
      totalCount,
      totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 0,
      currentPage: page,
    };
  }
}
