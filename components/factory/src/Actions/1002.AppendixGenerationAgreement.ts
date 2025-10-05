import { DraftContract } from 'cooptypes'
import { AppendixGenerationAgreement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { AppendixGenerationAgreement as Template } from '../Templates'

export class Factory extends DocFactory<AppendixGenerationAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: AppendixGenerationAgreement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<AppendixGenerationAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = AppendixGenerationAgreement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, AppendixGenerationAgreement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const combinedData: AppendixGenerationAgreement.Model = { meta }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
