import { DraftContract } from 'cooptypes'
import { ProjectGenerationAgreement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { ProjectGenerationAgreement as Template } from '../Templates'

export class Factory extends DocFactory<ProjectGenerationAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ProjectGenerationAgreement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ProjectGenerationAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = ProjectGenerationAgreement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ProjectGenerationAgreement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    // Проверяем наличие данных протокола, утвердившего генерационное соглашение
    if (!vars.generation_agreement_template?.protocol_number || !vars.generation_agreement_template?.protocol_day_month_year) {
      throw new Error('Данные протокола об утверждении генерационного соглашения не найдены. Сначала утвердите генерационное соглашение и сохраните данные протокола.')
    }

    const userData = await super.getUser(data.username, data.block_num)
    const user = super.getCommonUser(userData)

    const combinedData: ProjectGenerationAgreement.Model = {
      meta,
      coop,
      vars,
      user,
      appendix_hash: data.appendix_hash,
      short_appendix_hash: this.getShortHash(data.appendix_hash),
      contributor_hash: data.contributor_hash,
      short_contributor_hash: this.getShortHash(data.contributor_hash),
      contributor_created_at: data.contributor_created_at,
      project_name: data.project_name,
      project_id: data.project_id,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
