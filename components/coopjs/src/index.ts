import type { ClientConnectionOptions } from './types'
import WebSocket from 'isomorphic-ws'
import { Thunder, Subscription as ZeusSubscription, type GraphQLResponse } from './zeus'
import { Blockchain } from './blockchain'

export * from './types'
export * as Mutations from './mutations'
export * as Queries from './queries'
export * as Selectors from './selectors'
export type { ModelTypes } from './zeus';



if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket as any
}

// Текущие заголовки для запросов, которые можно обновлять
let currentHeaders: Record<string, string> = {}

// Функция для создания thunder клиента с использованием baseUrl из options
function createThunder(baseUrl: string) {
  return Thunder(async (query, variables) => {
    const response = await fetch(baseUrl, {
      body: JSON.stringify({ query, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...currentHeaders, // Используем текущие заголовки, включая Authorization
      },
    });
    
    if (!response.ok) {
      return new Promise((resolve, reject) => {
        response
          .text()
          .then((text) => {
            try {
              reject(JSON.parse(text));
            } catch (err) {
              reject(text);
            }
          })
          .catch(reject);
      });
    }

    const json = await response.json() as GraphQLResponse;

    if (json.errors) {
      console.log("json.errors", json.errors)
      throw json.errors;  // Возвращаем массив ошибок, обработанных в NestJS
    }

    return json.data;
  });
}

export function createClient(options: ClientConnectionOptions) {
  // Инициализируем заголовки при создании клиента
  currentHeaders = options.headers || {}

  const thunder = createThunder(options.baseUrl)

  return {
    setToken: (token: string) => {
      currentHeaders.Authorization = `Bearer ${token}`
    },
    Query: thunder('query'),
    Mutation: thunder('mutation'),
    Subscription: ZeusSubscription(options.baseUrl.replace(/^http/, 'ws')),
    Blockchain: new Blockchain(options)
  }
}
