import { Injectable, NotImplementedException } from '@nestjs/common';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { PayExpenseItemInputDTO } from '../dto/pay-expense-item.input';
import { ReportExpenseItemInputDTO } from '../dto/report-expense-item.input';
import { ReturnExpenseItemInputDTO } from '../dto/return-expense-item.input';
import { SubmitExpenseReportInputDTO } from '../dto/submit-expense-report.input';

/**
 * Write-сервис расходов (`expense::payexp` / `reportexp` / `returnexp`).
 *
 * Скелет — chain-submit подключается через write-mutation pool после Эпика 0
 * (`cooptypes` regen P0 action-codes для `expense`). Сейчас все методы бросают
 * `NotImplementedException` — модуль компилится, резолвер регистрируется в схеме,
 * UI получает явный 501 вместо тихого падения.
 *
 * TODO(C28-31 шаг 8): подключить `WriteMutationPoolService.submitWithPool`
 * + `waitForDelta` + discriminated return `{ status: 'applied' | 'pending' }` (ADR-009/012).
 */
@Injectable()
export class ExpensesMutationsService {
  async payExpenseItem(_input: PayExpenseItemInputDTO): Promise<TransactionDTO> {
    throw new NotImplementedException(
      'payExpenseItem: chain-submit подключится после Эпика 0 (cooptypes regen для expense).'
    );
  }

  async reportExpenseItem(_input: ReportExpenseItemInputDTO): Promise<TransactionDTO> {
    throw new NotImplementedException(
      'reportExpenseItem: chain-submit подключится после Эпика 0 (cooptypes regen для expense).'
    );
  }

  async returnExpenseItem(_input: ReturnExpenseItemInputDTO): Promise<TransactionDTO> {
    throw new NotImplementedException(
      'returnExpenseItem: chain-submit подключится после Эпика 0 (cooptypes regen для expense).'
    );
  }

  async submitExpenseReport(_input: SubmitExpenseReportInputDTO): Promise<TransactionDTO> {
    throw new NotImplementedException(
      'submitExpenseReport: chain-submit подключится после Эпика 0 (cooptypes regen для expense::closeexp).'
    );
  }
}
