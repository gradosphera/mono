import { DraftContract } from 'cooptypes'
import { StorageAgreement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { StorageAgreement as Template } from '../Templates'

export class Factory extends DocFactory<StorageAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: StorageAgreement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<StorageAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = StorageAgreement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, StorageAgreement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const userData = await super.getUser(data.username, data.block_num)
    const common_user = super.getCommonUser(userData)

    const combinedData: StorageAgreement.Model = {
      meta,
      coop,
      vars,
      common_user,
      storage_agreement_hash: data.storage_agreement_hash,
      contributor_hash: data.contributor_hash,
      contributor_short_hash: super.constructUHDContractNumber(data.contributor_hash),
      generator_agreement_hash: data.generator_agreement_hash,
      generator_agreement_short_hash: this.getShortHash(data.generator_agreement_hash),
      generator_agreement_created_at: data.generator_agreement_created_at,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
