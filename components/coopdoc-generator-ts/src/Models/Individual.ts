import type { Filter, InsertOneResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import type { MongoDBConnector } from '../Services/Databazor'
import DataService from '../Services/Databazor/DataService'
import { individualSchema } from '../Schema/IndividualSchema'

export type IndividualData = Cooperative.Users.IIndividualData

export class Individual {
  individual?: IndividualData
  private data_service: DataService<IndividualData>

  constructor(storage: MongoDBConnector, data?: IndividualData) {
    this.individual = data
    this.data_service = new DataService<IndividualData>(storage, 'IndividualData')
  }

  validate(): ValidateResult {
    return new Validator(individualSchema, this.individual as IndividualData).validate()
  }

  async save(): Promise<InsertOneResult<IndividualData>> {
    await this.validate()
    return await this.data_service.save(this.individual as IndividualData)
  }

  async getOne(filter: Filter<IndividualData>): Promise<IndividualData | null> {
    return this.data_service.getOne(filter)
  }

  async getMany(filter: Filter<IndividualData>): Promise<IndividualData[]> {
    return this.data_service.getMany(filter)
  }

  async getHistory(filter: Filter<IndividualData>): Promise<IndividualData[]> {
    return this.data_service.getHistory(filter)
  }
}
