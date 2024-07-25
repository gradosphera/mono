export * from './Interfaces'
export * from './Templates'

import type { Filter, InsertOneResult, UpdateResult } from 'mongodb'
import type { Cooperative as CooperativeModel } from 'cooptypes'
import type { Actions, IFilterDocuments, IGeneratedDocument, externalDataTypes, externalDataTypesArrays, internalFilterTypes } from './Interfaces'
import type { IGenerate } from './Interfaces/Documents'
import { JoinCoop, JoinCoopDecision } from './Actions'
import { MongoDBConnector } from './Services/Databazor'
import type { ExternalIndividualData } from './Models/Individual'
import { Individual } from './Models/Individual'
import type { ExternalEntrepreneurData, ExternalOrganizationData } from './Models'
import { Entrepreneur, Organization } from './Models'
import { Cooperative, type CooperativeData } from './Models/Cooperative'

import type { DocFactory } from './Factory'
import type { PaymentData } from './Models/PaymentMethod'
import { PaymentMethod } from './Models/PaymentMethod'

export type dataTypes = 'individual' | 'entrepreneur' | 'organization' | 'paymentMethod'

export type { ExternalOrganizationData as IOrganizationData } from './Models'
export type { ExternalIndividualData as IIndividualData } from './Models'
export type { ExternalEntrepreneurData as IEntrepreneurData } from './Models'
export type { CooperativeData as ICooperativeData } from './Models'

export interface IGenerator {
  connect: (mongoUri: string) => Promise<void>
  disconnect: () => Promise<void>
  generate: (options: IGenerate) => Promise<IGeneratedDocument>
  getDocument: (filter: Filter<IFilterDocuments>) => Promise<IGeneratedDocument>

  constructCooperative: (username: string, block_num?: number) => Promise<CooperativeData | null>
  save: ((type: 'individual', data: ExternalIndividualData) => Promise<InsertOneResult>) & ((type: 'entrepreneur', data: ExternalEntrepreneurData) => Promise<InsertOneResult>) & ((type: 'organization', data: ExternalOrganizationData) => Promise<InsertOneResult>) & ((type: 'paymentMethod', data: PaymentData) => Promise<InsertOneResult>)
  get: (type: dataTypes, filter: Filter<internalFilterTypes>) => Promise<externalDataTypes | null>
  del: (type: dataTypes, filter: Filter<internalFilterTypes>) => Promise<UpdateResult>

  list: (type: dataTypes, filter: Filter<internalFilterTypes>) => Promise<CooperativeModel.Documents.IGetResponse<internalFilterTypes>>

  getHistory: (type: dataTypes, filter: Filter<internalFilterTypes>) => Promise<externalDataTypesArrays>
}

export class Generator implements IGenerator {
  // Определение фабрик
  factories!: {
    [K in Actions]: DocFactory
  }

  // Определение хранилища
  public storage!: MongoDBConnector

  // Метод подключения к хранилищу
  async connect(mongoUri: string): Promise<void> {
    this.storage = new MongoDBConnector(mongoUri)

    // Инициализация фабрик для разных типов документов
    this.factories = {
      'registrator::joincoop': new JoinCoop.JoinCoopTemplateFactory(this.storage),
      'registrator::joincoopdec': new JoinCoopDecision.DecisionOfJoinCoopTemplateFactory(this.storage),
    }
    await this.storage.connect()
  }

  // Метод отключения от хранилища
  async disconnect(): Promise<void> {
    await this.storage.disconnect()
  }

  // Метод генерации документа
  async generate(options: IGenerate): Promise<IGeneratedDocument> {
    const factory = this.factories[`${options.code}::${options.action}` as Actions] // Get the factory

    if (!factory)
      throw new Error(`Фабрика для документа типа ${options.code}::${options.action} не найдена.`)

    // синтезируем документ
    return await factory.generateDocument(options)
  }

  async getDocument(filter: Filter<IFilterDocuments>): Promise<IGeneratedDocument> {
    return await this.storage.getDocument(filter)
  }

  async save(type: 'individual', data: ExternalIndividualData): Promise<InsertOneResult>
  async save(type: 'entrepreneur', data: ExternalEntrepreneurData): Promise<InsertOneResult>
  async save(type: 'organization', data: ExternalOrganizationData): Promise<InsertOneResult>
  async save(type: 'paymentMethod', data: PaymentData): Promise<InsertOneResult>

  async save(type: dataTypes, data: externalDataTypes): Promise<InsertOneResult> {
    const model = this.getModel(type, data)
    return model.save()
  }

  async del(type: dataTypes, filter: Filter<internalFilterTypes>): Promise<UpdateResult> {
    const model = this.getModel(type)
    return model.del(filter)
  }

  // Универсальные методы получения одного объекта
  async get(type: dataTypes, filter: Filter<internalFilterTypes>): Promise<externalDataTypes | null> {
    const model = this.getModel(type)
    return model.getOne(filter)
  }

  // Универсальные методы получения списка объектов
  async list(type: dataTypes, filter: Filter<internalFilterTypes>): Promise<CooperativeModel.Documents.IGetResponse<externalDataTypes>> {
    const model = this.getModel(type)
    return model.getMany(filter)
  }

  // // Универсальные методы получения истории
  async getHistory(type: 'individual' | 'entrepreneur' | 'organization' | 'paymentMethod', filter: Filter<internalFilterTypes>): Promise<externalDataTypesArrays> {
    const model = this.getModel(type)
    return model.getHistory(filter)
  }

  // Вспомогательный метод для получения модели
  getModel(type: dataTypes, data?: externalDataTypes) {
    switch (type) {
      case 'individual':
        return new Individual(this.storage, data as ExternalIndividualData)
      case 'entrepreneur':
        return new Entrepreneur(this.storage, data as ExternalEntrepreneurData)
      case 'organization':
        return new Organization(this.storage, data as ExternalOrganizationData)
      case 'paymentMethod':
        return new PaymentMethod(this.storage, data as PaymentData)

      default:
        throw new Error(`Unknown type: ${type}`)
    }
  }

  async constructCooperative(username: string, block_num?: number): Promise<CooperativeData | null> {
    return new Cooperative(this.storage).getOne(username, block_num)
  }
}
