import type { Filter, InsertOneResult, UpdateResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import type { MongoDBConnector } from '../Services/Databazor'
import DataService from '../Services/Databazor/DataService'
import { individualSchema } from '../Schema/IndividualSchema'
import { getCurrentBlock } from '../Utils/getCurrentBlock'

export type ExternalIndividualData = Cooperative.Users.IIndividualData
export type InternalIndividualData = ExternalIndividualData

export class Individual {
  individual?: ExternalIndividualData
  private data_service: DataService<InternalIndividualData>

  constructor(storage: MongoDBConnector, data?: ExternalIndividualData) {
    this.individual = data
    this.data_service = new DataService<InternalIndividualData>(storage, 'individuals')
  }

  validate(): ValidateResult {
    return new Validator(individualSchema, this.individual).validate()
  }

  async save(): Promise<InsertOneResult<InternalIndividualData>> {
    await this.validate()

    if (!this.individual)
      throw new Error('Данные физлица не предоставлены для сохранения')

    const currentBlock = await getCurrentBlock()

    const individual: InternalIndividualData = {
      ...this.individual,
      deleted: false,
      block_num: currentBlock,
    }

    return await this.data_service.save(individual)
  }

  async getOne(filter: Filter<InternalIndividualData>): Promise<ExternalIndividualData | null> {
    return this.data_service.getOne(filter)
  }

  async getMany(filter: Filter<InternalIndividualData>): Promise<Cooperative.Document.IGetResponse<ExternalIndividualData>> {
    return this.data_service.getMany(filter, 'username')
  }

  async getHistory(filter: Filter<InternalIndividualData>): Promise<ExternalIndividualData[]> {
    return this.data_service.getHistory(filter)
  }

  async del(filter: Filter<InternalIndividualData>): Promise<UpdateResult> {
    return this.data_service.updateMany(filter, { deleted: true })
  }
}
