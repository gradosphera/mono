import type { Collection, Filter } from 'mongodb'
import { getCurrentBlock } from '../../Utils/getCurrentBlock'
import type { MongoDBConnector } from './MongoDBConnector'

export interface IDocument {
  [key: string]: any
}

class DataService<T extends IDocument> {
  private collection: Collection<T>
  private state: Collection

  constructor(private dbConnector: MongoDBConnector, collectionName: string) {
    this.collection = this.dbConnector.getCollection<T>(collectionName)
    this.state = this.dbConnector.getCollection('sync')
  }

  async getOne(filter: Filter<T>): Promise<T | null> {
    const document = await this.collection.findOne(filter, { sort: { _id: -1 } })
    return document as T | null
  }

  async getMany(filter: Filter<T>): Promise<T[]> {
    const aggregateOptions = [
      { $match: filter },
      { $sort: { _created_at: -1 } },
      {
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
    ]

    const result = await this.collection.aggregate(aggregateOptions).toArray()
    return result as T[]
  }

  async getHistory(filter: Filter<T>): Promise<T[]> {
    const documents = await this.collection.find(filter).sort({ _created_at: -1 }).toArray()
    return documents as unknown as T[]
  }

  async save(data: T) {
    const currentBlock = await getCurrentBlock()

    const document: any = { _created_at: new Date(), block_num: currentBlock, ...data }
    return await this.collection.insertOne(document)
  }
}

export default DataService
