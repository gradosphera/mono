import { DraftContract } from 'cooptypes'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import DataService from '../Services/Databazor/DataService'
import { SelectBranchStatement } from '../Templates'
import { isEmpty } from '../Utils'

export { SelectBranchStatement as Template } from '../Templates'

export class Factory extends DocFactory<SelectBranchStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: SelectBranchStatement.Action, _options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<SelectBranchStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = SelectBranchStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, SelectBranchStatement.registry_id, data.block_num)
    }

    const user = await super.getUser(data.username, data.block_num)

    const userData = {
      [user.type]: {
        ...user.data,
      },
    }

    const coop = await super.getCooperative(data.coopname, data.block_num)

    if (coop.is_branched && !data.braname)
      throw new Error('Кооперативный участок должен быть указан')

    const branch = await super.getOrganization(data.braname, data.block_num)

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data }) // Генерируем мета-данные

    const vars = await super.getVars(data.coopname, data.block_num)

    if (!vars?.participant_application || isEmpty(vars.participant_application.protocol_number) || isEmpty(vars.participant_application.protocol_day_month_year))
      throw new Error('Реквизиты протокола для заявления на вступление не заполнены. Заполните номер и дату протокола в настройках кооператива.')

    const combinedData: SelectBranchStatement.Model = { ...userData, meta, branch, type: user.type, vars, coop }

    // валидируем скомбинированные данные
    await super.validate(combinedData, template.model)

    // получаем комплекс перевода
    const translation = template.translations[meta.lang]

    // генерируем документ
    const document: IGeneratedDocument = await super.generatePDF(user.data, template.context, combinedData, translation, meta, data.skip_save)

    return document
  }
}
