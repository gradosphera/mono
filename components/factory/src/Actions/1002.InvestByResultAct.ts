import { DraftContract } from 'cooptypes'
import { InvestByResultAct } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { InvestByResultAct as Template } from '../templates'

export class Factory extends DocFactory<InvestByResultAct.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: InvestByResultAct.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<InvestByResultAct.Model>

    if (process.env.SOURCE === 'local') {
      template = InvestByResultAct.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, InvestByResultAct.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await this.getCooperative(data.coopname, data.block_num)
    const vars = await this.getVars(data.coopname, data.block_num)
    const user = await this.getUser(data.username, data.block_num)
    const commonUser = this.getCommonUser(user)

    // TODO get CONTRACT creation date from BC
    const uhdContract = this.constructUHDContract(meta.created_at)

    const decision = await this.getDecision(
      coop,
      data.coopname,
      data.decision_id,
      meta.created_at,
    )

    // TODO: generate random act hash and put it to meta
    const act = {
      number: '123',
    }

    const combinedData: InvestByResultAct.Model = {
      meta,
      coop,
      vars,
      decision,
      user: commonUser,
      uhdContract,
      result: data.result,
      act,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF(commonUser.full_name_or_short_name, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
