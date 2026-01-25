import { DraftContract } from 'cooptypes'
import { GenerationMoneyInvestStatement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import { formatDateTime } from '../Utils'

export { GenerationMoneyInvestStatement as Template } from '../Templates'

export class Factory extends DocFactory<GenerationMoneyInvestStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: GenerationMoneyInvestStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<GenerationMoneyInvestStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = GenerationMoneyInvestStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, GenerationMoneyInvestStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const userData = await super.getUser(data.username, data.block_num)
    const user = super.getCommonUser(userData)

    const combinedData: GenerationMoneyInvestStatement.Model = {
      meta,
      coop,
      vars,
      user,
      appendix_hash: data.appendix_hash,
      short_appendix_hash: this.getShortHash(data.appendix_hash),
      contributor_hash: data.contributor_hash,
      contributor_short_hash: super.constructUHDContractNumber(data.contributor_hash),
      contributor_created_at: formatDateTime(data.contributor_created_at),
      appendix_created_at: formatDateTime(data.appendix_created_at),
      project_hash: data.project_hash,
      amount: super.formatAsset(data.amount),
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
