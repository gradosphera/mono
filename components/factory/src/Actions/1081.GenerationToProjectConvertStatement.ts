import { DraftContract } from 'cooptypes'
import { GenerationToProjectConvertStatement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { GenerationToProjectConvertStatement as Template } from '../Templates'

export class Factory extends DocFactory<GenerationToProjectConvertStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: GenerationToProjectConvertStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<GenerationToProjectConvertStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = GenerationToProjectConvertStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, GenerationToProjectConvertStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const combinedData: GenerationToProjectConvertStatement.Model = {meta}

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
