import type { DeleteResult, Filter, InsertOneResult } from 'mongodb'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import DataService from '../Services/Databazor/DataService'
import type { MongoDBConnector } from '../Services/Databazor'
import type { IPaymentMethod } from '../Interfaces'
import { paymentMethodSchema } from '../Schema'

export class PaymentMethod {
  paymentMethod?: IPaymentMethod
  private data_service: DataService<IPaymentMethod>

  constructor(storage: MongoDBConnector, data?: IPaymentMethod) {
    this.paymentMethod = data
    this.data_service = new DataService<IPaymentMethod>(storage, 'PaymentData')
  }

  validate(): ValidateResult {
    return new Validator(paymentMethodSchema, this.paymentMethod as IPaymentMethod).validate()
  }

  async save(): Promise<InsertOneResult<IPaymentMethod>> {
    await this.validate()

    return await this.data_service.save(this.paymentMethod as IPaymentMethod)
  }

  async getOne(filter: Filter<IPaymentMethod>): Promise<IPaymentMethod | null> {
    return this.data_service.getOne(filter)
  }

  async getMany(filter: Filter<IPaymentMethod>): Promise<IPaymentMethod[]> {
    return this.data_service.getMany(filter, 'method_id')
  }

  async getHistory(filter: Filter<IPaymentMethod>): Promise<IPaymentMethod[]> {
    return this.data_service.getHistory(filter)
  }

  async del(filter: Filter<IPaymentMethod>): Promise<DeleteResult> {
    return this.data_service.deleteMany(filter)
  }
}
