import { ExpensesMutationsService } from './expenses-mutations.service'
import type { ExpensesBlockchainPort } from '../../domain/interfaces/expenses-blockchain.port'
import type { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service'
import type { PayExpenseItemInputDTO } from '../dto/pay-expense-item.input'
import type { ReportExpenseItemInputDTO } from '../dto/report-expense-item.input'
import type { ReturnExpenseItemInputDTO } from '../dto/return-expense-item.input'
import type { OverspendExpenseItemInputDTO } from '../dto/overspend-expense-item.input'
import type { SubmitExpenseReportInputDTO } from '../dto/submit-expense-report.input'
import type { CreateExpenseProposalInputDTO } from '../dto/create-expense-proposal.input'
import { ExpenseMechanics } from '../../domain/enums/expense-mechanics.enum'
import { ExpenseRecipientType } from '../../domain/enums/expense-recipient-type.enum'

/**
 * Контракт-тест: backend-mutations пробрасывают payload в `ExpensesBlockchainPort`
 * с корректным action-mapping. createExpenseProposal раскладывает подписанный
 * document2 через `.toDocument()` и снимает реквизиты получателей-пайщиков.
 * authexp/declexp — callbacks решения совета, у backend'а их нет.
 */
describe('ExpensesMutationsService', () => {
  let service: ExpensesMutationsService
  let chain: jest.Mocked<ExpensesBlockchainPort>
  let generator: jest.Mocked<Pick<GeneratorInfrastructureService, 'generateDocument'>>
  let requisiteSnapshots: { validate: jest.Mock; snapshot: jest.Mock; formatForOwner: jest.Mock }

  const fakeResult = { response: { transaction_id: 'tx_abc' } } as never

  beforeEach(() => {
    chain = {
      createExp: jest.fn().mockResolvedValue(fakeResult),
      payExp: jest.fn().mockResolvedValue(fakeResult),
      reportExp: jest.fn().mockResolvedValue(fakeResult),
      returnExp: jest.fn().mockResolvedValue(fakeResult),
      overspendExp: jest.fn().mockResolvedValue(fakeResult),
      closeExp: jest.fn().mockResolvedValue(fakeResult),
    } as unknown as jest.Mocked<ExpensesBlockchainPort>
    generator = {
      generateDocument: jest.fn().mockResolvedValue({} as never),
    }
    requisiteSnapshots = {
      validate: jest.fn().mockResolvedValue(undefined),
      snapshot: jest.fn().mockResolvedValue(undefined),
      formatForOwner: jest.fn().mockResolvedValue('Банковский перевод: счёт 40817810000000000000, Банк ВТБ (ПАО)'),
    }
    service = new ExpensesMutationsService(
      chain,
      generator as unknown as GeneratorInfrastructureService,
      requisiteSnapshots as never
    )
  })

  const makeSignedDoc = (overrides: Partial<{ hash: string; doc_hash: string; meta_hash: string }> = {}) => ({
    version: '1',
    hash: overrides.hash ?? '0xhash',
    doc_hash: overrides.doc_hash ?? '0xdoc',
    meta_hash: overrides.meta_hash ?? '0xmeta',
    meta: { title: 'Заявление', registry_id: 2010 },
    signatures: [
      {
        id: 0,
        signed_hash: '0xsignedhash',
        signer: 'ivanov',
        public_key: 'EOS6...',
        signature: 'SIG_K1_...',
        signed_at: '2026-06-02T10:00:00',
        meta: '',
      },
    ],
    toDocument(): any {
      return {
        version: '1',
        hash: overrides.hash ?? '0xhash',
        doc_hash: overrides.doc_hash ?? '0xdoc',
        meta_hash: overrides.meta_hash ?? '0xmeta',
        meta: JSON.stringify({ title: 'Заявление', registry_id: 2010 }),
        signatures: this.signatures,
      }
    },
  })

  it('createExpenseProposal → chain.createExp с раскладкой items + document2', async () => {
    const input: CreateExpenseProposalInputDTO = {
      coopname: 'voskhod',
      username: 'ivanov',
      proposal_hash: '0xabc',
      source_wallet: 'w.cap.blago',
      items: [
        {
          item_hash: '0xitem1',
          mechanics: ExpenseMechanics.ADVANCE,
          recipient_type: ExpenseRecipientType.MEMBER,
          recipient: 'petrov',
          description: 'Закупка кормов',
          planned_amount: '5000.0000 RUB',
          payment_method_id: 'pm-1',
        },
      ],
      statement: makeSignedDoc() as any,
    } as CreateExpenseProposalInputDTO

    await service.createExpenseProposal(input)

    expect(chain.createExp).toHaveBeenCalledTimes(1)
    const call = chain.createExp.mock.calls[0][0]
    expect(call.coopname).toBe('voskhod')
    expect(call.username).toBe('ivanov')
    expect(call.proposal_hash).toBe('0xabc')
    expect(call.source_wallet).toBe('w.cap.blago')
    expect(call.items).toHaveLength(1)
    expect(call.items[0].item_hash).toBe('0xitem1')
    expect(call.items[0].mechanics).toBe(0)
    expect(call.items[0].recipient_type).toBe(1)
    expect(call.callback).toEqual({ contract: '', action: '', data: '' })
    expect(call.statement.doc_hash).toBe('0xdoc')

    // Реквизиты: валидация до блокчейна, снимок — после.
    expect(requisiteSnapshots.validate).toHaveBeenCalledTimes(1)
    expect(requisiteSnapshots.snapshot).toHaveBeenCalledTimes(1)
    const snapItems = requisiteSnapshots.snapshot.mock.calls[0][1]
    expect(snapItems[0]).toMatchObject({
      proposalHash: '0xabc',
      itemHash: '0xitem1',
      recipient: 'petrov',
      isOrganization: false,
      paymentMethodId: 'pm-1',
    })
  })

  it('createExpenseProposal: ошибка валидации реквизитов не доходит до блокчейна', async () => {
    requisiteSnapshots.validate.mockRejectedValue(new Error('Не указаны реквизиты получателя'))
    const input: CreateExpenseProposalInputDTO = {
      coopname: 'voskhod',
      username: 'ivanov',
      proposal_hash: '0xabc',
      source_wallet: 'w.cap.blago',
      items: [
        {
          item_hash: '0xitem1',
          mechanics: ExpenseMechanics.ADVANCE,
          recipient_type: ExpenseRecipientType.SELF,
          recipient: 'ivanov',
          description: 'Канцелярия',
          planned_amount: '1000.0000 RUB',
        },
      ],
      statement: makeSignedDoc() as any,
    } as CreateExpenseProposalInputDTO

    await expect(service.createExpenseProposal(input)).rejects.toThrow('Не указаны реквизиты')
    expect(chain.createExp).not.toHaveBeenCalled()
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

  it('submitExpenseReport → chain.closeExp({coopname, proposal_hash})', async () => {
    const input = {
      coopname: 'voskhod',
      proposal_hash: '0xabc',
      total_actual_amount: '1500.0000 RUB',
      comment: 'пиар-кампания апрель',
    } as SubmitExpenseReportInputDTO

    await service.submitExpenseReport(input)

    expect(chain.closeExp).toHaveBeenCalledWith({ coopname: 'voskhod', proposal_hash: '0xabc' })
  })
})
