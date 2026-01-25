import { DraftContract } from 'cooptypes'
import { ResultContributionAct } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { ResultContributionAct as Template } from '../Templates'

export class Factory extends DocFactory<ResultContributionAct.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ResultContributionAct.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ResultContributionAct.Model>

    if (process.env.SOURCE === 'local') {
      template = ResultContributionAct.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ResultContributionAct.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const userData = await super.getUser(data.username, data.block_num)
    const common_user = super.getCommonUser(userData)

    const decision = await this.getApprovedDecision(coop, data.coopname, data.decision_id)

    const combinedData: ResultContributionAct.Model = {
      meta,
      coop,
      vars,
      decision,
      common_user,
      contributor_hash: data.contributor_hash,
      contributor_short_hash: super.constructUHDContractNumber(data.contributor_hash),
      contributor_created_at: data.contributor_created_at,
      blagorost_agreement_hash: data.blagorost_agreement_hash,
      blagorost_agreement_short_hash: this.getShortHash(data.blagorost_agreement_hash),
      blagorost_agreement_created_at: data.blagorost_agreement_created_at,
      result_act_hash: data.result_act_hash,
      result_act_short_hash: this.getShortHash(data.result_act_hash),
      result_hash: data.result_hash,
      percent_of_result: this.formatShare(data.percent_of_result),
      total_amount: data.total_amount,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
