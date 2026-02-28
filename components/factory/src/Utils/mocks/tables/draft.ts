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

export const draftTableMock = {
  code: 'draft',
  table: 'drafts',
  data: null,
  match(url: string, params?: URLSearchParams): boolean {
    if (!url.includes('/get-tables') || !params) return false
    const filter = params.get('filter')
    if (!filter) return false
    try {
      const obj = JSON.parse(filter)
      return obj.code === 'draft' && obj.table === 'drafts'
    }
    catch { return false }
  },
  async resolve(url: string, params?: URLSearchParams): Promise<any> {
    const filter = params ? JSON.parse(params.get('filter') || '{}') : {}
    const deltas = await getMongoConnection()
    const query: any = { code: 'draft', table: 'drafts' }
    if (filter['value.registry_id']) query['value.registry_id'] = filter['value.registry_id']
    const results = await deltas.find(query).sort({ block_num: -1 }).toArray()
    return { results }
  },
}

export const draftTranslationsMock = {
  code: 'draft',
  table: 'translations',
  data: null,
  match(url: string, params?: URLSearchParams): boolean {
    if (!url.includes('/get-tables') || !params) return false
    const filter = params.get('filter')
    if (!filter) return false
    try {
      const obj = JSON.parse(filter)
      return obj.code === 'draft' && obj.table === 'translations'
    }
    catch { return false }
  },
  async resolve(url: string, params?: URLSearchParams): Promise<any> {
    const filter = params ? JSON.parse(params.get('filter') || '{}') : {}
    const deltas = await getMongoConnection()

    let draftId = filter['value.draft_id']

    if (draftId) {
      const draft = await deltas.findOne({
        code: 'draft', table: 'drafts', 'value.registry_id': draftId,
      })
      if (draft?.value?.id) {
        draftId = String(draft.value.id)
      }
    }

    const query: any = { code: 'draft', table: 'translations' }
    if (draftId) query['value.draft_id'] = draftId
    const results = await deltas.find(query).sort({ block_num: -1 }).toArray()
    return { results }
  },
}

export async function closeDraftMockConnection() {
  if (mongoClient) {
    await mongoClient.close()
    mongoClient = null
    deltasCollection = null
  }
}
