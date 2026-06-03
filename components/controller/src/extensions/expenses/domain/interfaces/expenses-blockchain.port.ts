import { ExpenseContract } from 'cooptypes'
import type { TransactResult } from '@wharfkit/session'

/**
 * Блокчейн-порт контракта `expense`. Hexagonal: domain видит интерфейс,
 * implementation в `infrastructure/blockchain/adapters`.
 *
 * MVP — Эпик 0 cooptypes/expense. 5 actions работают на текущих DTO:
 *   - `payexp`     — оплата item (ADVANCE/DIRECT)
 *   - `reportexp`  — закрытие item чеком (ADVANCE)
 *   - `returnexp`  — возврат неиспользованного аванса
 *   - `closeexp`   — финализация СЗ-отчёта (REPORT_SUBMITTED → CLOSED)
 *   - `declexp`    — отклонение СЗ
 *
 * Два action'а ждут document2 от UI Эпика 2 (signature-pipeline):
 *   - `createexp`  — `statement: IDocument2` (type=2010)
 *   - `authexp`    — `decision:  IDocument2` (type=2011)
 *
 * `overspendexp` (доплата при перерасходе) добавится с UI Phase 2.
 */
export interface ExpensesBlockchainPort {
  payExp(data: ExpenseContract.Actions.PayExp.IPayExp): Promise<TransactResult>
  reportExp(data: ExpenseContract.Actions.ReportExp.IReportExp): Promise<TransactResult>
  returnExp(data: ExpenseContract.Actions.ReturnExp.IReturnExp): Promise<TransactResult>
  closeExp(data: ExpenseContract.Actions.CloseExp.ICloseExp): Promise<TransactResult>
  declineExp(data: ExpenseContract.Actions.DeclineExp.IDeclineExp): Promise<TransactResult>
}

export const EXPENSES_BLOCKCHAIN_PORT = Symbol('ExpensesBlockchainPort')
