import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { ExpenseProposalDomainEntity } from '../entities/expense-proposal.entity';

/**
 * Репозиторий зеркала СЗ-расходов. Чтение строго из Postgres
 * (ADR-011 — read-path); chain RPC только для reconciliation / forensic.
 */
export interface ExpenseProposalRepository extends IBlockchainSyncRepository<ExpenseProposalDomainEntity> {
  findByProposalHash(proposalHash: string): Promise<ExpenseProposalDomainEntity | null>;
  findByCoopname(coopname: string): Promise<ExpenseProposalDomainEntity[]>;
  findByUsername(coopname: string, username: string): Promise<ExpenseProposalDomainEntity[]>;
}

export const EXPENSE_PROPOSAL_REPOSITORY = Symbol('ExpenseProposalRepository');
