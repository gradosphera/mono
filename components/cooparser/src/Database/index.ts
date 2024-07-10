import type { Collection, Db, Filter } from 'mongodb'
import { MongoClient } from 'mongodb'
import { mongoUri } from '../config'
import type { IAction, IActionResult, IDelta, ITableResult } from '../Types'

export class Database {
  private client: MongoClient
  private db: Db | undefined
  private actions: Collection | undefined
  private deltas: Collection | undefined
  private sync: Collection | undefined

  constructor() {
    this.client = new MongoClient(mongoUri)
  }

  async connect() {
    await this.client.connect()
    this.db = this.client.db('cooperative')
    this.actions = this.db.collection('actions')
    this.deltas = this.db.collection('deltas')
    this.sync = this.db.collection('sync')
  }

  async saveActionToDB(action: any): Promise<void> {
    if (!this.actions)
      throw new Error('База данных не подключена')

    await this.actions.insertOne(action)
  }

  async saveDeltaToDB(delta: any): Promise<void> {
    if (!this.deltas)
      throw new Error('База данных не подключена')

    await this.deltas.insertOne(delta)
  }

  async getDelta(filter: Filter<IDelta>): Promise<any> {
    if (!this.deltas)
      throw new Error('База данных не подключена')

    const result = await this.deltas.findOne(filter as any)

    return result
  }

  async getTables(filter?: Filter<IDelta>, page: number = 1, limit: number = 10): Promise<ITableResult> {
    if (!this.deltas)
      throw new Error('База данных не подключена')

    const pipeline = [
      { $match: filter },
      { $sort: { block_num: -1, _id: -1 } },
      { $group: { _id: '$primary_key', doc: { $first: '$$ROOT' } } },
      // { $match: { 'doc.present': true } },
      { $replaceRoot: { newRoot: '$doc' } },
    ]

    const [result] = await Promise.all([
      this.deltas.aggregate(pipeline)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
    ])

    return {
      results: result as IDelta[],
      page,
      limit,
    }
  }

  async getActions(filter?: Filter<IAction>, page: number = 1, limit: number = 10): Promise<IActionResult> {
    if (!this.actions)
      throw new Error('База данных не подключена')

    const query = filter || {}

    const result = await this.actions.aggregate([
      { $match: query },
      { $sort: { block_num: -1, _id: -1 } },
      { $group: { _id: '$global_sequence', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]).toArray()

    // const result = await this.actions.find(query as any)
    //   .skip((page - 1) * limit)
    //   .sort({ block_num: -1, _id: -1 })
    //   .limit(limit)
    //   .toArray()

    return {
      results: result as unknown as IAction[],
      page,
      limit,
    }
  }

  async getAction(filter: Filter<Filter<IAction>>): Promise<any> {
    if (!this.actions)
      throw new Error('База данных не подключена')

    const result = await this.actions.findOne(filter as any)

    return result ? result.value : null
  }

  async getCurrentBlock(): Promise<number> {
    if (!this.sync)
      throw new Error('База данных не подключена')

    const currentBlockDocument = await this.sync.findOne({ key: 'currentBlock' })

    return currentBlockDocument ? currentBlockDocument.block_num : 0
  }

  async updateCurrentBlock(block_num: number): Promise<void> {
    if (!this.sync)
      throw new Error('База данных не подключена')

    await this.sync.updateOne({ key: 'currentBlock' }, { $set: { block_num } }, { upsert: true })
  }

  async purgeAfterBlock(since_block: number) {
    if (!this.actions || !this.deltas)
      throw new Error('База данных не подключена')

    await this.actions.deleteMany({ block_num: { $gt: since_block } })
    await this.deltas.deleteMany({ block_num: { $gt: since_block } })
  }
}

export const db = new Database()

export async function init() {
  return db.connect().then(() => {
    console.log('База данных инициализирована')
  })
}
