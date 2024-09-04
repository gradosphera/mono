import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IMetaDocument } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import { DocumentsRegistry } from '../Templates'
import type { IGenerateAgreement } from '../Interfaces/Actions'
import type { Interface } from '../Templates/1.WalletAgreement'

export class Factory extends DocFactory {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(options: IGenerateAgreement): Promise<IGeneratedDocument> {
    let template

    if (process.env.SOURCE === 'local') {
      template = DocumentsRegistry[options.registry_id as keyof typeof DocumentsRegistry]
    }
    else {
      template = await this.getTemplate(options.coopname, options.registry_id, options.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({
      title: template.title,
      ...options,
    }) // Генерируем мета-данные

    const combinedData: Interface = {
      meta,
    }

    // валидируем скомбинированные данные
    await super.validate(combinedData, template.model)

    // получаем комплекс перевода
    const translation = template.translations[meta.lang]

    // генерируем документ
    const document: IGeneratedDocument = await super.generatePDF(null, template.context, combinedData, translation, meta)

    // сохраняем его в бд
    await super.saveDraft(document)

    return document
  }
}
