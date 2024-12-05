import type { Filter, InsertOneResult, UpdateResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import DataService from '../Services/Databazor/DataService'
import type { MongoDBConnector } from '../Services/Databazor'
import type { IPaymentData } from '../Interfaces'
import { paymentMethodSchema } from '../Schema'
import { getCurrentBlock } from '../Utils/getCurrentBlock'

export type PaymentData = IPaymentData

export class PaymentMethod {
  db: MongoDBConnector
  paymentMethod?: PaymentData
  private data_service: DataService<PaymentData>

  constructor(storage: MongoDBConnector, data?: PaymentData) {
    this.db = storage
    this.paymentMethod = data
    this.data_service = new DataService(storage, 'paymentMethods')
  }

  validate(): ValidateResult {
    return new Validator(paymentMethodSchema, this.paymentMethod).validate()
  }

  async save(): Promise<InsertOneResult<PaymentData>> {
    await this.validate()

    if (!this.paymentMethod)
      throw new Error('Данные платежного метода не предоставлены для сохранения')

    this.paymentMethod.deleted = false
    this.paymentMethod.block_num = await getCurrentBlock()

    return await this.data_service.save(this.paymentMethod)
  }

  async getOne(filter: Filter<PaymentData>): Promise<PaymentData | null> {
    const result = await this.data_service.getOne(filter)

    return result
  }

  async getMany(filter: Filter<PaymentData>): Promise<Cooperative.Document.IGetResponse<PaymentData>> {
    return this.data_service.getMany({ deleted: false, ...filter }, ['username', 'method_id'])
  }

  async getHistory(filter: Filter<PaymentData>): Promise<PaymentData[]> {
    return this.data_service.getHistory(filter)
  }

  async del(filter: Filter<PaymentData>): Promise<UpdateResult> {
    return this.data_service.updateMany({ ...filter, deleted: false }, { deleted: true })
  }
}
