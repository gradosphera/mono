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
    const { template, vars } = await this.resolveParallel({
      template: () => process.env.SOURCE === 'local'
        ? Promise.resolve(BlagorostProgramTemplate.Template as ITemplate<BlagorostProgramTemplate.Model>)
        : this.getTemplate<BlagorostProgramTemplate.Model>(DraftContract.contractName.production, BlagorostProgramTemplate.registry_id, data.block_num),
      vars: () => this.getVars(data.coopname),
    })

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const combinedData: BlagorostProgramTemplate.Model = { meta, vars }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
