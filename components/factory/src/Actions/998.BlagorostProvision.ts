import { DraftContract } from 'cooptypes'
import { BlagorostProvision } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { BlagorostProvision as Template } from '../Templates'

export class Factory extends DocFactory<BlagorostProvision.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: BlagorostProvision.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<BlagorostProvision.Model>

    if (process.env.SOURCE === 'local') {
      template = BlagorostProvision.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, BlagorostProvision.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const vars = await this.getVars(data.coopname)

    const combinedData: BlagorostProvision.Model = { meta, vars }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
