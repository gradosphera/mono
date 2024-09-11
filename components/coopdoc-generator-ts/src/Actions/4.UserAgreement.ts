import { UserAgreement } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { UserAgreement as Template } from '../templates'

export class Factory extends DocFactory<UserAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(options: UserAgreement.Action): Promise<IGeneratedDocument> {
    let template: ITemplate<UserAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = UserAgreement.Template
    }
    else {
      template = await this.getTemplate(options.coopname, UserAgreement.registry_id, options.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...options })

    const combinedData: UserAgreement.Model = {
      meta,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(null, template.context, combinedData, translation, meta)

    await super.saveDraft(document)

    return document
  }
}
