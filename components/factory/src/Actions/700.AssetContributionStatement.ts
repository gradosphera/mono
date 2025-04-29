import { DraftContract } from 'cooptypes'
import { AssetContributionStatement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { AssetContributionStatement as Template } from '../Templates'

export class Factory extends DocFactory<AssetContributionStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: AssetContributionStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<AssetContributionStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = AssetContributionStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, AssetContributionStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const user = await super.getUser(data.username, data.block_num)

    const request = data.request

    const commonUser = this.getCommonUser(user)

    const combinedData: AssetContributionStatement.Model = {
      meta,
      coop,
      vars,
      user: commonUser,
      request,
    }

    await super.validate(combinedData, template.model)
    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await super.generatePDF(commonUser.full_name_or_short_name, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
