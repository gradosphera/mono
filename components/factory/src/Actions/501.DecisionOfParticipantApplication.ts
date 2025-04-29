import { type Cooperative, DraftContract } from 'cooptypes'
import { DocFactory } from '../Factory'
import type {
  IGeneratedDocument,
  IGenerationOptions,
  IMetaDocument,
  ITemplate,
} from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

import { DecisionOfParticipantApplication } from '../Templates'

export { DecisionOfParticipantApplication as Template } from '../Templates'

export class Factory extends DocFactory<DecisionOfParticipantApplication.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(
    data: DecisionOfParticipantApplication.Action,
    options?: IGenerationOptions,
  ): Promise<IGeneratedDocument> {
    let template: ITemplate<DecisionOfParticipantApplication.Model>

    if (process.env.SOURCE === 'local') {
      template = DecisionOfParticipantApplication.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, DecisionOfParticipantApplication.registry_id, data.block_num)
    }

    const user = await super.getUser(data.username, data.block_num)

    const userData = {
      [user.type]: user.data,
    }

    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    // TODO необходимо строго типизировать мета-данные документов друг под друга!
    const meta: IMetaDocument = await super.getMeta({
      title: template.title,
      ...data,
    }) // Генерируем мета-данные

    const decision: Cooperative.Document.IDecisionData = await super.getDecision(
      coop,
      data.coopname,
      data.decision_id,
      meta.created_at,
    )

    const combinedData: DecisionOfParticipantApplication.Model = {
      ...userData,
      vars,
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
      options?.skip_save,
    )

    // возвращаем
    return document
  }
}
