import { DraftContract } from 'cooptypes'
import { AnnualGeneralMeetingAgenda } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { AnnualGeneralMeetingAgenda as Template } from '../Templates'

export class Factory extends DocFactory<AnnualGeneralMeetingAgenda.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: AnnualGeneralMeetingAgenda.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<AnnualGeneralMeetingAgenda.Model>

    if (process.env.SOURCE === 'local') {
      template = AnnualGeneralMeetingAgenda.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, AnnualGeneralMeetingAgenda.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    // Используем данные напрямую из Action, так как собрание еще не создано в блокчейне
    const { meet, questions } = data

    const combinedData: AnnualGeneralMeetingAgenda.Model = {
      meta,
      coop,
      vars,
      meet,
      questions,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(
      `${meet.presider_last_name} ${meet.presider_first_name} ${meet.presider_middle_name}`,
      template.context,
      combinedData,
      translation,
      meta,
      options?.skip_save,
    )

    return document
  }
}
