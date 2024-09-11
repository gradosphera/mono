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
      template = await this.getTemplate(options.coopname, WalletAgreement.registry_id, options.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...options })

    const combinedData: WalletAgreement.Model = {
      meta,
    }

    await super.validate(combinedData, template.model)
    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(null, template.context, combinedData, translation, meta)
    await super.saveDraft(document)
    return document
  }
}
