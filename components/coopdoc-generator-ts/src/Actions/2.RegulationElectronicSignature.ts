import { RegulationElectronicSignature } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { RegulationElectronicSignature as Template } from '../templates'

export class Factory extends DocFactory<RegulationElectronicSignature.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(options: RegulationElectronicSignature.Action): Promise<IGeneratedDocument> {
    let template: ITemplate<RegulationElectronicSignature.Model>

    if (process.env.SOURCE === 'local') {
      template = RegulationElectronicSignature.Template
    }
    else {
      template = await this.getTemplate(options.coopname, RegulationElectronicSignature.registry_id, options.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...options })
    const coop = await super.getCooperative(options.coopname, options.block_num)
    const covars = await super.getCovars(options.coopname, options.block_num)

    const combinedData: RegulationElectronicSignature.Model = {
      meta,
      coop,
      covars,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(null, template.context, combinedData, translation, meta)

    await super.saveDraft(document)

    return document
  }
}
