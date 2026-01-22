import { DraftContract } from 'cooptypes'
import { BlagorostOffer } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { BlagorostOffer as Template } from '../Templates'

export class Factory extends DocFactory<BlagorostOffer.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: BlagorostOffer.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<BlagorostOffer.Model>

    if (process.env.SOURCE === 'local') {
      template = BlagorostOffer.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, 1000, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    // Для данного документа используем минимальную модель, но собираем все данные для шаблона
    const vars = await this.getVars(data.coopname)
    const coop = await this.getCooperative(data.coopname)
    const userData = await this.getUser(data.username, data.block_num)
    const common_user = this.getCommonUser(userData)

    // Проверяем наличие данных протоколов, утвердивших предыдущие документы
    if (!vars.blagorost_program?.protocol_number || !vars.blagorost_program?.protocol_day_month_year) {
      throw new Error('Данные протокола об утверждении Положения о ЦПП «БЛАГОРОСТ» не найдены. Сначала утвердите Положение и сохраните данные протокола.')
    }

    if (!vars.blagorost_offer_template?.protocol_number || !vars.blagorost_offer_template?.protocol_day_month_year) {
      throw new Error('Данные протокола об утверждении шаблона публичной оферты ЦПП «БЛАГОРОСТ» не найдены. Сначала утвердите шаблон оферты и сохраните данные протокола.')
    }

    const blagorost_program = {
      protocol_number: vars.blagorost_program.protocol_number,
      protocol_date: vars.blagorost_program.protocol_day_month_year,
    }

    const blagorost_offer_template = {
      protocol_number: vars.blagorost_offer_template.protocol_number,
      protocol_date: vars.blagorost_offer_template.protocol_day_month_year,
    }

    // Используем полную модель с дополнительными полями
    const combinedData: BlagorostOffer.Model = {
      meta,
      coop,
      vars,
      common_user,
      blagorost_program,
      blagorost_offer_template,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
