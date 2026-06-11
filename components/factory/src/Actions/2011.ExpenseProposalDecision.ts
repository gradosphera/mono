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
    // Независимые источники тянем параллельно (см. resolveParallel в DocFactory)
    const { template, coop, vars, userData } = await this.resolveParallel({
      template: () => process.env.SOURCE === 'local'
        ? Promise.resolve(ExpenseProposalDecision.Template as ITemplate<ExpenseProposalDecision.Model>)
        : this.getTemplate<ExpenseProposalDecision.Model>(DraftContract.contractName.production, ExpenseProposalDecision.registry_id, data.block_num),
      coop: () => super.getCooperative(data.coopname, data.block_num),
      vars: () => super.getVars(data.coopname, data.block_num),
      userData: () => super.getUser(data.username, data.block_num),
    })

    // meta зависит от template.title — считаем после батча
    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const combinedData: ExpenseProposalDecision.Model = {
      meta,
      coop,
      user: super.getCommonUser(userData),
      vars,
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
