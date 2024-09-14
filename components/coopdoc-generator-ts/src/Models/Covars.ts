import type { Cooperative } from 'cooptypes'
import type { Filter, InsertOneResult, UpdateResult } from 'mongodb'
import type { IMetaDocument } from '../Interfaces'
import DataService from '../Services/Databazor/DataService'
import { type ValidateResult, Validator } from '../Services/Validator'
import { CovarsSchema } from '../Schema'
import type { MongoDBConnector } from '../Services/Databazor'
import { getCurrentBlock } from '../Utils/getCurrentBlock'

export type ICovars = Cooperative.Model.ICovars

export class Covars {
  data?: ICovars
  private data_service: DataService<ICovars>

  constructor(storage: MongoDBConnector, data?: ICovars) {
    this.data = data
    this.data_service = new DataService<ICovars>(storage, 'covars')
  }

  validate(): ValidateResult {
    return new Validator(CovarsSchema, this.data).validate()
  }

  async save(): Promise<InsertOneResult<ICovars>> {
    await this.validate()

    if (!this.data)
      throw new Error('Данные переменных не предоставлены для сохранения')

    const currentBlock = await getCurrentBlock()

    const covar: ICovars = {
      ...this.data,
      deleted: false,
      block_num: currentBlock,
    }

    return await this.data_service.save(covar)
  }

  async getOne(filter: Filter<ICovars>): Promise<ICovars | null> {
    return this.data_service.getOne(filter)
  }

  async getMany(filter: Filter<ICovars>): Promise<Cooperative.Document.IGetResponse<ICovars>> {
    return this.data_service.getMany(filter, 'coopname') // группировка по coopname
  }

  async getHistory(filter: Filter<ICovars>): Promise<ICovars[]> {
    return this.data_service.getHistory(filter)
  }

  async del(filter: Filter<ICovars>): Promise<UpdateResult> {
    return this.data_service.updateMany(filter, { deleted: true })
  }
}
