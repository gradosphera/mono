import { type Cooperative, DraftContract } from 'cooptypes'
import moment from 'moment-timezone'
import { AnnualGeneralMeetingVotingBallot } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { AnnualGeneralMeetingVotingBallot as Template } from '../Templates'

export class Factory extends DocFactory<AnnualGeneralMeetingVotingBallot.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: AnnualGeneralMeetingVotingBallot.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<AnnualGeneralMeetingVotingBallot.Model>

    if (process.env.SOURCE === 'local') {
      template = AnnualGeneralMeetingVotingBallot.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, AnnualGeneralMeetingVotingBallot.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    // Извлекаем данные пользователя и преобразуем в общий формат
    const userData = await super.getUser(data.username, data.block_num)
    const user = super.getCommonUser(userData)

    // Извлекаем данные собрания из блокчейна по хэшу
    const meet = await super.getMeet(data.coopname, data.meet_hash, data.block_num)

    // Данные уже приходят отформатированными из метода getMeet,
    // дополнительная обработка времени не требуется

    // Получаем вопросы из блокчейна
    const meetQuestions = await super.getMeetQuestions(data.coopname, Number(meet.id), data.block_num)

    // Преобразуем вопросы из блокчейна в формат, нужный для модели
    const questions = meetQuestions.map(question => ({
      id: question.id.toString(),
      number: question.number.toString(),
      title: question.title,
      context: question.context || '',
      decision: question.decision,
    }))

    // Получаем ответы из входных данных
    const { answers } = data

    // Создаем модель для генерации документа
    const combinedData: AnnualGeneralMeetingVotingBallot.Model = {
      meta,
      coop,
      vars,
      user,
      meet,
      answers,
      questions,
    } as AnnualGeneralMeetingVotingBallot.Model // Используем приведение типов для решения проблемы совместимости

    console.dir(combinedData, { depth: null })

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(
      user.full_name_or_short_name,
      template.context,
      combinedData,
      translation,
      meta,
      options?.skip_save,
    )

    return document
  }
}
