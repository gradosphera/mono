import { Inject, Injectable, NotImplementedException } from '@nestjs/common'
import type { TransactResult } from '@wharfkit/session'
import { PayExpenseItemInputDTO } from '../dto/pay-expense-item.input'
import { ReportExpenseItemInputDTO } from '../dto/report-expense-item.input'
import { ReturnExpenseItemInputDTO } from '../dto/return-expense-item.input'
import { SubmitExpenseReportInputDTO } from '../dto/submit-expense-report.input'
import { AuthorizeExpenseReportInputDTO } from '../dto/authorize-expense-report.input'
import { DeclineExpenseReportInputDTO } from '../dto/decline-expense-report.input'
import {
  EXPENSES_BLOCKCHAIN_PORT,
  ExpensesBlockchainPort,
} from '../../domain/interfaces/expenses-blockchain.port'

/**
 * Write-сервис расходов (`expense::payexp` / `reportexp` / `returnexp` / `closeexp` / `declexp`).
 *
 * 5 из 6 mutations работают через `ExpensesBlockchainPort` (после Эпика 0 cooptypes).
 * `authorizeExpenseReport` (`expense::authexp`) ждёт document2 `decision_doc` (type=2011)
 * от signature-pipeline UI Эпика 2 — пока NotImplementedException с явным reason.
 *
 * Adapter подписывает ключом кооператива (`active`), `account = expense`. Для пайщик-actions
 * (`reportexp` / `returnexp`) — тот же канон, что в capital (`createCommit` пайщика
 * сервисно подписан кооперативом).
 */
@Injectable()
export class ExpensesMutationsService {
  constructor(
    @Inject(EXPENSES_BLOCKCHAIN_PORT)
    private readonly chain: ExpensesBlockchainPort
  ) {}

  async payExpenseItem(input: PayExpenseItemInputDTO): Promise<TransactResult> {
    return this.chain.payExp({
      coopname: input.coopname,
      proposal_hash: input.proposal_hash,
      item_hash: input.item_hash,
      actual_amount: input.actual_amount,
    })
  }

  async reportExpenseItem(input: ReportExpenseItemInputDTO): Promise<TransactResult> {
    return this.chain.reportExp({
      coopname: input.coopname,
      proposal_hash: input.proposal_hash,
      item_hash: input.item_hash,
    })
  }

  async returnExpenseItem(input: ReturnExpenseItemInputDTO): Promise<TransactResult> {
    return this.chain.returnExp({
      coopname: input.coopname,
      proposal_hash: input.proposal_hash,
      item_hash: input.item_hash,
      return_amount: input.return_amount,
    })
  }

  async submitExpenseReport(input: SubmitExpenseReportInputDTO): Promise<TransactResult> {
    // closeexp принимает только {coopname, proposal_hash}. total_actual_amount/comment —
    // backend-метаданные Phase 2 (валидация суммы фактических item-сумм перед submit'ом).
    return this.chain.closeExp({
      coopname: input.coopname,
      proposal_hash: input.proposal_hash,
    })
  }

  async authorizeExpenseReport(_input: AuthorizeExpenseReportInputDTO): Promise<TransactResult> {
    throw new NotImplementedException(
      'authorizeExpenseReport: ждёт document2 decision_doc (type=2011) от signature-pipeline UI Эпика 2.'
    )
  }

  async declineExpenseReport(input: DeclineExpenseReportInputDTO): Promise<TransactResult> {
    return this.chain.declineExp({
      coopname: input.coopname,
      proposal_hash: input.proposal_hash,
      reason: input.reason,
    })
  }
}
