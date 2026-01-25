import { DraftContract } from 'cooptypes'
import { ComponentGenerationContract } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { ComponentGenerationContract as Template } from '../Templates'

export class Factory extends DocFactory<ComponentGenerationContract.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ComponentGenerationContract.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ComponentGenerationContract.Model>

    if (process.env.SOURCE === 'local') {
      template = ComponentGenerationContract.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ComponentGenerationContract.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)

    const userData = await super.getUser(data.username, data.block_num)
    const user = super.getCommonUser(userData)

    const combinedData: ComponentGenerationContract.Model = {
      meta,
      coop,
      vars,
      user,
      appendix_hash: data.appendix_hash,
      short_appendix_hash: this.getShortHash(data.appendix_hash),
      parent_appendix_hash: data.parent_appendix_hash,
      short_parent_appendix_hash: this.getShortHash(data.parent_appendix_hash),
      contributor_hash: data.contributor_hash,
      contributor_short_hash: super.constructUHDContractNumber(data.contributor_hash),
      contributor_created_at: data.contributor_created_at,
      component_name: data.component_name,
      component_hash: data.component_hash,
      project_name: data.project_name,
      project_hash: data.project_hash,
      generator_agreement_short_hash: data.generator_agreement_short_hash,
      generator_agreement_created_at: data.generator_agreement_created_at,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
