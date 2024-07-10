export * from './Interfaces'

import type { Filter, InsertOneResult } from 'mongodb'
import type { Actions, IFilterDocuments, IGeneratedDocument } from './Interfaces'
import type { IGenerate } from './Interfaces/Documents'
import { JoinCoop, JoinCoopDecision } from './Actions'
import { MongoDBConnector } from './Services/Databazor'
import { Individual, type IndividualData } from './Models/Individual'
import type { EntrepreneurData, OrganizationData } from './Models'
import { Entrepreneur, Organization } from './Models'
import { Cooperative, type CooperativeData } from './Models/Cooperative'

import type { DocFactory } from './Factory'

export type dataTypes = 'individual' | 'entrepreneur' | 'organization'
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
  save: ((type: 'individual', data: IndividualData) => Promise<InsertOneResult>) & ((type: 'entrepreneur', data: EntrepreneurData) => Promise<InsertOneResult>) & ((type: 'organization', data: OrganizationData) => Promise<InsertOneResult>)
  get: (type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData>) => Promise<IndividualData | EntrepreneurData | OrganizationData | null>
  list: (type: dataTypes) => Promise<IndividualData[] | EntrepreneurData[] | OrganizationData[]>
  getHistory: (type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData>) => Promise<IndividualData[] | EntrepreneurData[] | OrganizationData[]>

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
      // joincoopdec: new JoinCoopDecTemplateFactory(),
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

  async save(type: dataTypes, data: IndividualData | EntrepreneurData | OrganizationData): Promise<InsertOneResult> {
    const model = this.getModel(type, data)
    return model.save()
  }

  // Универсальные методы получения одного объекта
  async get(type: dataTypes, filter: Filter<IndividualData | EntrepreneurData | OrganizationData>): Promise<IndividualData | EntrepreneurData | OrganizationData | null> {
    const model = this.getModel(type)
    return model.getOne(filter)
  }

  // Универсальные методы получения списка объектов
  async list(type: dataTypes): Promise<IndividualData[] | EntrepreneurData[] | OrganizationData[]> {
    const model = this.getModel(type)
    return model.getMany({})
  }

  // Универсальные методы получения истории
  async getHistory(type: 'individual' | 'entrepreneur' | 'organization', filter: Filter<IndividualData | EntrepreneurData | OrganizationData>): Promise<IndividualData[] | EntrepreneurData[] | OrganizationData[]> {
    const model = this.getModel(type)
    return model.getHistory(filter)
  }

  // Вспомогательный метод для получения модели
  getModel(type: dataTypes, data?: IndividualData | EntrepreneurData | OrganizationData) {
    switch (type) {
      case 'individual':
        return new Individual(this.storage, data as IndividualData)
      case 'entrepreneur':
        return new Entrepreneur(this.storage, data as EntrepreneurData)
      case 'organization':
        return new Organization(this.storage, data as OrganizationData)
      default:
        throw new Error(`Unknown type: ${type}`)
    }
  }

  async constructCooperative(username: string, block_num?: number): Promise<CooperativeData | null> {
    return new Cooperative(this.storage).getOne(username, block_num)
  }
}
