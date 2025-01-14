import type { ClientConnectionOptions } from './types'
import WebSocket from 'isomorphic-ws'
import { Thunder, Subscription as ZeusSubscription, type GraphQLResponse } from './zeus'
import * as Classes from './classes'

export * as Mutations from './mutations'
export * as Queries from './queries'
export * as Classes from './classes'
export * as Zeus from './zeus'

/**
 * @private
 */
export * as Types from './types'

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

/**
 * Создаёт клиент для взаимодействия с API, поддерживающий выполнение запросов, мутаций, подписок,
 * а также операций с блокчейном. Позволяет динамически изменять заголовок авторизации.
 *
 * @param options - Опции для настройки подключения клиента.
 * @param options.baseUrl - Базовый URL API, с которым будет происходить взаимодействие.
 * @param options.headers - Необязательные заголовки, которые будут добавляться ко всем запросам. По умолчанию — пустой объект.
 * @param options.blockchainUrl - URL узла блокчейна.
 * @param options.chainId - Уникальный идентификатор цепочки блокчейна.
 *
 * @returns Объект, содержащий методы для работы с API:
 * - `setToken`: Устанавливает заголовок Authorization с переданным токеном.
 * - `Query`: Метод для выполнения GraphQL-запросов.
 * - `Mutation`: Метод для выполнения GraphQL-мутаций.
 * - `Subscription`: Метод для подписки на события через WebSocket с использованием протокола GraphQL Subscriptions.
 * - `Blockchain`: Экземпляр класса Blockchain для взаимодействия с функциями блокчейна.
 *
 * @example
 * ```typescript
 * const client = createClient({
 *   baseUrl: 'https://api.example.com',
 *   headers: { 'Custom-Header': 'значение' },
 *   blockchainUrl: 'https://blockchain.example.com',
 *   chainId: '12345'
 * });
 *
 * client.setToken('ваш-токен');
 *
 * const data = await client.Query({
 *   someField: true,
 * });
 * ```
 */
export function createClient(options: ClientConnectionOptions) {
  // Инициализируем заголовки при создании клиента
  currentHeaders = options.headers || {}

  const thunder = createThunder(options.api_url)
  const wallet = new Classes.Wallet(options)
  
  if (options.wif && options.username)
    wallet.setWif(options.username, options.wif)
  else if (options.wif && !options.username || !options.wif && options.username) {
    throw new Error('wif и username должны быть указаны одновременно')
  }
      
  return {
    setToken: (token: string) => {
      currentHeaders.Authorization = `Bearer ${token}`
    },
    Query: thunder('query'),
    Mutation: thunder('mutation'),
    Subscription: ZeusSubscription(options.api_url.replace(/^http/, 'ws')),
    Wallet: wallet
  }
}
