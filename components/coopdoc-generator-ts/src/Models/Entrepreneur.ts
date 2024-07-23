import type { DeleteResult, Filter, InsertOneResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import type { MongoDBConnector } from '../Services/Databazor'
import DataService from '../Services/Databazor/DataService'
import { entrepreneurSchema } from '../Schema/EntrepreneurSchema'

export type EntrepreneurData = Cooperative.Users.IEntrepreneurData

export class Entrepreneur {
  entrepreneur?: EntrepreneurData
  private data_service: DataService<EntrepreneurData>

  constructor(storage: MongoDBConnector, data?: EntrepreneurData) {
    this.entrepreneur = data
    this.data_service = new DataService<EntrepreneurData>(storage, 'EntrepreneurData')
  }

  validate(): ValidateResult {
    return new Validator(entrepreneurSchema, this.entrepreneur as EntrepreneurData).validate()
  }

  async save(): Promise<InsertOneResult<EntrepreneurData>> {
    await this.validate()
    return await this.data_service.save(this.entrepreneur as EntrepreneurData)
  }

  async getOne(filter: Filter<EntrepreneurData>): Promise<EntrepreneurData | null> {
    return this.data_service.getOne(filter)
  }

  async getMany(filter: Filter<EntrepreneurData>): Promise<EntrepreneurData[]> {
    return this.data_service.getMany(filter, 'username')
  }

  async getHistory(filter: Filter<EntrepreneurData>): Promise<EntrepreneurData[]> {
    return this.data_service.getHistory(filter)
  }

  async del(filter: Filter<EntrepreneurData>): Promise<DeleteResult> {
    return this.data_service.deleteMany(filter)
  }
}
