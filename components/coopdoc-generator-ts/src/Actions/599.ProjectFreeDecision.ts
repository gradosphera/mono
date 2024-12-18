import { type Cooperative, DraftContract } from 'cooptypes'
import { DocFactory } from '../Factory'
import type {
  IGeneratedDocument,
  IGenerationOptions,
  IMetaDocument,
  ITemplate,
} from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

import { ProjectFreeDecision } from '../templates'

export { ProjectFreeDecision as Template } from '../templates'

export class Factory extends DocFactory<ProjectFreeDecision.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(
    data: ProjectFreeDecision.Action,
    options?: IGenerationOptions,
  ): Promise<IGeneratedDocument> {
    let template: ITemplate<ProjectFreeDecision.Model>

    if (process.env.SOURCE === 'local') {
      template = ProjectFreeDecision.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ProjectFreeDecision.registry_id, data.block_num)
    }

    const user = await this.getUser(data.username, data.block_num)
    const suggester_name = await this.getFullName(user.data)
    const userData = {
      [user.type]: user.data,
    }

    const coop = await this.getCooperative(data.coopname, data.block_num)

    const meta: IMetaDocument = await this.getMeta({
      title: template.title,
      ...data,
    }) // Генерируем мета-данные

    const project: Cooperative.Document.IProjectData = await this.getProject(data.project_id, data.block_num)

    const combinedData: ProjectFreeDecision.Model = {
      ...userData,
      meta,
      coop,
      project,
      suggester_name,
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
