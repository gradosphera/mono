import { type Filter, type InsertOneResult, UUID, type UpdateResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import type { MongoDBConnector } from '../Services/Databazor'
import DataService from '../Services/Databazor/DataService'
import { entrepreneurSchema } from '../Schema/EntrepreneurSchema'
import type { IBankAccount } from '../Interfaces'
import { getCurrentBlock } from '../Utils/getCurrentBlock'
import type { PaymentData } from './PaymentMethod'
import { PaymentMethod } from './PaymentMethod'

export type ExternalEntrepreneurData = Cooperative.Users.IEntrepreneurData

export type InternalEntrepreneurData = Omit<ExternalEntrepreneurData, 'bank_account'> & {
  bank_account?: Cooperative.Payments.IBankAccount
}

export class Entrepreneur {
  db: MongoDBConnector
  entrepreneur?: ExternalEntrepreneurData
  private data_service: DataService<InternalEntrepreneurData>

  constructor(storage: MongoDBConnector, data?: ExternalEntrepreneurData) {
    this.db = storage
    this.entrepreneur = data
    this.data_service = new DataService<InternalEntrepreneurData>(storage, 'entrepreneurs')
  }

  validate(): ValidateResult {
    return new Validator(entrepreneurSchema, this.entrepreneur).validate()
  }

  async save(): Promise<InsertOneResult<InternalEntrepreneurData>> {
    await this.validate()

    if (!this.entrepreneur)
      throw new Error('Данные ИП не предоставлены для сохранения')

    const { bank_account, ...entr_for_save } = this.entrepreneur

    const currentBlock = await getCurrentBlock()

    const bankData: PaymentData = {
      username: this.entrepreneur.username,
      method_id: new UUID().toString(),
      method_type: 'bank_transfer',
      is_default: true,
      data: bank_account as Cooperative.Payments.IBankAccount,
      deleted: false,
      block_num: currentBlock,
    }

    const paymentMethod = await new PaymentMethod(this.db, bankData)
    await paymentMethod.validate()
    await paymentMethod.save()

    const entrForSave: InternalEntrepreneurData = {
      ...entr_for_save,
      deleted: false,
      block_num: currentBlock,
    }

    return await this.data_service.save(entrForSave)
  }

  async getOne(filter: Filter<InternalEntrepreneurData>): Promise<ExternalEntrepreneurData | null> {
    const entr = await this.data_service.getOne(filter)
    const blockFilter = filter.block_num ? { block_num: filter.block_num } : {}

    if (entr)
      entr.bank_account = (await (new PaymentMethod(this.db).getOne({ ...blockFilter, username: entr.username, method_type: 'bank_transfer', is_default: true })))?.data as IBankAccount
    return entr as ExternalEntrepreneurData
  }

  async getMany(filter: Filter<InternalEntrepreneurData>): Promise<Cooperative.Document.IGetResponse<ExternalEntrepreneurData>> {
    const response = await this.data_service.getMany({ deleted: false, ...filter }, 'username')
    const entrepreneurs = response.results
    const blockFilter = filter.block_num ? { block_num: filter.block_num } : {}

    for (const entr of entrepreneurs) {
      entr.bank_account = (await (new PaymentMethod(this.db).getOne({ ...blockFilter, username: entr.username, method_type: 'bank_transfer', is_default: true })))?.data as IBankAccount
    }

    const result: Cooperative.Document.IGetResponse<ExternalEntrepreneurData> = {
      results: entrepreneurs as ExternalEntrepreneurData[],
      page: response.page,
      limit: response.limit,
      totalResults: response.totalResults,
      totalPages: response.totalPages,
    }

    return result
  }

  async getHistory(filter: Filter<InternalEntrepreneurData>): Promise<ExternalEntrepreneurData[]> {
    const history = await this.data_service.getHistory(filter)
    const blockFilter = filter.block_num ? { block_num: filter.block_num } : {}

    for (const entr of history) {
      entr.bank_account = (await (new PaymentMethod(this.db).getOne({ ...blockFilter, username: entr.username, method_type: 'bank_transfer', is_default: true })))?.data as IBankAccount
    }

    return history as ExternalEntrepreneurData[]
  }

  async del(filter: Filter<InternalEntrepreneurData>): Promise<UpdateResult> {
    return this.data_service.updateMany({ ...filter, deleted: false }, { deleted: true })
  }
}
