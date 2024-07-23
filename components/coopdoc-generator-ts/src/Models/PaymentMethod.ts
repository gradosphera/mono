import type { DeleteResult, Filter, InsertOneResult } from 'mongodb'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import DataService from '../Services/Databazor/DataService'
import type { MongoDBConnector } from '../Services/Databazor'
import type { PaymentData } from '../Interfaces'
import { paymentMethodSchema } from '../Schema'

export class PaymentMethod {
  paymentMethod?: PaymentData
  private data_service: DataService<PaymentData>

  constructor(storage: MongoDBConnector, data?: PaymentData) {
    this.paymentMethod = data
    this.data_service = new DataService(storage, 'PaymentData')
  }

  validate(): ValidateResult {
    return new Validator(paymentMethodSchema, this.paymentMethod as PaymentData).validate()
  }

  async save(): Promise<InsertOneResult<PaymentData>> {
    await this.validate()

    return await this.data_service.save(this.paymentMethod as PaymentData)
  }

  async getOne(filter: Filter<PaymentData>): Promise<PaymentData | null> {
    return this.data_service.getOne(filter)
  }

  async getMany(filter: Filter<PaymentData>): Promise<PaymentData[]> {
    return this.data_service.getMany(filter, 'method_id')
  }

  async getHistory(filter: Filter<PaymentData>): Promise<PaymentData[]> {
    return this.data_service.getHistory(filter)
  }

  async del(filter: Filter<PaymentData>): Promise<DeleteResult> {
    return this.data_service.deleteMany(filter)
  }
}
