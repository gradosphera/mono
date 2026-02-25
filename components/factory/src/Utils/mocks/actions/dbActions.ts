import { MongoClient } from 'mongodb'

let mongoClient: MongoClient | null = null
let actionsCollection: any = null

async function getMongoConnection() {
  if (!mongoClient) {
    const uri = process.env.MONGO_URI || `mongodb://${process.env.MONGO_HOST || '127.0.0.1'}:27017/cooperative-x`
    mongoClient = new MongoClient(uri)
    await mongoClient.connect()
    actionsCollection = mongoClient.db().collection('actions')
  }
  return actionsCollection
}

export const dbActionsMock = {
  match(url: string, params?: URLSearchParams): boolean {
    if (!url.includes('/get-actions') || !params) return false
    const filter = params.get('filter')
    if (!filter) return false
    try {
      JSON.parse(filter)
      return true
    }
    catch { return false }
  },
  async resolve(url: string, params?: URLSearchParams): Promise<any> {
    const filter = params ? JSON.parse(params.get('filter') || '{}') : {}
    const actions = await getMongoConnection()
    const query: any = {}
    if (filter.account) query['action.account'] = filter.account
    if (filter.name) query['action.name'] = filter.name
    for (const key of Object.keys(filter)) {
      if (key.startsWith('action.data.')) query[key] = filter[key]
    }
    const results = await actions.find(query).sort({ block_num: -1 }).toArray()
    return { results }
  },
}

export async function closeDbActionsMockConnection() {
  if (mongoClient) {
    await mongoClient.close()
    mongoClient = null
    actionsCollection = null
  }
}
