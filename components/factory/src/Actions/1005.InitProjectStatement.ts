import { DraftContract } from 'cooptypes'
import { InitProjectStatement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { InitProjectStatement as Template } from '../Templates'

export class Factory extends DocFactory<InitProjectStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: InitProjectStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<InitProjectStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = InitProjectStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, InitProjectStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    const userData = await super.getUser(data.username, data.block_num)
    const user = super.getCommonUser(userData)

    const combinedData: InitProjectStatement.Model = {
      meta,
      coop,
      vars,
      user,
      project_name: data.project_name,
      project_hash: data.project_hash,
      component_name: data.component_name,
      component_hash: data.component_hash,
      is_component: data.is_component,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
