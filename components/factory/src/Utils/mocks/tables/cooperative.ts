import { MongoClient } from 'mongodb'

let mongoClient: MongoClient | null = null
let deltasCollection: any = null

async function getMongoConnection() {
  if (!mongoClient) {
    const uri = process.env.MONGO_URI || `mongodb://${process.env.MONGO_HOST || '127.0.0.1'}:27017/cooperative-x`
    mongoClient = new MongoClient(uri)
    await mongoClient.connect()
    deltasCollection = mongoClient.db().collection('deltas')
  }
  return deltasCollection
}

export const cooperativeTableMock = {
  match(url: string, params?: URLSearchParams): boolean {
    if (!url.includes('/get-tables') || !params) return false
    const filter = params.get('filter')
    if (!filter) return false
    try {
      const obj = JSON.parse(filter)
      return (obj.code === 'registrator' && obj.table === 'coops')
        || (obj.code === 'soviet' && obj.table === 'boards')
        || (obj.code === 'soviet' && obj.table === 'decisions')
        || (obj.code === 'soviet' && obj.table === 'participants')
    }
    catch { return false }
  },
  async resolve(url: string, params?: URLSearchParams): Promise<any> {
    const filter = params ? JSON.parse(params.get('filter') || '{}') : {}
    const deltas = await getMongoConnection()
    const query: any = {}
    if (filter.code) query.code = filter.code
    if (filter.scope) query.scope = filter.scope
    if (filter.table) query.table = filter.table
    for (const key of Object.keys(filter)) {
      if (key.startsWith('value.')) query[key] = filter[key]
    }
    const results = await deltas.find(query).sort({ block_num: -1 }).toArray()
    return { results }
  },
}

export async function closeCooperativeMockConnection() {
  if (mongoClient) {
    await mongoClient.close()
    mongoClient = null
    deltasCollection = null
  }
}
