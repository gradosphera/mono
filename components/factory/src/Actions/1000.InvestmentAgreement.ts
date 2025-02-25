import { DraftContract } from 'cooptypes'
import { InvestmentAgreement } from '../templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import type { ExternalOrganizationData } from '../Models'

export { InvestmentAgreement as Template } from '../templates'

export class Factory extends DocFactory<InvestmentAgreement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: InvestmentAgreement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<InvestmentAgreement.Model>

    if (process.env.SOURCE === 'local') {
      template = InvestmentAgreement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, InvestmentAgreement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await this.getCooperative(data.coopname, data.block_num)
    const vars = await this.getVars(data.coopname, data.block_num)
    const user = await this.getUser(data.username, data.block_num)
    const commonUser = this.getCommonUser(user)

    const userData = {
      [user.type]: {
        ...user.data,
      },
    }

    // const date = this.parseDateForAgreements(meta.created_at)
    const uhdContract = this.constructUHDContract(meta.created_at)

    const subject = data.subject ?? vars.investment_agreement?.subject as string
    const terms = data.terms ?? vars.investment_agreement?.terms as string

    const coopBankAccount = await this.getBankAccount(data.coopname, meta.block_num)

    const combinedData: InvestmentAgreement.Model = {
      meta,
      coop,
      vars,
      user: commonUser,
      uhdContract,
      subject,
      terms,
      coopBankAccount,
      ...userData,
      type: user.type,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF(commonUser.full_name_or_short_name, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
