import { DraftContract } from 'cooptypes'
import { ExpenseProposalDecision } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { ExpenseProposalDecision as Template } from '../Templates'

export class Factory extends DocFactory<ExpenseProposalDecision.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ExpenseProposalDecision.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ExpenseProposalDecision.Model>

    if (process.env.SOURCE === 'local') {
      template = ExpenseProposalDecision.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ExpenseProposalDecision.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const combinedData: ExpenseProposalDecision.Model = {
      meta,
      coop: (data as any).coop,
      user: (data as any).user,
      vars: (data as any).vars,
      proposal_hash: data.proposal_hash,
      proposal: data.proposal,
      items: data.items,
      decision: data.decision,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
