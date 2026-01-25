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

    // Проверяем наличие данных протокола, утвердившего генерационную программу
    if (!vars.generator_program?.protocol_number || !vars.generator_program?.protocol_day_month_year) {
      throw new Error('Данные протокола об утверждении генерационной программы не найдены. Сначала утвердите генерационную программу и сохраните данные протокола.')
    }

    // Проверяем наличие данных протокола, утвердившего шаблон оферты генератора
    if (!vars.generator_offer_template?.protocol_number || !vars.generator_offer_template?.protocol_day_month_year) {
      throw new Error('Данные протокола об утверждении шаблона оферты генератора не найдены. Сначала утвердите шаблон оферты генератора и сохраните данные протокола.')
    }

    const combinedData: GeneratorOffer.Model = {
      meta,
      coop,
      vars,
      common_user,
      generator_agreement_short_hash: this.getShortHash(data.generator_agreement_hash),
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
