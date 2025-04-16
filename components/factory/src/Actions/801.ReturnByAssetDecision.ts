import { DraftContract } from 'cooptypes'
import { ReturnByAssetDecision } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { ReturnByAssetDecision as Template } from '../Templates'

export class Factory extends DocFactory<ReturnByAssetDecision.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ReturnByAssetDecision.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ReturnByAssetDecision.Model>

    if (process.env.SOURCE === 'local') {
      template = ReturnByAssetDecision.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ReturnByAssetDecision.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await this.getCooperative(data.coopname, data.block_num)
    const vars = await this.getVars(data.coopname, data.block_num)
    const user = await this.getUser(data.username, data.block_num)

    const request = await this.getRequest(data.request_id, data.block_num)

    const decision = await this.getDecision(coop, data.coopname, data.decision_id, meta.created_at)
    const commonUser = this.getCommonUser(user)

    const combinedData: ReturnByAssetDecision.Model = {
      meta,
      coop,
      vars,
      user: commonUser,
      request,
      decision,
    }

    await this.validate(combinedData, template.model)
    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF(commonUser.full_name_or_short_name, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
