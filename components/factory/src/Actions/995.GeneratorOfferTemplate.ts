import { DraftContract } from 'cooptypes'
import { GeneratorOfferTemplate } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { GeneratorOfferTemplate as Template } from '../Templates'

export class Factory extends DocFactory<GeneratorOfferTemplate.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: GeneratorOfferTemplate.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<GeneratorOfferTemplate.Model>

    if (process.env.SOURCE === 'local') {
      template = GeneratorOfferTemplate.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, GeneratorOfferTemplate.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const vars = await this.getVars(data.coopname)
    const coop = await this.getCooperative(data.coopname)
    const user = await this.getUser(data.username, data.block_num)
    const common_user = this.getCommonUser(user)

    // Проверяем наличие данных протокола, утвердившего генерационную программу
    if (!vars.generator_program?.protocol_number || !vars.generator_program?.protocol_day_month_year) {
      throw new Error('Данные протокола об утверждении генерационной программы не найдены. Сначала утвердите генерационную программу и сохраните данные протокола.')
    }

    // Проверяем наличие данных протокола, утвердившего шаблон оферты генератора
    if (!vars.generator_offer_template?.protocol_number || !vars.generator_offer_template?.protocol_day_month_year) {
      throw new Error('Данные протокола об утверждении шаблона оферты генератора не найдены. Сначала утвердите шаблон оферты генератора и сохраните данные протокола.')
    }

    const combinedData: GeneratorOfferTemplate.Model = {
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
