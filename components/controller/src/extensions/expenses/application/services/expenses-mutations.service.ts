import { Inject, Injectable } from '@nestjs/common'
import type { TransactResult } from '@wharfkit/session'
import { Cooperative } from 'cooptypes'
import { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service'
import type { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity'
import { ExpenseProposalStatementGenerateDocumentInputDTO } from '~/application/document/documents-dto/expense-proposal-statement-document.dto'
import { ExpenseProposalDecisionGenerateDocumentInputDTO } from '~/application/document/documents-dto/expense-proposal-decision-document.dto'
import { CreateExpenseProposalInputDTO } from '../dto/create-expense-proposal.input'
import { PayExpenseItemInputDTO } from '../dto/pay-expense-item.input'
import { ReportExpenseItemInputDTO } from '../dto/report-expense-item.input'
import { ReturnExpenseItemInputDTO } from '../dto/return-expense-item.input'
import { OverspendExpenseItemInputDTO } from '../dto/overspend-expense-item.input'
import { SubmitExpenseReportInputDTO } from '../dto/submit-expense-report.input'
import { AuthorizeExpenseReportInputDTO } from '../dto/authorize-expense-report.input'
import { DeclineExpenseReportInputDTO } from '../dto/decline-expense-report.input'
import {
  EXPENSES_BLOCKCHAIN_PORT,
  ExpensesBlockchainPort,
} from '../../domain/interfaces/expenses-blockchain.port'
import { ExpenseMechanics } from '../../domain/enums/expense-mechanics.enum'
import { ExpenseRecipientType } from '../../domain/enums/expense-recipient-type.enum'

/**
 * Write-сервис расходов (8 actions полного lifecycle).
 *
 * Подписывает ключом кооператива (`active`), `account = expense`. Для пайщик-actions
 * (`reportexp` / `returnexp`) — тот же канон, что в capital (`createCommit` пайщика
 * сервисно подписан кооперативом).
 */
@Injectable()
export class ExpensesMutationsService {
  constructor(
    @Inject(EXPENSES_BLOCKCHAIN_PORT)
    private readonly chain: ExpensesBlockchainPort,
    private readonly generator: GeneratorInfrastructureService
  ) {}

  async generateExpenseProposalStatementDocument(
    data: ExpenseProposalStatementGenerateDocumentInputDTO,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ExpenseProposalStatement.registry_id
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

    return this.chain.createExp({
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

  async authorizeExpenseReport(input: AuthorizeExpenseReportInputDTO): Promise<TransactResult> {
    const decision = input.decision.toDocument()
    return this.chain.authExp({
      coopname: input.coopname,
      proposal_hash: input.proposal_hash,
      decision: {
        version: decision.version,
        hash: decision.hash,
        doc_hash: decision.doc_hash,
        meta_hash: decision.meta_hash,
        meta: decision.meta,
        signatures: decision.signatures,
      } as any,
    })
  }

  async declineExpenseReport(input: DeclineExpenseReportInputDTO): Promise<TransactResult> {
    return this.chain.declineExp({
      coopname: input.coopname,
      proposal_hash: input.proposal_hash,
      reason: input.reason,
    })
  }
}
