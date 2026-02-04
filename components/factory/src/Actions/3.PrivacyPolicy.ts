import { DraftContract } from 'cooptypes'
import { PrivacyPolicy } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import { isEmpty } from '../Utils'

export { PrivacyPolicy as Template } from '../Templates'

export class Factory extends DocFactory<PrivacyPolicy.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: PrivacyPolicy.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<PrivacyPolicy.Model>

    if (process.env.SOURCE === 'local') {
      template = PrivacyPolicy.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, PrivacyPolicy.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    if (!vars?.privacy_agreement || isEmpty(vars.privacy_agreement.protocol_number) || isEmpty(vars.privacy_agreement.protocol_day_month_year))
      throw new Error('Реквизиты протокола по политике конфиденциальности не заполнены. Добавьте номер и дату протокола в настройках кооператива.')

    const combinedData: PrivacyPolicy.Model = {
      meta,
      coop,
      vars,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
