import { DraftContract } from 'cooptypes'
import { BlagorostProgramTemplate } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { BlagorostProgramTemplate as Template } from '../Templates'

export class Factory extends DocFactory<BlagorostProgramTemplate.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: BlagorostProgramTemplate.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<BlagorostProgramTemplate.Model>

    if (process.env.SOURCE === 'local') {
      template = BlagorostProgramTemplate.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, BlagorostProgramTemplate.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const vars = await this.getVars(data.coopname)

    const combinedData: BlagorostProgramTemplate.Model = { meta, vars }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
