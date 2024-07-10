import type { JSONSchemaType } from 'ajv'
import type { Filter, InsertOneResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import DataService from '../Services/Databazor/DataService'
import type { MongoDBConnector } from '../Services/Databazor'
import { BankAccountSchema } from '../Schema/BankAccount'

export type OrganizationData = Cooperative.Users.IOrganizationData

export const organizationSchema: JSONSchemaType<OrganizationData> = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    type: { type: 'string', enum: ['coop', 'ooo', 'oao', 'zao', 'pao', 'ao'] },
    is_cooperative: { type: 'boolean' },
    short_name: { type: 'string' },
    full_name: { type: 'string' },
    represented_by: {
      type: 'object',
      required: ['first_name', 'last_name', 'position', 'based_on'],
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        middle_name: { type: 'string' },
        position: { type: 'string' },
        based_on: { type: 'string' },
        // signature: { type: 'string' },
      },
      additionalProperties: true,
    },
    country: { type: 'string', enum: ['Russia', 'Other'] },
    city: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    full_address: { type: 'string' },
    details: {
      type: 'object',
      required: ['inn', 'ogrn'],
      properties: {
        inn: { type: 'string' },
        ogrn: { type: 'string' },
      },
      additionalProperties: true,
    },
    bank_account: {
      type: 'object',
      required: BankAccountSchema.required,
      properties: BankAccountSchema.properties,
    },
  },
  required: ['username', 'type', 'is_cooperative', 'short_name', 'full_name', 'represented_by', 'country', 'city', 'full_address', 'email', 'phone', 'details', 'bank_account'],
  additionalProperties: true,
}

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
    return this.data_service.getMany(filter)
  }

  async getHistory(filter: Filter<OrganizationData>): Promise<OrganizationData[]> {
    return this.data_service.getHistory(filter)
  }
}
