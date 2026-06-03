import { NotImplementedException } from '@nestjs/common'
import { ExpensesMutationsService } from './expenses-mutations.service'
import type { ExpensesBlockchainPort } from '../../domain/interfaces/expenses-blockchain.port'
import type { PayExpenseItemInputDTO } from '../dto/pay-expense-item.input'
import type { ReportExpenseItemInputDTO } from '../dto/report-expense-item.input'
import type { ReturnExpenseItemInputDTO } from '../dto/return-expense-item.input'
import type { OverspendExpenseItemInputDTO } from '../dto/overspend-expense-item.input'
import type { SubmitExpenseReportInputDTO } from '../dto/submit-expense-report.input'
import type { AuthorizeExpenseReportInputDTO } from '../dto/authorize-expense-report.input'
import type { DeclineExpenseReportInputDTO } from '../dto/decline-expense-report.input'

/**
 * Контракт-тест: 6 mutations пробрасывают payload в `ExpensesBlockchainPort`
 * и проверяют action-mapping; `authorizeExpenseReport` ждёт document2 → 501.
 */
describe('ExpensesMutationsService', () => {
  let service: ExpensesMutationsService
  let chain: jest.Mocked<ExpensesBlockchainPort>

  const fakeResult = { response: { transaction_id: 'tx_abc' } } as never

  beforeEach(() => {
    chain = {
      payExp: jest.fn().mockResolvedValue(fakeResult),
      reportExp: jest.fn().mockResolvedValue(fakeResult),
      returnExp: jest.fn().mockResolvedValue(fakeResult),
      overspendExp: jest.fn().mockResolvedValue(fakeResult),
      closeExp: jest.fn().mockResolvedValue(fakeResult),
      declineExp: jest.fn().mockResolvedValue(fakeResult),
    }
    service = new ExpensesMutationsService(chain)
  })

  it('payExpenseItem → chain.payExp({coopname, proposal_hash, item_hash, actual_amount})', async () => {
    const input = {
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      item_hash: '0xdef',
      actual_amount: '100.0000 RUB',
    } as PayExpenseItemInputDTO

    await service.payExpenseItem(input)

    expect(chain.payExp).toHaveBeenCalledWith({
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      item_hash: '0xdef',
      actual_amount: '100.0000 RUB',
    })
  })

  it('reportExpenseItem → chain.reportExp({coopname, proposal_hash, item_hash})', async () => {
    const input = {
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      item_hash: '0xdef',
    } as ReportExpenseItemInputDTO

    await service.reportExpenseItem(input)

    expect(chain.reportExp).toHaveBeenCalledWith({
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      item_hash: '0xdef',
    })
  })

  it('returnExpenseItem → chain.returnExp({coopname, proposal_hash, item_hash, return_amount})', async () => {
    const input = {
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      item_hash: '0xdef',
      return_amount: '50.0000 RUB',
    } as ReturnExpenseItemInputDTO

    await service.returnExpenseItem(input)

    expect(chain.returnExp).toHaveBeenCalledWith({
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      item_hash: '0xdef',
      return_amount: '50.0000 RUB',
    })
  })

  it('overspendExpenseItem → chain.overspendExp({coopname, proposal_hash, item_hash, overspend_amount})', async () => {
    const input = {
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      item_hash: '0xdef',
      overspend_amount: '200.0000 RUB',
    } as OverspendExpenseItemInputDTO

    await service.overspendExpenseItem(input)

    expect(chain.overspendExp).toHaveBeenCalledWith({
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      item_hash: '0xdef',
      overspend_amount: '200.0000 RUB',
    })
  })

  it('submitExpenseReport → chain.closeExp({coopname, proposal_hash}) без total/comment', async () => {
    const input = {
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      total_actual_amount: '1500.0000 RUB',
      comment: 'пиар-кампания апрель',
    } as SubmitExpenseReportInputDTO

    await service.submitExpenseReport(input)

    expect(chain.closeExp).toHaveBeenCalledWith({ coopname: 'voskhod', proposal_hash: '0xabc' })
  })

  it('declineExpenseReport → chain.declineExp({coopname, proposal_hash, reason})', async () => {
    const input = {
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      reason: 'не утверждаю',
    } as DeclineExpenseReportInputDTO

    await service.declineExpenseReport(input)

    expect(chain.declineExp).toHaveBeenCalledWith({
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      reason: 'не утверждаю',
    })
  })

  it('authorizeExpenseReport → NotImplementedException + ссылка на decision_doc/Эпик 2', async () => {
    const input = { coopname: 'voskhod', proposal_hash: '0xabc' } as AuthorizeExpenseReportInputDTO

    await expect(service.authorizeExpenseReport(input)).rejects.toBeInstanceOf(NotImplementedException)
    await expect(service.authorizeExpenseReport(input)).rejects.toThrow(/decision_doc/)
  })
})
