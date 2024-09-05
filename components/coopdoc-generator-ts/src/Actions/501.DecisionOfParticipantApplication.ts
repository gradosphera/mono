import { DraftContract } from 'cooptypes'
import { DocFactory } from '../Factory'
import type {
  IDecisionData,
  IGeneratedDocument,
  IMetaDocument,
  ITemplate,
} from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

import { DecisionOfParticipantApplication } from '../templates'

export class Factory extends DocFactory<DecisionOfParticipantApplication.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(
    options: DecisionOfParticipantApplication.Action,
  ): Promise<IGeneratedDocument> {
    let template: ITemplate<DecisionOfParticipantApplication.Model>

    if (process.env.SOURCE === 'local') {
      template = DecisionOfParticipantApplication.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, DecisionOfParticipantApplication.registry_id, options.block_num)
    }

    const user = await super.getUser(options.username, options.block_num)

    const userData = {
      [user.type]: user.data,
    }

    const coop = await super.getCooperative(options.coopname, options.block_num)

    // TODO необходимо строго типизировать мета-данные документов друг под друга!
    const meta: IMetaDocument = await super.getMeta({
      title: template.title,
      ...options,
    }) // Генерируем мета-данные

    const decision: IDecisionData = await super.getDecision(
      coop,
      options.coopname,
      options.decision_id,
      meta.created_at,
    )

    const combinedData: DecisionOfParticipantApplication.Model = {
      ...userData,
      meta,
      coop,
      type: user.type,
      decision,
    }

    // валидируем скомбинированные данные
    await super.validate(combinedData, template.model)

    // получаем комплекс перевода
    const translation = template.translations[meta.lang]

    // генерируем документ
    const document: IGeneratedDocument = await super.generatePDF(
      user.data,
      template.context,
      combinedData,
      translation,
      meta,
    )

    // сохраняем его в бд
    await super.saveDraft(document)

    // возвращаем
    return document
  }
}
