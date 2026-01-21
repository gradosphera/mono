import { DraftContract } from 'cooptypes'
import { GeneratorProgramTemplate } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { GeneratorProgramTemplate as Template } from '../Templates'

export class Factory extends DocFactory<GeneratorProgramTemplate.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: GeneratorProgramTemplate.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<GeneratorProgramTemplate.Model>

    if (process.env.SOURCE === 'local') {
      template = GeneratorProgramTemplate.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, GeneratorProgramTemplate.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const vars = await this.getVars(data.coopname)
    const coop = await this.getCooperative(data.coopname)

    const combinedData: GeneratorProgramTemplate.Model = {
      meta,
      coop,
      vars,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
