import { DraftContract } from 'cooptypes'
import { BlagorostOfferTemplate } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { BlagorostOfferTemplate as Template } from '../Templates'

export class Factory extends DocFactory<BlagorostOfferTemplate.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: BlagorostOfferTemplate.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<BlagorostOfferTemplate.Model>

    if (process.env.SOURCE === 'local') {
      template = BlagorostOfferTemplate.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, BlagorostOfferTemplate.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })

    const vars = await this.getVars(data.coopname)
    const coop = await this.getCooperative(data.coopname)

    // Проверяем наличие данных протокола, утвердившего Положение (документ 998)
    if (!vars.blagorost_provision?.protocol_number || !vars.blagorost_provision?.protocol_date) {
      throw new Error('Данные протокола об утверждении Положения о ЦПП «БЛАГОРОСТ» не найдены. Сначала утвердите Положение и сохраните данные протокола.')
    }

    const blagorost_provision = {
      protocol_number: vars.blagorost_provision.protocol_number,
      protocol_date: vars.blagorost_provision.protocol_date,
    }

    const combinedData: BlagorostOfferTemplate.Model = {
      meta,
      coop,
      vars,
      blagorost_provision,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
