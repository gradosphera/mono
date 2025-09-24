import { DraftContract } from 'cooptypes'
import { CapitalizationToMainWalletConvertStatement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { CapitalizationToMainWalletConvertStatement as Template } from '../Templates'

export class Factory extends DocFactory<CapitalizationToMainWalletConvertStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: CapitalizationToMainWalletConvertStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<CapitalizationToMainWalletConvertStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = CapitalizationToMainWalletConvertStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, CapitalizationToMainWalletConvertStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const combinedData: CapitalizationToMainWalletConvertStatement.Model = {meta}

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
