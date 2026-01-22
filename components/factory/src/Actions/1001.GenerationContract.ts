import { DraftContract } from 'cooptypes'
import { GenerationContract } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { GenerationContract as Template } from '../Templates'

export class Factory extends DocFactory<GenerationContract.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: GenerationContract.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<GenerationContract.Model>

    if (process.env.SOURCE === 'local') {
      template = GenerationContract.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, GenerationContract.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    // Проверяем наличие данных протокола, утвердившего генерационное соглашение
    if (!vars.generation_contract_template?.protocol_number || !vars.generation_contract_template?.protocol_day_month_year) {
      throw new Error('Данные протокола об утверждении генерационного соглашения не найдены. Сначала утвердите генерационное соглашение и сохраните данные протокола.')
    }

    const userData = await super.getUser(data.username, data.block_num)
    const user = super.getCommonUser(userData)

    const combinedData: GenerationContract.Model = {
      meta,
      coop,
      vars,
      user,
      short_contributor_hash: this.getShortHash(data.contributor_hash),
    }
    await this.validate(combinedData, template.model)
    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
