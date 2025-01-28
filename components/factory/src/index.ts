export * from './Interfaces'
export * from './templates'
export * from './Schema'

import type { Filter, InsertOneResult, UpdateResult } from 'mongodb'
import type { Cooperative as CooperativeModel } from 'cooptypes'
import type { IFilterDocuments, IGeneratedDocument, Numbers, externalDataTypes, externalDataTypesArrays, internalFilterTypes } from './Interfaces'
import type { IGenerate, IGenerationOptions } from './Interfaces/Documents'
import * as Actions from './Actions'

import { MongoDBConnector } from './Services/Databazor'
import type { ExternalIndividualData } from './Models/Individual'
import { Individual } from './Models/Individual'
import type { ExternalEntrepreneurData, ExternalOrganizationData, IVars } from './Models'
import { Entrepreneur, Organization, Vars } from './Models'
import { Cooperative, type CooperativeData } from './Models/Cooperative'

import type { DocFactory } from './Factory'
import type { PaymentData } from './Models/PaymentMethod'
import { PaymentMethod } from './Models/PaymentMethod'
import { type ExternalProjectData, Project } from './Models/Project'

export type dataTypes = 'individual' | 'entrepreneur' | 'organization' | 'paymentMethod' | 'vars' | 'project'

export type { ExternalOrganizationData as IOrganizationData } from './Models'
export type { ExternalIndividualData as IIndividualData } from './Models'
export type { ExternalEntrepreneurData as IEntrepreneurData } from './Models'
export type { CooperativeData as ICooperativeData } from './Models'
export type { ExternalProjectData as IExternalProjectData } from './Models'

export interface IGenerator {
  connect: (mongoUri: string) => Promise<void>
  disconnect: () => Promise<void>
  generate: (data: IGenerate, options?: IGenerationOptions) => Promise<IGeneratedDocument>
  getDocument: (filter: Filter<IFilterDocuments>) => Promise<IGeneratedDocument>

  constructCooperative: (username: string, block_num?: number) => Promise<CooperativeData | null>
  save: ((type: 'individual', data: ExternalIndividualData) => Promise<InsertOneResult>) & ((type: 'entrepreneur', data: ExternalEntrepreneurData) => Promise<InsertOneResult>) & ((type: 'organization', data: ExternalOrganizationData) => Promise<InsertOneResult>) & ((type: 'paymentMethod', data: PaymentData) => Promise<InsertOneResult>) & ((type: 'vars', data: IVars) => Promise<InsertOneResult>) & ((type: 'project', data: ExternalProjectData) => Promise<InsertOneResult>)
  get: (type: dataTypes, filter: Filter<internalFilterTypes>) => Promise<externalDataTypes | null>
  del: (type: dataTypes, filter: Filter<internalFilterTypes>) => Promise<UpdateResult>

  list: (type: dataTypes, filter: Filter<internalFilterTypes>) => Promise<CooperativeModel.Document.IGetResponse<internalFilterTypes>>

  getHistory: (type: dataTypes, filter: Filter<internalFilterTypes>) => Promise<externalDataTypesArrays>
}

export class Generator implements IGenerator {
  // Определение фабрик
  factories!: {
    [K in Numbers]: DocFactory<IGenerate>
  }

  // Определение хранилища
  public storage!: MongoDBConnector

  // Метод подключения к хранилищу
  async connect(mongoUri: string): Promise<void> {
    this.storage = new MongoDBConnector(mongoUri)

    // Инициализация фабрик документов
    this.factories = {
      [Actions.WalletAgreement.Template.registry_id]: new Actions.WalletAgreement.Factory(this.storage), // 1
      [Actions.RegulationElectronicSignature.Template.registry_id]: new Actions.RegulationElectronicSignature.Factory(this.storage), // 2
      [Actions.PrivacyPolicy.Template.registry_id]: new Actions.PrivacyPolicy.Factory(this.storage), // 3
      [Actions.UserAgreement.Template.registry_id]: new Actions.UserAgreement.Factory(this.storage), // 4
      [Actions.CoopenomicsAgreement.Template.registry_id]: new Actions.CoopenomicsAgreement.Factory(this.storage), // 50
      [Actions.ParticipantApplication.Template.registry_id]: new Actions.ParticipantApplication.Factory(this.storage), // 100
      [Actions.SelectBranchStatement.Template.registry_id]: new Actions.SelectBranchStatement.Factory(this.storage), // 101
      [Actions.DecisionOfParticipantApplication.Template.registry_id]: new Actions.DecisionOfParticipantApplication.Factory(this.storage), // 501
      [Actions.ProjectFreeDecision.Template.registry_id]: new Actions.ProjectFreeDecision.Factory(this.storage), // 599
      [Actions.FreeDecision.Template.registry_id]: new Actions.FreeDecision.Factory(this.storage), // 600
      [Actions.AssetContributionStatement.Template.registry_id]: new Actions.AssetContributionStatement.Factory(this.storage), // 700
      [Actions.ReturnByAssetStatement.Template.registry_id]: new Actions.ReturnByAssetStatement.Factory(this.storage), // 800
      [Actions.ReturnByAssetDecision.Template.registry_id]: new Actions.ReturnByAssetDecision.Factory(this.storage), // 801
      [Actions.ReturnByAssetAct.Template.registry_id]: new Actions.ReturnByAssetAct.Factory(this.storage), // 802
      [Actions.AssetContributionDecision.Template.registry_id]: new Actions.AssetContributionDecision.Factory(this.storage), // 701
      [Actions.AssetContributionAct.Template.registry_id]: new Actions.AssetContributionAct.Factory(this.storage), // 702
    }
    await this.storage.connect()
  }

  // Метод отключения от хранилища
  async disconnect(): Promise<void> {
    await this.storage.disconnect()
  }

  // Метод генерации документа
  async generate(data: IGenerate, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    const factory = this.factories[data.registry_id as Numbers] // Get the factory

    if (!factory)
      throw new Error(`Фабрика для документа #${data.registry_id} не найдена.`)

    // синтезируем документ
    return await factory.generateDocument(data, options)
  }

  async getDocument(filter: Filter<IFilterDocuments>): Promise<IGeneratedDocument> {
    return await this.storage.getDocument(filter)
  }

  async save(type: 'individual', data: ExternalIndividualData): Promise<InsertOneResult>
  async save(type: 'entrepreneur', data: ExternalEntrepreneurData): Promise<InsertOneResult>
  async save(type: 'organization', data: ExternalOrganizationData): Promise<InsertOneResult>
  async save(type: 'paymentMethod', data: PaymentData): Promise<InsertOneResult>
  async save(type: 'vars', data: IVars): Promise<InsertOneResult>
  async save(type: 'project', data: ExternalProjectData): Promise<InsertOneResult>

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
  async list(type: dataTypes, filter: Filter<internalFilterTypes>): Promise<CooperativeModel.Document.IGetResponse<externalDataTypes>> {
    const model = this.getModel(type)
    return model.getMany(filter)
  }

  // // Универсальные методы получения истории
  async getHistory(type: 'individual' | 'entrepreneur' | 'organization' | 'paymentMethod' | 'vars' | 'project', filter: Filter<internalFilterTypes>): Promise<externalDataTypesArrays> {
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
      case 'vars':
        return new Vars(this.storage, data as IVars)
      case 'project':
        return new Project(this.storage, data as ExternalProjectData)

      default:
        throw new Error(`Unknown type: ${type}`)
    }
  }

  async constructCooperative(username: string, block_num?: number): Promise<CooperativeData | null> {
    return new Cooperative(this.storage).getOne(username, block_num)
  }
}
