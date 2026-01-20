import { DraftContract } from 'cooptypes'
import { GeneratorOffer } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { GeneratorOffer as Template } from '../Templates'

export class Factory extends DocFactory<GeneratorOffer.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: GeneratorOffer.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<GeneratorOffer.Model>

    if (process.env.SOURCE === 'local') {
      template = GeneratorOffer.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, GeneratorOffer.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const vars = await this.getVars(data.coopname)
    const coop = await this.getCooperative(data.coopname)
    const user = await this.getUser(data.username, data.block_num)
    const common_user = this.getCommonUser(user)

    const combinedData: GeneratorOffer.Model = {
      meta,
      coop,
      vars,
      common_user,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}