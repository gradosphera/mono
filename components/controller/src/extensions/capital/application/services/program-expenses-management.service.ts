import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import type { TransactResult } from '@wharfkit/session';
import { config } from '~/config';
import {
  INTER_EXPENSE_CHASSIS,
  type InterExpenseChassisPort,
  type InterExpenseItem,
  type InterExpensePagination,
  type InterExpensePaginatedResult,
  type InterExpenseProposalRead,
  type InterExpenseProposalStatus,
} from '@coopenomics/inter';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { CreateProgramExpenseInputDTO } from '../dto/program_expenses/create-program-expense.input';
import type { TopupProgramExpenseInputDTO } from '../dto/program_expenses/topup-program-expense.input';
import type {
  ProgramExpenseCallbackOutputDTO,
  ProgramExpenseItemOutputDTO,
  ProgramExpenseOutputDTO,
} from '../dto/program_expenses/program-expense.output';
import { ExpenseProposalStatus } from '~/extensions/expenses/domain/enums/expense-proposal-status.enum';
import { ExpenseMechanics } from '~/extensions/expenses/domain/enums/expense-mechanics.enum';
import { ExpenseRecipientType } from '~/extensions/expenses/domain/enums/expense-recipient-type.enum';

/**
 * Управление программными расходами Капитала.
 *
 * Тонкое расширение: write — `capital::createpgexp` / `topupprogexp` через
 * `CapitalBlockchainPort`; read — через inter-порт `INTER_EXPENSE_CHASSIS`
 * (шасси-extension отвечает за хранение proposals).
 */
@Injectable()
export class ProgramExpensesManagementService {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort,
    @Inject(INTER_EXPENSE_CHASSIS)
    private readonly expenseChassis: InterExpenseChassisPort,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils,
  ) {}

  async createProgramExpense(data: CreateProgramExpenseInputDTO): Promise<TransactResult> {
    const zeroAmount = `0.0000 ${config.blockchain.root_govern_symbol}`;
    const blockchainData: CapitalContract.Actions.CreateProgramExpense.ICreateProgramExpense = {
      coopname: data.coopname,
      expense_hash: data.expense_hash,
      creator: data.creator,
      operation_code: data.operation_code,
      items: data.items.map((it) => ({
        item_hash: it.item_hash,
        mechanics: it.mechanics === ExpenseMechanics.DIRECT ? 1 : 0,
        recipient_type:
          it.recipient_type === ExpenseRecipientType.SELF
            ? 0
            : it.recipient_type === ExpenseRecipientType.MEMBER
              ? 1
              : 2,
        recipient: it.recipient,
        description: it.description,
        planned_amount: it.planned_amount,
        actual_amount: zeroAmount,
        status: 0,
      })),
      description: data.description,
      statement: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.statement),
    };
    return this.capitalBlockchainPort.createProgramExpense(blockchainData);
  }

  async topupProgramExpense(data: TopupProgramExpenseInputDTO): Promise<TransactResult> {
    return this.capitalBlockchainPort.topupProgramExpense({
      coopname: data.coopname,
      amount: data.amount,
    });
  }

  async listProgramExpenses(
    coopname: string,
    pagination?: InterExpensePagination,
  ): Promise<InterExpensePaginatedResult<ProgramExpenseOutputDTO>> {
    const result = await this.expenseChassis.listProposalsByOwner(coopname, 'capital', 'onpgexpdone', pagination);
    return {
      items: result.items.map((p) => this.toOutput(p)),
      totalCount: result.totalCount,
    };
  }

  async getProgramExpense(coopname: string, expenseHash: string): Promise<ProgramExpenseOutputDTO | null> {
    const proposal = await this.expenseChassis.readProposalByHash(coopname, expenseHash);
    return proposal ? this.toOutput(proposal) : null;
  }

  private toOutput(p: InterExpenseProposalRead): ProgramExpenseOutputDTO {
    return {
      coopname: p.coopname,
      expense_hash: p.proposalHash,
      creator: p.creator,
      operation_code: p.operationCode,
      source_wallet: p.sourceWalletCode,
      status: this.mapStatus(p.status),
      callback: p.callback ? this.toCallbackOutput(p.callback) : undefined,
      items: p.items.map((it) => this.toItemOutput(it)),
      total_planned: p.totalPlanned,
      total_actual: p.totalActual,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    };
  }

  private toItemOutput(it: InterExpenseItem): ProgramExpenseItemOutputDTO {
    return {
      item_hash: it.itemHash,
      mechanics: it.mechanics,
      recipient_type: it.recipientType,
      recipient: it.recipient,
      description: it.description,
      planned_amount: it.plannedAmount,
      actual_amount: it.actualAmount,
      status: it.status,
    };
  }

  private toCallbackOutput(cb: { contract: string; action: string; data: string }): ProgramExpenseCallbackOutputDTO {
    return { contract: cb.contract, action: cb.action, data: cb.data };
  }

  private mapStatus(status: InterExpenseProposalStatus): ExpenseProposalStatus {
    switch (status) {
      case 'CREATED':
        return ExpenseProposalStatus.CREATED;
      case 'AUTHORIZED':
        return ExpenseProposalStatus.AUTHORIZED;
      case 'PARTIALLY_PAID':
        return ExpenseProposalStatus.PARTIALLY_PAID;
      case 'REPORT_SUBMITTED':
        return ExpenseProposalStatus.REPORT_SUBMITTED;
      case 'CLOSED':
        return ExpenseProposalStatus.CLOSED;
      case 'DECLINED':
        return ExpenseProposalStatus.DECLINED;
      default:
        return ExpenseProposalStatus.UNDEFINED;
    }
  }
}
