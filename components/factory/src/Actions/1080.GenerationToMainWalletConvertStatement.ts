import { DraftContract } from 'cooptypes'
import { GenerationToMainWalletConvertStatement } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { GenerationToMainWalletConvertStatement as Template } from '../Templates'

export class Factory extends DocFactory<GenerationToMainWalletConvertStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: GenerationToMainWalletConvertStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<GenerationToMainWalletConvertStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = GenerationToMainWalletConvertStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, GenerationToMainWalletConvertStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const userData = await super.getUser(data.username, data.block_num)
    const common_user = super.getCommonUser(userData)

    const combinedData: GenerationToMainWalletConvertStatement.Model = {
      meta,
      coop,
      vars,
      common_user,
      contributor_hash: data.contributor_hash,
      contributor_short_hash: super.constructUHDContractNumber(data.contributor_hash),
      contributor_created_at: data.contributor_created_at,
      appendix_hash: data.appendix_hash,
      appendix_short_hash: this.getShortHash(data.appendix_hash),
      project_hash: data.project_hash,
      project_short_hash: this.getShortHash(data.project_hash),
      main_wallet_amount: data.main_wallet_amount,
      blagorost_wallet_amount: data.blagorost_wallet_amount,
      to_wallet: data.to_wallet,
      to_blagorost: data.to_blagorost,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}