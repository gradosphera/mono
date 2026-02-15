import { Cooperative, DraftContract } from 'cooptypes'
import { GenerationMoneyInvestStatement } from '../Templates'
import { DocFactory } from '../Factory'
import { Udata } from '../Models/Udata'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { GenerationMoneyInvestStatement as Template } from '../Templates'

export class Factory extends DocFactory<GenerationMoneyInvestStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: GenerationMoneyInvestStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<GenerationMoneyInvestStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = GenerationMoneyInvestStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, GenerationMoneyInvestStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const userData = await super.getUser(data.username, data.block_num)
    const common_user = super.getCommonUser(userData)

    // Извлечение данных из Udata репозитория
    const udataService = new Udata(this.storage)

    const contributorContractUdata = await udataService.getOne({
      coopname: data.coopname,
      username: data.username,
      key: Cooperative.Model.UdataKey.BLAGOROST_CONTRIBUTOR_CONTRACT_NUMBER,
      block_num: data.block_num,
    })

    if (!contributorContractUdata?.value) {
      throw new Error('Данные договора УХД участника не найдены в Udata')
    }

    const contributorContractCreatedAtUdata = await udataService.getOne({
      coopname: data.coopname,
      username: data.username,
      key: Cooperative.Model.UdataKey.BLAGOROST_CONTRIBUTOR_CONTRACT_CREATED_AT,
      block_num: data.block_num,
    })

    if (!contributorContractCreatedAtUdata?.value) {
      throw new Error('Дата создания договора УХД участника не найдена в Udata')
    }

    const blagorostAgreementUdata = await udataService.getOne({
      coopname: data.coopname,
      username: data.username,
      key: Cooperative.Model.UdataKey.BLAGOROST_AGREEMENT_NUMBER,
      block_num: data.block_num,
    })

    if (!blagorostAgreementUdata?.value) {
      throw new Error('Данные соглашения благороста не найдены в Udata')
    }

    const blagorostAgreementCreatedAtUdata = await udataService.getOne({
      coopname: data.coopname,
      username: data.username,
      key: Cooperative.Model.UdataKey.BLAGOROST_AGREEMENT_CREATED_AT,
      block_num: data.block_num,
    })

    if (!blagorostAgreementCreatedAtUdata?.value) {
      throw new Error('Дата создания соглашения благороста не найдена в Udata')
    }

    const combinedData: GenerationMoneyInvestStatement.Model = {
      meta,
      coop,
      vars,
      common_user,
      appendix_hash: data.appendix_hash,
      short_appendix_hash: this.getShortHash(data.appendix_hash),
      contributor_contract_number: String(contributorContractUdata.value),
      contributor_contract_created_at: String(contributorContractCreatedAtUdata.value),
      appendix_created_at: data.appendix_created_at,
      project_hash: data.project_hash,
      amount: super.formatAsset(data.amount),
      blagorost_agreement_number: String(blagorostAgreementUdata.value),
      blagorost_agreement_created_at: String(blagorostAgreementCreatedAtUdata.value),
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
