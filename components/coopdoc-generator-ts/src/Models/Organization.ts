import type { DeleteResult, Filter, InsertOneResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import DataService from '../Services/Databazor/DataService'
import type { MongoDBConnector } from '../Services/Databazor'
import { organizationSchema } from '../Schema'

export type OrganizationData = Cooperative.Users.IOrganizationData

export class Organization {
  organization?: OrganizationData
  private data_service: DataService<OrganizationData>

  constructor(storage: MongoDBConnector, data?: OrganizationData) {
    this.organization = data
    this.data_service = new DataService<OrganizationData>(storage, 'OrgData')
  }

  validate(): ValidateResult {
    return new Validator(organizationSchema, this.organization as OrganizationData).validate()
  }

  async save(): Promise<InsertOneResult<OrganizationData>> {
    await this.validate()

    return await this.data_service.save(this.organization as OrganizationData)
  }

  async getOne(filter: Filter<OrganizationData>): Promise<OrganizationData | null> {
    return this.data_service.getOne(filter)
  }

  async getMany(filter: Filter<OrganizationData>): Promise<OrganizationData[]> {
    return this.data_service.getMany(filter, 'username')
  }

  async getHistory(filter: Filter<OrganizationData>): Promise<OrganizationData[]> {
    return this.data_service.getHistory(filter)
  }

  async del(filter: Filter<OrganizationData>): Promise<DeleteResult> {
    return this.data_service.deleteMany(filter)
  }
}
