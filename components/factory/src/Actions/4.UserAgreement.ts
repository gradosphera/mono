import { DraftContract } from 'cooptypes'
import { UserAgreement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import { isEmpty } from '../Utils'

export { UserAgreement as Template } from '../Templates'

export class Factory extends DocFactory<UserAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: UserAgreement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<UserAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = UserAgreement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, UserAgreement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const user = await super.getUser(data.username, data.block_num)
    const full_name = super.getFullName(user.data)

    if (!vars?.user_agreement || isEmpty(vars.user_agreement.protocol_number) || isEmpty(vars.user_agreement.protocol_day_month_year))
      throw new Error('Реквизиты протокола по пользовательскому соглашению не заполнены. Укажите номер и дату протокола в настройках кооператива.')

    const combinedData: UserAgreement.Model = {
      meta,
      coop,
      vars,
      user: {
        full_name,
      },
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
