import type { Cooperative } from 'cooptypes'
import type { Filter, InsertOneResult, UpdateResult } from 'mongodb'
import DataService from '../Services/Databazor/DataService'
import { type ValidateResult, Validator } from '../Services/Validator'
import { VarsSchema } from '../Schema'
import type { MongoDBConnector } from '../Services/Databazor'
import { getCurrentBlock } from '../Utils/getCurrentBlock'

export type IVars = Cooperative.Model.IVars

export class Vars {
  data?: IVars
  private data_service: DataService<IVars>

  constructor(storage: MongoDBConnector, data?: IVars) {
    this.data = data
    this.data_service = new DataService<IVars>(storage, 'vars')
  }

  validate(): ValidateResult {
    return new Validator(VarsSchema, this.data).validate()
  }

  async save(): Promise<InsertOneResult<IVars>> {
    await this.validate()

    if (!this.data)
      throw new Error('Данные переменных не предоставлены для сохранения')

    const currentBlock = await getCurrentBlock()

    const covar: IVars = {
      ...this.data,
      deleted: false,
      block_num: currentBlock,
    }

    return await this.data_service.save(covar)
  }

  async getOne(filter: Filter<IVars>): Promise<IVars | null> {
    return this.data_service.getOne(filter)
  }

  async getMany(filter: Filter<IVars>): Promise<Cooperative.Document.IGetResponse<IVars>> {
    return this.data_service.getMany(filter, 'coopname') // группировка по coopname
  }

  async getHistory(filter: Filter<IVars>): Promise<IVars[]> {
    return this.data_service.getHistory(filter)
  }

  async del(filter: Filter<IVars>): Promise<UpdateResult> {
    return this.data_service.updateMany(filter, { deleted: true })
  }
}
