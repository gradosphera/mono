import type { GraphQLClientOptions } from './types'
import WebSocket from 'isomorphic-ws'
import { SystemContract } from './contracts'
import { Chain, HEADERS, Subscription as ZeusSubscription } from './zeus'

export * from './contracts'
export * from './types'

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket as any
}

// Класс Transactions для работы с контрактами
class TransactionsClass {
  systemContract: SystemContract

  constructor() {
    this.systemContract = new SystemContract()
  }
}

export const Transactions = new TransactionsClass()

export function createClient(options: GraphQLClientOptions) {
  Object.assign(HEADERS, options.headers || {})

  const chain = Chain(options.baseUrl)

  return {
    setToken: (token: string) => {
      (HEADERS as Record<string, string>).Authorization = `Bearer ${token}`
    },
    Query: chain('query'),
    Mutation: chain('mutation'),
    Subscription: ZeusSubscription(options.baseUrl.replace(/^http/, 'ws')),
    Transactions, // Добавляем Transactions в возвращаемый объект
  }
}
