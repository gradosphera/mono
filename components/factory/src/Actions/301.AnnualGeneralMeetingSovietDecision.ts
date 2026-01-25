import { DraftContract } from 'cooptypes'
import moment from 'moment-timezone'
import { AnnualGeneralMeetingSovietDecision } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { AnnualGeneralMeetingSovietDecision as Template } from '../Templates'

export class Factory extends DocFactory<AnnualGeneralMeetingSovietDecision.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: AnnualGeneralMeetingSovietDecision.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<AnnualGeneralMeetingSovietDecision.Model>

    if (process.env.SOURCE === 'local') {
      template = AnnualGeneralMeetingSovietDecision.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, AnnualGeneralMeetingSovietDecision.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    // Извлекаем данные уже принятого решения совета
    const decision = await super.getApprovedDecision(coop, data.coopname, data.decision_id)

    // Извлекаем данные собрания из блокчейна по хэшу
    const meet = await super.getMeet(data.coopname, data.meet_hash, data.block_num)
    const questions = await super.getMeetQuestions(data.coopname, Number(meet.id), data.block_num)

    // Данные уже приходят отформатированными из метода getMeet,
    // дополнительная обработка времени не требуется

    const combinedData: AnnualGeneralMeetingSovietDecision.Model = {
      meta,
      coop,
      vars,
      decision,
      meet,
      questions,
      is_repeated: data.is_repeated,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(
      `${coop.chairman.last_name} ${coop.chairman.first_name} ${coop.chairman.middle_name}`,
      template.context,
      combinedData,
      translation,
      meta,
      options?.skip_save,
    )

    return document
  }
}
