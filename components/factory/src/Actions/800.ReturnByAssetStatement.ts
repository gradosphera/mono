import { DraftContract } from 'cooptypes'
import { ReturnByAssetStatement } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { ReturnByAssetStatement as Template } from '../templates'

export class Factory extends DocFactory<ReturnByAssetStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ReturnByAssetStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ReturnByAssetStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = ReturnByAssetStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ReturnByAssetStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await this.getCooperative(data.coopname, data.block_num)
    const vars = await this.getVars(data.coopname, data.block_num)
    const user = await this.getUser(data.username, data.block_num)

    const request = data.request

    const full_name = await this.getFullParticipantName(user.data)

    const combinedData: ReturnByAssetStatement.Model = {
      meta,
      coop,
      vars,
      user: {
        full_name,
      },
      request,
    }

    await this.validate(combinedData, template.model)
    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await super.generatePDF(full_name, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
