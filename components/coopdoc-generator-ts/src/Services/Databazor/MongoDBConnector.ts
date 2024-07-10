import { MongoClient } from 'mongodb'
import type { Collection, Db, Filter } from 'mongodb'
import type { IGeneratedDocument } from '../../Interfaces'
import type { IFilterDocuments } from '../../Interfaces/Storage'
import type { IDocument } from './DataService'

export class MongoDBConnector {
  public client: MongoClient
  public db: Db
  private documents: Collection | undefined

  constructor(uri: string) {
    this.client = new MongoClient(uri)

    // Извлечение имени базы данных из URI
    const dbName = this.extractDbNameFromUri(uri)
    if (!dbName)
      throw new Error('Database name must be specified in the URI.')

    this.db = this.client.db(dbName)
    this.documents = this.db.collection('documents')
  }

  private extractDbNameFromUri(uri: string): string | null {
    const regex = /mongodb:\/\/[^/]+\/([^?]+)/ // Регулярное выражение для извлечения имени БД
    const matches = uri.match(regex)
    return matches ? matches[1] : null
  }

  async connect(): Promise<void> {
    await this.client.connect()
  }

  async disconnect(): Promise<void> {
    await this.client.close()
  }

  getCollection<T extends IDocument>(collectionName: string): Collection<T> {
    return this.db.collection<T>(collectionName)
  }

  async getDocument(filter: Filter<IFilterDocuments>): Promise<IGeneratedDocument> {
    if (!this.documents)
      throw new Error('Database not connected')

    const result: any = await this.documents.findOne(filter as any)

    return result as IGeneratedDocument
  }

  async saveDraft(document: IGeneratedDocument): Promise<void> {
    if (!this.documents)
      throw new Error('Database not connected')

    await this.documents.updateOne({ hash: document.hash }, { $set: { ...document } }, { upsert: true })
  }
}
