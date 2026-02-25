import { $ } from '../../zeus/index'

export const name = 'searchDocuments'

export const query = {
  [name]: [
    { data: $('data', 'SearchDocumentsInput!') },
    {
      hash: true,
      full_title: true,
      username: true,
      coopname: true,
      registry_id: true,
      created_at: true,
      highlights: true,
    },
  ],
}

export interface IInput {
  data: {
    query: string
    limit?: number
  }
}

export interface ISearchResult {
  hash: string
  full_title: string
  username: string
  coopname: string
  registry_id: number
  created_at: string
  highlights: string[]
}

export type IOutput = Record<typeof name, ISearchResult[]>
