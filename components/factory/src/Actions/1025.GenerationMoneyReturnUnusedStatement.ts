import { Cooperative, DraftContract } from 'cooptypes'
import { GenerationMoneyReturnUnusedStatement } from '../Templates'
import { DocFactory } from '../Factory'
import { Udata } from '../Models/Udata'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { GenerationMoneyReturnUnusedStatement as Template } from '../Templates'

export class Factory extends DocFactory<GenerationMoneyReturnUnusedStatement.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: GenerationMoneyReturnUnusedStatement.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<GenerationMoneyReturnUnusedStatement.Model>

    if (process.env.SOURCE === 'local') {
      template = GenerationMoneyReturnUnusedStatement.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, GenerationMoneyReturnUnusedStatement.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
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

    const generatorAgreementUdata = await udataService.getOne({
      coopname: data.coopname,
      username: data.username,
      key: Cooperative.Model.UdataKey.GENERATOR_AGREEMENT_NUMBER,
      block_num: data.block_num,
    })

    if (!generatorAgreementUdata?.value) {
      throw new Error('Данные генерационного соглашения не найдены в Udata')
    }

    const generatorAgreementCreatedAtUdata = await udataService.getOne({
      coopname: data.coopname,
      username: data.username,
      key: Cooperative.Model.UdataKey.GENERATOR_AGREEMENT_CREATED_AT,
      block_num: data.block_num,
    })

    if (!generatorAgreementCreatedAtUdata?.value) {
      throw new Error('Дата создания генерационного соглашения не найдена в Udata')
    }

    const combinedData: GenerationMoneyReturnUnusedStatement.Model = {
      meta,
      vars,
      common_user,
      contributor_contract_number: String(contributorContractUdata.value),
      contributor_contract_created_at: String(contributorContractCreatedAtUdata.value),
      generator_agreement_number: String(generatorAgreementUdata.value),
      generator_agreement_created_at: String(generatorAgreementCreatedAtUdata.value),
      project_hash: data.project_hash,
      amount: data.amount,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
