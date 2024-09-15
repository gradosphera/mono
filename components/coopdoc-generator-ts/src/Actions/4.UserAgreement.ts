import { DraftContract } from 'cooptypes'
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
      template = await this.getTemplate(DraftContract.contractName.production, UserAgreement.registry_id, options.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...options })
    const coop = await super.getCooperative(options.coopname, options.block_num)
    const vars = await super.getVars(options.coopname, options.block_num)
    const user = await super.getUser(options.username, options.block_num)
    const full_name = super.getFullName(user.data)

    const combinedData: UserAgreement.Model = {
      meta,
      coop,
      vars,
      user: {
        full_name,
      },
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(null, template.context, combinedData, translation, meta)

    await super.saveDraft(document)

    return document
  }
}
