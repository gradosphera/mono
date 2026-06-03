import { NotImplementedException } from '@nestjs/common';
import { ExpensesMutationsService } from './expenses-mutations.service';
import type { PayExpenseItemInputDTO } from '../dto/pay-expense-item.input';
import type { ReportExpenseItemInputDTO } from '../dto/report-expense-item.input';
import type { ReturnExpenseItemInputDTO } from '../dto/return-expense-item.input';
import type { SubmitExpenseReportInputDTO } from '../dto/submit-expense-report.input';
import type { AuthorizeExpenseReportInputDTO } from '../dto/authorize-expense-report.input';
import type { DeclineExpenseReportInputDTO } from '../dto/decline-expense-report.input';

/**
 * Smoke-контракт: skeleton до Эпика 0 (cooptypes regen для `expense::*`).
 * Все 6 write-методов должны бросать NotImplementedException и упоминать
 * Эпик 0, чтобы UI не получил «тихий» успех на неинициализированном write-path.
 */
describe('ExpensesMutationsService (skeleton до Эпика 0)', () => {
  let service: ExpensesMutationsService;

  beforeEach(() => {
    service = new ExpensesMutationsService();
  });

  const stub = { coopname: 'voskhod', proposal_hash: '0xabc' } as const;

  it('payExpenseItem → NotImplementedException + ссылка на Эпик 0', async () => {
    await expect(
      service.payExpenseItem({ ...stub, item_hash: '0xdef' } as unknown as PayExpenseItemInputDTO)
    ).rejects.toBeInstanceOf(NotImplementedException);
  });

  it('reportExpenseItem → NotImplementedException', async () => {
    await expect(
      service.reportExpenseItem({ ...stub, item_hash: '0xdef' } as unknown as ReportExpenseItemInputDTO)
    ).rejects.toBeInstanceOf(NotImplementedException);
  });

  it('returnExpenseItem → NotImplementedException', async () => {
    await expect(
      service.returnExpenseItem({ ...stub, item_hash: '0xdef' } as unknown as ReturnExpenseItemInputDTO)
    ).rejects.toBeInstanceOf(NotImplementedException);
  });

  it('submitExpenseReport → NotImplementedException + ссылка на closeexp', async () => {
    await expect(
      service.submitExpenseReport(stub as unknown as SubmitExpenseReportInputDTO)
    ).rejects.toThrow(/closeexp/);
  });

  it('authorizeExpenseReport → NotImplementedException + ссылка на authexp', async () => {
    await expect(
      service.authorizeExpenseReport(stub as unknown as AuthorizeExpenseReportInputDTO)
    ).rejects.toThrow(/authexp/);
  });

  it('declineExpenseReport → NotImplementedException + ссылка на declineexp', async () => {
    await expect(
      service.declineExpenseReport({ ...stub, reason: 'не утверждаю' } as unknown as DeclineExpenseReportInputDTO)
    ).rejects.toThrow(/declineexp/);
  });

  it('сообщения всех методов содержат «Эпика 0»', async () => {
    const callers: Array<() => Promise<unknown>> = [
      () => service.payExpenseItem(stub as unknown as PayExpenseItemInputDTO),
      () => service.reportExpenseItem(stub as unknown as ReportExpenseItemInputDTO),
      () => service.returnExpenseItem(stub as unknown as ReturnExpenseItemInputDTO),
      () => service.submitExpenseReport(stub as unknown as SubmitExpenseReportInputDTO),
      () => service.authorizeExpenseReport(stub as unknown as AuthorizeExpenseReportInputDTO),
      () =>
        service.declineExpenseReport({
          ...stub,
          reason: 'r',
        } as unknown as DeclineExpenseReportInputDTO),
    ];

    for (const call of callers) {
      await expect(call()).rejects.toThrow(/Эпика 0/);
    }
  });
});
