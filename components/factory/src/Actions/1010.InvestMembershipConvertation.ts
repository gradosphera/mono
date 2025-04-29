import { DraftContract } from 'cooptypes'
import { InvestMembershipConvertation } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { InvestMembershipConvertation as Template } from '../Templates'

export class Factory extends DocFactory<InvestMembershipConvertation.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: InvestMembershipConvertation.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<InvestMembershipConvertation.Model>

    if (process.env.SOURCE === 'local') {
      template = InvestMembershipConvertation.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, InvestMembershipConvertation.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await this.getCooperative(data.coopname, data.block_num)
    const user = await this.getUser(data.username, data.block_num)
    const commonUser = this.getCommonUser(user)
    const vars = await this.getVars(data.coopname, data.block_num)

    // TODO get CONTRACT creation date from BC
    const uhdContract = this.constructUHDContract(meta.created_at)

    // TODO: generate it
    const appendix = { number: '123' }

    const combinedData: InvestMembershipConvertation.Model = {
      meta,
      coop,
      vars,
      user: commonUser,
      uhdContract,
      contribution: data.contribution,
      appendix,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF(commonUser.full_name_or_short_name, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
