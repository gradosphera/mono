import { DraftContract } from 'cooptypes'
import { ExpenseProposalStatement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { ExpenseProposalStatement as Template } from '../Templates'

export class Factory extends DocFactory<ExpenseProposalStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ExpenseProposalStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ExpenseProposalStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = ExpenseProposalStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ExpenseProposalStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const combinedData: ExpenseProposalStatement.Model = {
      meta,
      coop: (data as any).coop,
      user: (data as any).user,
      vars: (data as any).vars,
      proposal: data.proposal,
      items: data.items,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
