import { DraftContract } from 'cooptypes'
import { InvestByResultStatement } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { InvestByResultStatement as Template } from '../templates'

export class Factory extends DocFactory<InvestByResultStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: InvestByResultStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<InvestByResultStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = InvestByResultStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, InvestByResultStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await this.getCooperative(data.coopname, data.block_num)
    const vars = await this.getVars(data.coopname, data.block_num)
    const user = await this.getUser(data.username, data.block_num)
    const commonUser = this.getCommonUser(user)

    // TODO get CONTRACT creation date from BC
    const uhdContract = this.constructUHDContract(meta.created_at)

    const combinedData: InvestByResultStatement.Model = {
      meta,
      coop,
      vars,
      user: commonUser,
      uhdContract,
      result: data.result,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF(commonUser.full_name_or_short_name, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
