import { DraftContract } from 'cooptypes'
import { WalletAgreement } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { WalletAgreement as Template } from '../templates'

export class Factory extends DocFactory<WalletAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: WalletAgreement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<WalletAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = WalletAgreement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, WalletAgreement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const user = await super.getUser(data.username, data.block_num)

    const combinedData: WalletAgreement.Model = {
      meta,
      coop,
      vars,
    }

    await super.validate(combinedData, template.model)
    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await super.generatePDF(user.data, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
