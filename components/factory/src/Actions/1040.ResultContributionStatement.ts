import { DraftContract } from 'cooptypes'
import { ResultContributionStatement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { ResultContributionStatement as Template } from '../Templates'

export class Factory extends DocFactory<ResultContributionStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ResultContributionStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ResultContributionStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = ResultContributionStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ResultContributionStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const combinedData: ResultContributionStatement.Model = {meta}

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
