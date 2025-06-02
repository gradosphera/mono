import { DraftContract } from 'cooptypes'
import { AnnualGeneralMeetingNotification } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { AnnualGeneralMeetingNotification as Template } from '../Templates'

export class Factory extends DocFactory<AnnualGeneralMeetingNotification.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: AnnualGeneralMeetingNotification.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<AnnualGeneralMeetingNotification.Model>

    if (process.env.SOURCE === 'local') {
      template = AnnualGeneralMeetingNotification.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, AnnualGeneralMeetingNotification.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    // Извлекаем данные собрания из блокчейна по хэшу
    const meet = await super.getMeet(data.coopname, data.meet_hash, data.block_num)
    const questions = await super.getMeetQuestions(data.coopname, Number(meet.id), data.block_num)

    const combinedData: AnnualGeneralMeetingNotification.Model = {
      meta,
      coop,
      vars,
      meet,
      questions,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(
      meet.presider,
      template.context,
      combinedData,
      translation,
      meta,
      options?.skip_save,
    )

    return document
  }
}
