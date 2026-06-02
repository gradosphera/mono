import { Inject, Injectable } from '@nestjs/common';
import {
  ExpenseProposalRepository,
  EXPENSE_PROPOSAL_REPOSITORY,
} from '../../domain/repositories/expense-proposal.repository';
import { ExpenseProposalDomainEntity } from '../../domain/entities/expense-proposal.entity';

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
}
