import { type Cooperative, DraftContract } from 'cooptypes'
import { DocFactory } from '../Factory'
import type {
  IGeneratedDocument,
  IGenerationOptions,
  IMetaDocument,
  ITemplate,
} from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

import { FreeDecision } from '../templates'

export { FreeDecision as Template } from '../templates'

export class Factory extends DocFactory<FreeDecision.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(
    data: FreeDecision.Action,
    options?: IGenerationOptions,
  ): Promise<IGeneratedDocument> {
    let template: ITemplate<FreeDecision.Model>

    if (process.env.SOURCE === 'local') {
      template = FreeDecision.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, FreeDecision.registry_id, data.block_num)
    }

    const user = await this.getUser(data.username, data.block_num)

    const userData = {
      [user.type]: user.data,
    }

    const coop = await this.getCooperative(data.coopname, data.block_num)

    // TODO необходимо строго типизировать мета-данные документов друг под друга!
    const meta: IMetaDocument = await this.getMeta({
      title: template.title,
      ...data,
    }) // Генерируем мета-данные

    const decision: Cooperative.Document.IDecisionData = await this.getDecision(
      coop,
      data.coopname,
      data.decision_id,
      meta.created_at,
    )

    const project: Cooperative.Document.IProjectData = await this.getProject(data.project_id, data.block_num)

    const combinedData: FreeDecision.Model = {
      ...userData,
      meta,
      coop,
      decision,
      project,
    }

    // валидируем скомбинированные данные
    await this.validate(combinedData, template.model)

    // получаем комплекс перевода
    const translation = template.translations[meta.lang]

    // генерируем документ
    const document: IGeneratedDocument = await this.generatePDF(
      project.header,
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
