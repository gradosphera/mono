import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type {
  InterExpenseChassisPort,
  InterExpenseItem,
  InterExpensePagination,
  InterExpensePaginatedResult,
  InterExpenseProposalRead,
  InterExpenseProposalStatus,
} from '@coopenomics/inter';
import { ExpenseProposalTypeormEntity } from '../entities/expense-proposal.typeorm-entity';
import { ExpenseProposalStatus } from '../../domain/enums/expense-proposal-status.enum';

/**
 * Реализация `InterExpenseChassisPort` для consumer-расширений (capital, marketplace, EMP).
 *
 * Adapter — тонкий: читает из локального TypeORM-зеркала proposals + items, проектирует
 * во внешний нейтральный DTO `@coopenomics/inter`. Не зовёт blockchain напрямую (для этого
 * есть `ExpenseProposalSyncService`), не открывает write API.
 */
@Injectable()
export class ExpensesInterExpenseChassisAdapter implements InterExpenseChassisPort {
  constructor(
    @InjectRepository(ExpenseProposalTypeormEntity)
    private readonly repository: Repository<ExpenseProposalTypeormEntity>,
  ) {}

  async readProposalByHash(coopname: string, proposalHash: string): Promise<InterExpenseProposalRead | null> {
    const entity = await this.repository.findOne({
      where: { coopname, proposal_hash: proposalHash.toLowerCase() },
    });
    return entity ? this.toRead(entity) : null;
  }

  async readProposalsByHashes(coopname: string, proposalHashes: string[]): Promise<InterExpenseProposalRead[]> {
    if (proposalHashes.length === 0) return [];
    const normalized = proposalHashes.map((h) => h.toLowerCase());
    const entities = await this.repository.find({
      where: { coopname, proposal_hash: In(normalized) },
    });
    return entities.map((e) => this.toRead(e));
  }

  async listProposalsByOwner(
    coopname: string,
    ownerContract: string,
    ownerAction?: string,
    pagination?: InterExpensePagination,
  ): Promise<InterExpensePaginatedResult<InterExpenseProposalRead>> {
    const sortBy = pagination?.sortBy === 'createdAt' ? 'expense_proposal.created_at' : 'expense_proposal.updated_at';
    const sortOrder = pagination?.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const limit = pagination?.limit ?? 50;
    const offset = pagination?.offset ?? 0;

    const qb = this.repository
      .createQueryBuilder('expense_proposal')
      .where('expense_proposal.coopname = :coopname', { coopname })
      .andWhere(`expense_proposal.callback ->> 'contract' = :ownerContract`, { ownerContract });

    if (ownerAction) {
      qb.andWhere(`expense_proposal.callback ->> 'action' = :ownerAction`, { ownerAction });
    }

    const totalCount = await qb.getCount();
    const entities = await qb.orderBy(sortBy, sortOrder).skip(offset).take(limit).getMany();
    return { items: entities.map((e) => this.toRead(e)), totalCount };
  }

  private toRead(e: ExpenseProposalTypeormEntity): InterExpenseProposalRead {
    return {
      coopname: e.coopname,
      proposalHash: e.proposal_hash,
      sourceWalletCode: e.source_wallet ?? '',
      creator: e.username ?? '',
      status: this.mapStatus(e.status),
      callback: e.callback
        ? { contract: e.callback.contract, action: e.callback.action, data: e.callback.data }
        : undefined,
      items: (e.items ?? []).map((it): InterExpenseItem => ({
        itemHash: it.item_hash,
        mechanics: it.mechanics,
        recipientType: it.recipient_type,
        recipient: it.recipient,
        description: it.description,
        plannedAmount: it.planned_amount,
        actualAmount: it.actual_amount,
        status: it.status,
      })),
      totalPlanned: e.total_planned ?? '',
      totalActual: e.total_actual ?? '',
      createdAt: e.created_at?.toISOString?.() ?? '',
      updatedAt: e.updated_at?.toISOString?.() ?? '',
    };
  }

  private mapStatus(status: ExpenseProposalStatus | undefined): InterExpenseProposalStatus {
    switch (status) {
      case ExpenseProposalStatus.CREATED:
        return 'CREATED';
      case ExpenseProposalStatus.AUTHORIZED:
        return 'AUTHORIZED';
      case ExpenseProposalStatus.PARTIALLY_PAID:
        return 'PARTIALLY_PAID';
      case ExpenseProposalStatus.REPORT_SUBMITTED:
        return 'REPORT_SUBMITTED';
      case ExpenseProposalStatus.CLOSED:
        return 'CLOSED';
      case ExpenseProposalStatus.DECLINED:
        return 'DECLINED';
      default:
        return 'UNDEFINED';
    }
  }
}
