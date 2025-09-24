import { DraftContract } from 'cooptypes'
import { CapitalizationMoneyInvestStatement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { CapitalizationMoneyInvestStatement as Template } from '../Templates'

export class Factory extends DocFactory<CapitalizationMoneyInvestStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: CapitalizationMoneyInvestStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<CapitalizationMoneyInvestStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = CapitalizationMoneyInvestStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, CapitalizationMoneyInvestStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const combinedData: CapitalizationMoneyInvestStatement.Model = {meta}

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
