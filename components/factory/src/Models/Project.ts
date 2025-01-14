import type { Filter, InsertOneResult, UpdateResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { ValidateResult } from '../Services/Validator'
import { Validator } from '../Services/Validator'
import type { MongoDBConnector } from '../Services/Databazor'
import DataService from '../Services/Databazor/DataService'
import { getCurrentBlock } from '../Utils/getCurrentBlock'
import { projectSchema } from '../Schema/ProjectSchema'

export type ExternalProjectData = Cooperative.Document.IProjectData

export interface InternalProjectData extends ExternalProjectData {
  block_num?: number
  deleted?: boolean
}

export class Project {
  project?: ExternalProjectData
  private data_service: DataService<InternalProjectData>

  constructor(storage: MongoDBConnector, data?: ExternalProjectData) {
    this.project = data
    this.data_service = new DataService<InternalProjectData>(storage, 'projects')
  }

  validate(): ValidateResult {
    return new Validator(projectSchema, this.project).validate()
  }

  async save(): Promise<InsertOneResult<InternalProjectData>> {
    await this.validate()

    if (!this.project)
      throw new Error('Данные проекта решения не предоставлены для сохранения')

    const currentBlock = await getCurrentBlock()

    const project: InternalProjectData = {
      ...this.project,
      block_num: currentBlock,
      deleted: false,
    }

    return await this.data_service.save(project)
  }

  async getOne(filter: Filter<InternalProjectData>): Promise<InternalProjectData | null> {
    return this.data_service.getOne(filter)
  }

  async getMany(filter: Filter<InternalProjectData>): Promise<Cooperative.Document.IGetResponse<InternalProjectData>> {
    return this.data_service.getMany(filter, 'username')
  }

  async getHistory(filter: Filter<InternalProjectData>): Promise<InternalProjectData[]> {
    return this.data_service.getHistory(filter)
  }

  async del(filter: Filter<InternalProjectData>): Promise<UpdateResult> {
    return this.data_service.updateMany(filter, { deleted: true })
  }
}
