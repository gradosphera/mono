import { DraftContract } from 'cooptypes'
import { RegulationElectronicSignature } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import { isEmpty } from '../Utils'

export { RegulationElectronicSignature as Template } from '../Templates'

export class Factory extends DocFactory<RegulationElectronicSignature.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: RegulationElectronicSignature.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<RegulationElectronicSignature.Model>

    if (process.env.SOURCE === 'local') {
      template = RegulationElectronicSignature.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, RegulationElectronicSignature.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const user = await super.getUser(data.username, data.block_num)

    if (!vars?.signature_agreement || isEmpty(vars.signature_agreement.protocol_number) || isEmpty(vars.signature_agreement.protocol_day_month_year))
      throw new Error('Реквизиты протокола по простой электронной подписи не заполнены. Добавьте номер и дату протокола в настройках кооператива.')

    const combinedData: RegulationElectronicSignature.Model = {
      meta,
      coop,
      vars,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(user.data, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
