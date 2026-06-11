import { Inject, Injectable } from '@nestjs/common'
import type { TransactResult } from '@wharfkit/session'
import type { InterExpenseRequisiteItemInput } from '@coopenomics/inter'
import { Cooperative } from 'cooptypes'
import { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service'
import type { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity'
import { ExpenseProposalStatementGenerateDocumentInputDTO } from '~/application/document/documents-dto/expense-proposal-statement-document.dto'
import { ExpenseProposalDecisionGenerateDocumentInputDTO } from '~/application/document/documents-dto/expense-proposal-decision-document.dto'
import { CreateExpenseProposalInputDTO } from '../dto/create-expense-proposal.input'
import type { ExpenseItemInputDTO } from '../dto/expense-item.input'
import { PayExpenseItemInputDTO } from '../dto/pay-expense-item.input'
import { ReportExpenseItemInputDTO } from '../dto/report-expense-item.input'
import { ReturnExpenseItemInputDTO } from '../dto/return-expense-item.input'
import { OverspendExpenseItemInputDTO } from '../dto/overspend-expense-item.input'
import { SubmitExpenseReportInputDTO } from '../dto/submit-expense-report.input'
import {
  EXPENSES_BLOCKCHAIN_PORT,
  ExpensesBlockchainPort,
} from '../../domain/interfaces/expenses-blockchain.port'
import { ExpenseMechanics } from '../../domain/enums/expense-mechanics.enum'
import { ExpenseRecipientType } from '../../domain/enums/expense-recipient-type.enum'
import { ExpenseRequisiteSnapshotsService } from './expense-requisite-snapshots.service'

/**
 * Write-сервис расходов.
 *
 * Подписывает ключом кооператива (`active`), `account = expense`. Для пайщик-actions
 * (`reportexp` / `returnexp`) — тот же канон, что в capital (`createCommit` пайщика
 * сервисно подписан кооперативом). Авторизация / отклонение СЗ идут через решение
 * совета (callbacks authexp/declexp от контракта soviet) — здесь их нет.
 */
@Injectable()
export class ExpensesMutationsService {
  constructor(
    @Inject(EXPENSES_BLOCKCHAIN_PORT)
    private readonly chain: ExpensesBlockchainPort,
    private readonly generator: GeneratorInfrastructureService,
    private readonly requisiteSnapshots: ExpenseRequisiteSnapshotsService
  ) {}

  async generateExpenseProposalStatementDocument(
    data: ExpenseProposalStatementGenerateDocumentInputDTO,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ExpenseProposalStatement.registry_id

    // Полные реквизиты получателей подставляет сервер: фронт оперирует только
    // идентификатором платёжного метода (и видит лишь сокращённое представление).
    // Служебные поля (payment_method_id / recipient_username) в meta документа
    // не попадают — items пересобираются на документные поля.
    data.items = await Promise.all(
      data.items.map(async (item) => {
        let requisites = item.requisites
        if (item.payment_method_id) {
          const owner = item.recipient_username || data.username
          requisites = await this.requisiteSnapshots.formatForOwner(owner, item.payment_method_id)
        }
        return {
          number: item.number,
          description: item.description,
          amount: item.amount,
          recipient_type: item.recipient_type,
          mechanics: item.mechanics,
          recipient_name: item.recipient_name,
          requisites,
        }
      })
    )

    return this.generator.generateDocument({ data: data as unknown as Cooperative.Registry.ExpenseProposalStatement.Action, options: options || {} })
  }

  async generateExpenseProposalDecisionDocument(
    data: ExpenseProposalDecisionGenerateDocumentInputDTO,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ExpenseProposalDecision.registry_id
    return this.generator.generateDocument({ data: data as unknown as Cooperative.Registry.ExpenseProposalDecision.Action, options: options || {} })
  }

  async createExpenseProposal(input: CreateExpenseProposalInputDTO): Promise<TransactResult> {
    // Валидация реквизитов ДО блокчейна, снимок — ПОСЛЕ (канон gateway
    // prepareWithdraw → persistWithdraw). Реквизиты в чейн не пишутся.
    const requisiteItems = toRequisiteItems(input.proposal_hash, input.items)
    await this.requisiteSnapshots.validate(input.coopname, requisiteItems)

    const items = input.items.map((it) => ({
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
      actual_amount: it.planned_amount,
      status: 0,
    }))

    const statement = input.statement.toDocument()

    const result = await this.chain.createExp({
      coopname: input.coopname,
      username: input.username,
      proposal_hash: input.proposal_hash,
      source_wallet: input.source_wallet,
      items,
      callback: {
        contract: input.callback?.contract ?? '',
        action: input.callback?.action ?? '',
        data: input.callback?.data ?? '',
      },
      statement: {
        version: statement.version,
        hash: statement.hash,
        doc_hash: statement.doc_hash,
        meta_hash: statement.meta_hash,
        meta: statement.meta,
        signatures: statement.signatures,
      } as any,
    })

    await this.requisiteSnapshots.snapshot(input.coopname, requisiteItems)

    return result
  }

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

  async overspendExpenseItem(input: OverspendExpenseItemInputDTO): Promise<TransactResult> {
    return this.chain.overspendExp({
      coopname: input.coopname,
      proposal_hash: input.proposal_hash,
      item_hash: input.item_hash,
      overspend_amount: input.overspend_amount,
    })
  }

  async submitExpenseReport(input: SubmitExpenseReportInputDTO): Promise<TransactResult> {
    return this.chain.closeExp({
      coopname: input.coopname,
      proposal_hash: input.proposal_hash,
    })
  }
}

function toRequisiteItems(proposalHash: string, items: ExpenseItemInputDTO[]): InterExpenseRequisiteItemInput[] {
  return items.map((it) => ({
    proposalHash,
    itemHash: it.item_hash,
    recipient: it.recipient,
    isOrganization: it.recipient_type === ExpenseRecipientType.ORG,
    paymentMethodId: it.payment_method_id,
    requisites: it.requisites,
  }))
}
