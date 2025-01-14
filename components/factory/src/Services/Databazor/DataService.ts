import type { Collection, Filter, UpdateResult } from 'mongodb'
import type { Cooperative } from 'cooptypes'
import type { MongoDBConnector } from './MongoDBConnector'

export interface IDocument {
  [key: string]: any
}

class DataService<T extends IDocument> {
  private collection: Collection<T>
  private state: Collection

  constructor(dbConnector: MongoDBConnector, collectionName: string) {
    this.collection = dbConnector.getCollection<T>(collectionName)
    this.state = dbConnector.getCollection('sync')
  }

  async getOne(filter: Filter<T>): Promise<T | null> {
    const document = await this.collection.findOne({ ...filter }, { sort: { _created_at: -1 } })
    return document as T | null
  }

  async getMany(
    filter: Filter<T>,
    groupByFields: string | string[],
    page: number = 1,
    limit: number = 100,
  ): Promise<Cooperative.Document.IGetResponse<T>> {
    const groupFields = Array.isArray(groupByFields) ? groupByFields : [groupByFields]
    const groupId = groupFields.reduce((acc, field) => ({ ...acc, [field]: `$${field}` }), {})

    const aggregateOptions = [
      { $match: filter },
      { $sort: { _created_at: -1 } },
      {
        $group: {
          _id: groupId,
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
    ]

    const totalResult = await this.collection.aggregate([
      ...aggregateOptions,
      { $count: 'total' },
    ]).toArray()

    const totalResults = totalResult[0]?.total || 0
    const totalPages = Math.ceil(totalResults / limit)

    const results = await this.collection.aggregate([
      ...aggregateOptions,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]).toArray()

    const result: Cooperative.Document.IGetResponse<T> = {
      results: results as T[],
      page,
      limit,
      totalPages,
      totalResults,
    }

    return result
  }

  async getHistory(filter: Filter<T>): Promise<T[]> {
    const documents = await this.collection.find(filter).sort({ _created_at: -1 }).toArray()
    return documents as unknown as T[]
  }

  async save(data: T) {
    const document: any = { _created_at: new Date(), ...data }
    return await this.collection.insertOne(document)
  }

  async updateMany(filter: Filter<T>, dataForUpdate: Partial<T>): Promise<UpdateResult> {
    const deleted = await this.collection.updateMany(filter, { $set: dataForUpdate })

    return deleted
  }
}

export default DataService
