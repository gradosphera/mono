import type { Filter, InsertOneResult, UpdateResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import DataService from '../Services/Databazor/DataService'
import type { MongoDBConnector } from '../Services/Databazor'
import { organizationSchema } from '../Schema'
import { getCurrentBlock } from '../Utils/getCurrentBlock'

export type ExternalOrganizationData = Cooperative.Users.IOrganizationData

export type InternalOrganizationData = Cooperative.Users.IOrganizationData
// Omit<ExternalOrganizationData, 'bank_account'> & {
//   bank_account?: Cooperative.Payments.IBankAccount
// }

export class Organization {
  db: MongoDBConnector
  organization?: ExternalOrganizationData
  private data_service: DataService<InternalOrganizationData>

  constructor(storage: MongoDBConnector, data?: ExternalOrganizationData) {
    this.db = storage
    this.organization = data
    this.data_service = new DataService<InternalOrganizationData>(storage, 'organizations')
  }

  validate(): ValidateResult {
    return new Validator(organizationSchema, this.organization as ExternalOrganizationData).validate()
  }

  async save(): Promise<InsertOneResult<InternalOrganizationData>> {
    await this.validate()

    if (!this.organization)
      throw new Error('Данные организации не предоставлены для сохранения')

    const { ...organization_for_save } = this.organization
    const currentBlock = await getCurrentBlock()

    // const bankData: PaymentData = {
    //   username: this.organization.username,
    //   method_id: new UUID().toString(),
    //   method_type: 'bank_transfer',
    //   is_default: true,
    //   data: bank_account,
    //   deleted: false,
    //   block_num: currentBlock,
    // }

    // const paymentMethod = await new PaymentMethod(this.db, bankData)
    // await paymentMethod.validate()
    // await paymentMethod.save()

    const orgForSave: InternalOrganizationData = {
      ...organization_for_save,
      deleted: false,
      block_num: currentBlock,
    }

    return await this.data_service.save(orgForSave)
  }

  async getOne(filter: Filter<InternalOrganizationData>): Promise<ExternalOrganizationData | null> {
    const org = await this.data_service.getOne(filter)
    // const blockFilter = filter.block_num ? { block_num: filter.block_num } : {}

    // if (org) {
    //   org.bank_account = (await (new PaymentMethod(this.db).getOne({ ...blockFilter, username: org.username, method_type: 'bank_transfer', is_default: true })))?.data as IBankAccount
    // }

    return org as ExternalOrganizationData
  }

  async getMany(filter: Filter<InternalOrganizationData>): Promise<Cooperative.Document.IGetResponse<ExternalOrganizationData>> {
    const response = (await this.data_service.getMany({ deleted: false, ...filter }, 'username'))
    const orgs = response.results
    // const blockFilter = filter.block_num ? { block_num: filter.block_num } : {}

    // for (const org of orgs) {
    //   org.bank_account = (await (new PaymentMethod(this.db).getOne({ ...blockFilter, username: org.username, method_type: 'bank_transfer', is_default: true })))?.data as IBankAccount
    // }

    const result: Cooperative.Document.IGetResponse<ExternalOrganizationData> = {
      results: orgs as ExternalOrganizationData[],
      page: response.page,
      limit: response.limit,
      totalResults: response.totalResults,
      totalPages: response.totalPages,
    }

    return result
  }

  async getHistory(filter: Filter<InternalOrganizationData>): Promise<ExternalOrganizationData[]> {
    const orgs = await this.data_service.getHistory(filter)
    // const blockFilter = filter.block_num ? { block_num: filter.block_num } : {}

    // for (const org of orgs) {
    //   org.bank_account = (await (new PaymentMethod(this.db).getOne({ ...blockFilter, username: org.username, method_type: 'bank_transfer', is_default: true })))?.data as IBankAccount
    // }
    return orgs as ExternalOrganizationData[]
  }

  async del(filter: Filter<InternalOrganizationData>): Promise<UpdateResult> {
    return this.data_service.updateMany({ ...filter }, { deleted: true })
  }
}
