import { Cooperative, DraftContract } from 'cooptypes'
import { ResultContributionStatement } from '../Templates'
import { DocFactory } from '../Factory'
import { Udata } from '../Models/Udata'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { ResultContributionStatement as Template } from '../Templates'

export class Factory extends DocFactory<ResultContributionStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ResultContributionStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ResultContributionStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = ResultContributionStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ResultContributionStatement.registry_id, data.block_num)
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

    const combinedData: ResultContributionStatement.Model = {
      meta,
      coop,
      vars,
      common_user,
      contributor_contract_number: String(contributorContractUdata.value),
      contributor_contract_created_at: String(contributorContractCreatedAtUdata.value),
      blagorost_agreement_number: String(blagorostAgreementUdata.value),
      blagorost_agreement_created_at: String(blagorostAgreementCreatedAtUdata.value),
      project_name: data.project_name,
      component_name: data.component_name,
      result_hash: data.result_hash,
      result_short_hash: this.getShortHash(data.result_hash),
      percent_of_result: data.percent_of_result,
      total_amount: this.formatAsset(data.total_amount),
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
