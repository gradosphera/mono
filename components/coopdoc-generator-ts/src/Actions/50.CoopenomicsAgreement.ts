import { CoopenomicsAgreement } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { CoopenomicsAgreement as Template } from '../templates'

export class Factory extends DocFactory<CoopenomicsAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(options: CoopenomicsAgreement.Action): Promise<IGeneratedDocument> {
    let template: ITemplate<CoopenomicsAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = CoopenomicsAgreement.Template
    }
    else {
      template = await this.getTemplate(options.coopname, CoopenomicsAgreement.registry_id, options.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...options })
    const coop = await super.getCooperative(options.coopname, options.block_num)
    const covars = await super.getCovars(options.coopname, options.block_num)
    const partner = await super.getOrganization(options.coopname, options.block_num)

    const combinedData: CoopenomicsAgreement.Model = {
      meta,
      coop,
      covars,
      partner,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(null, template.context, combinedData, translation, meta)

    await super.saveDraft(document)

    return document
  }
}
