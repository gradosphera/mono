import { Cooperative, DraftContract } from 'cooptypes'
import { StorageAgreement } from '../Templates'
import { DocFactory } from '../Factory'
import { Udata } from '../Models/Udata'
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

    // Извлечение данных из Udata репозитория
    const udataService = new Udata(this.storage)

    const storageAgreementUdata = await udataService.getOne({
      coopname: data.coopname,
      username: data.username,
      key: Cooperative.Model.UdataKey.BLAGOROST_STORAGE_AGREEMENT_NUMBER,
      block_num: data.block_num,
    })

    if (!storageAgreementUdata?.value) {
      throw new Error('Хеш дополнительного соглашения по хранению имущества не найден в Udata')
    }

    const storageAgreementCreatedAtUdata = await udataService.getOne({
      coopname: data.coopname,
      username: data.username,
      key: Cooperative.Model.UdataKey.BLAGOROST_STORAGE_AGREEMENT_CREATED_AT,
      block_num: data.block_num,
    })

    if (!storageAgreementCreatedAtUdata?.value) {
      throw new Error('Дата создания дополнительного соглашения по хранению имущества не найдена в Udata')
    }

    const contributorContractUdata = await udataService.getOne({
      coopname: data.coopname,
      username: data.username,
      key: Cooperative.Model.UdataKey.BLAGOROST_CONTRIBUTOR_CONTRACT_NUMBER,
      block_num: data.block_num,
    })

    if (!contributorContractUdata?.value) {
      throw new Error('Данные договора УХД участника не найдены в Udata')
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

    const combinedData: StorageAgreement.Model = {
      meta,
      coop,
      vars,
      common_user,
      blagorost_storage_agreement_number: String(storageAgreementUdata.value),
      blagorost_storage_agreement_created_at: String(storageAgreementCreatedAtUdata.value),
      contributor_contract_number: String(contributorContractUdata.value),
      generator_agreement_number: String(generatorAgreementUdata.value),
      generator_agreement_created_at: String(generatorAgreementCreatedAtUdata.value),
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
