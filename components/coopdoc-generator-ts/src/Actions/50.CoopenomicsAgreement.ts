import { DraftContract } from 'cooptypes'
import { CoopenomicsAgreement } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { CoopenomicsAgreement as Template } from '../templates'

export class Factory extends DocFactory<CoopenomicsAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: CoopenomicsAgreement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<CoopenomicsAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = CoopenomicsAgreement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, CoopenomicsAgreement.registry_id, data.block_num)
    }
    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })

    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const partner = await super.getOrganization(data.username, data.block_num)

    const combinedData: CoopenomicsAgreement.Model = {
      meta,
      coop,
      vars,
      partner,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(null, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
