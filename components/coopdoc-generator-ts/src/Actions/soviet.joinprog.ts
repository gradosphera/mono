import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IMetaDocument } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import { DocumentsRegistry } from '../Templates'
import type { IGenerateJoinProgram } from '../Interfaces/Actions'
import type { IJoinProgram } from '../Templates/1000.ProgramProvision'

export class JoinProgramTemplateFactory extends DocFactory {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(options: IGenerateJoinProgram): Promise<IGeneratedDocument> {
    // TODO
    /**
     * Получаем шаблон программы по registry_id из options (registry_id)
     * Получаем из бд парсера
     */

    let template

    if (process.env.SOURCE === 'local') {
      template = DocumentsRegistry[options.registry_id as keyof typeof DocumentsRegistry]
    }
    else {
      template = await this.getTemplate(options.registry_id, options.block_num)
    }

    const coop = await super.getCooperative(options.coopname, options.block_num)

    const meta: IMetaDocument = await super.getMeta({
      title: template.title,
      ...options,
    }) // Генерируем мета-данные

    const combinedData: IJoinProgram = {
      meta,
      coop,
      protocol_number: options.protocol_number,
      protocol_day_month_year: options.protocol_day_month_year,
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
