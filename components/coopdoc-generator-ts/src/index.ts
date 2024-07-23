export * from './Interfaces'

import type { DeleteResult, Filter, InsertOneResult } from 'mongodb'
import type { Actions, IFilterDocuments, IGeneratedDocument, PaymentData } from './Interfaces'
import type { IGenerate } from './Interfaces/Documents'
import { JoinCoop, JoinCoopDecision } from './Actions'
import { MongoDBConnector } from './Services/Databazor'
import { Individual, type IndividualData } from './Models/Individual'
import type { EntrepreneurData, OrganizationData } from './Models'
import { Entrepreneur, Organization } from './Models'
import { Cooperative, type CooperativeData } from './Models/Cooperative'

import type { DocFactory } from './Factory'
import { PaymentMethod } from './Models/PaymentMethod'

export type dataTypes = 'individual' | 'entrepreneur' | 'organization' | 'paymentMethod'
export type { OrganizationData as IOrganizationData } from './Models'
export type { IndividualData as IIndividualData } from './Models'
export type { EntrepreneurData as IEntrepreneurData } from './Models'
export type { CooperativeData as ICooperativeData } from './Models'

export interface IGenerator {
  connect: (mongoUri: string) => Promise<void>
  disconnect: () => Promise<void>
  generate: (options: IGenerate) => Promise<IGeneratedDocument>
  getDocument: (filter: Filter<IFilterDocuments>) => Promise<IGeneratedDocument>

  constructCooperative: (username: string, block_num?: number) => Promise<CooperativeData | null>
  save: ((type: 'individual', data: IndividualData) => Promise<InsertOneResult>) & ((type: 'entrepreneur', data: EntrepreneurData) => Promise<InsertOneResult>) & ((type: 'organization', data: OrganizationData) => Promise<InsertOneResult>) & ((type: 'paymentMethod', data: PaymentData) => Promise<InsertOneResult>)
  get: (type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData | PaymentData>) => Promise<IndividualData | EntrepreneurData | OrganizationData | PaymentData | null>
  del: (type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData | PaymentData>) => Promise<DeleteResult>
  list: (type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData | PaymentData>) => Promise<IndividualData[] | EntrepreneurData[] | OrganizationData[] | PaymentData[]>
  getHistory: (type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData | PaymentData>) => Promise<IndividualData[] | EntrepreneurData[] | OrganizationData[] | PaymentData[]>

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
    this.storage.disconnect()
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

  async save(type: 'individual', data: IndividualData): Promise<InsertOneResult>
  async save(type: 'entrepreneur', data: EntrepreneurData): Promise<InsertOneResult>
  async save(type: 'organization', data: OrganizationData): Promise<InsertOneResult>

  async save(type: 'paymentMethod', data: PaymentData): Promise<InsertOneResult>

  async save(type: dataTypes, data: IndividualData | EntrepreneurData | OrganizationData | PaymentData): Promise<InsertOneResult> {
    const model = this.getModel(type, data)
    return model.save()
  }

  async del(type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData | PaymentData>): Promise<DeleteResult> {
    const model = this.getModel(type)
    return model.del(filter)
  }

  // Универсальные методы получения одного объекта
  async get(type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData | PaymentData>): Promise<IndividualData | EntrepreneurData | OrganizationData | PaymentData | null> {
    const model = this.getModel(type)
    return model.getOne(filter)
  }

  // Универсальные методы получения списка объектов
  async list(type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData | PaymentData>): Promise<IndividualData[] | EntrepreneurData[] | OrganizationData[] | PaymentData[]> {
    const model = this.getModel(type)
    return model.getMany(filter)
  }

  // // Универсальные методы получения истории
  async getHistory(type: 'individual' | 'entrepreneur' | 'organization' | 'paymentMethod', filter: Filter<IndividualData | EntrepreneurData | OrganizationData | PaymentData>): Promise<IndividualData[] | EntrepreneurData[] | OrganizationData[] | PaymentData[]> {
    const model = this.getModel(type)
    return model.getHistory(filter)
  }

  // Вспомогательный метод для получения модели
  getModel(type: dataTypes, data?: IndividualData | EntrepreneurData | OrganizationData | PaymentData) {
    switch (type) {
      case 'individual':
        return new Individual(this.storage, data as IndividualData)
      case 'entrepreneur':
        return new Entrepreneur(this.storage, data as EntrepreneurData)
      case 'organization':
        return new Organization(this.storage, data as OrganizationData)
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
