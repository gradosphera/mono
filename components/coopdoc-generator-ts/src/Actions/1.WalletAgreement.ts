import { DraftContract } from 'cooptypes'
import { WalletAgreement } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { WalletAgreement as Template } from '../templates'

export class Factory extends DocFactory<WalletAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(options: WalletAgreement.Action): Promise<IGeneratedDocument> {
    let template: ITemplate<WalletAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = WalletAgreement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, WalletAgreement.registry_id, options.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...options })
    const coop = await super.getCooperative(options.coopname, options.block_num)
    const vars = await super.getVars(options.coopname, options.block_num)

    const combinedData: WalletAgreement.Model = {
      meta,
      coop,
      vars,
    }

    await super.validate(combinedData, template.model)
    const translation = template.translations[meta.lang]
    console.log('translation: ', translation)
    console.log('context: ', template.context)
    console.log('combined: ', combinedData)
    const document: IGeneratedDocument = await super.generatePDF(null, template.context, combinedData, translation, meta)
    await super.saveDraft(document)
    return document
  }
}
