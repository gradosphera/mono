import type { ClientConnectionOptions } from './types'
import { Bytes, Checksum256, PrivateKey } from '@wharfkit/session'
import WebSocket from 'isomorphic-ws'

import * as Classes from './classes'
import * as Mutations from './mutations'
import { type GraphQLResponse, Thunder, Subscription as ZeusSubscription } from './zeus'

import { Chain, ZeusScalars } from './zeus'

export * as Classes from './classes'
export * as Mutations from './mutations'
export * as Queries from './queries'
/**
 * @private
 */
export * as Types from './types'

export * as Zeus from './zeus'

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket as any
}

// Текущие заголовки для запросов, которые можно обновлять
let currentHeaders: Record<string, string> = {}

const scalars = ZeusScalars({
  Date: {
    decode: (e: unknown) => new Date(e as string), // Преобразует строку в объект Date
    encode: (e: unknown) => (e as Date).toISOString(), // Преобразует Date в ISO-строку
  },
  DateTime: {
    decode: (e: unknown) => new Date(e as string), // Преобразует строку в объект Date
    encode: (e: unknown) => (e as Date).toISOString(), // Преобразует Date в ISO-строку
  },
})

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
    })

    if (!response.ok) {
      return new Promise((resolve, reject) => {
        response
          .text()
          .then((text) => {
            try {
              reject(JSON.parse(text))
            }
            // eslint-disable-next-line unused-imports/no-unused-vars
            catch (err) {
              reject(text)
            }
          })
          .catch(reject)
      })
    }

    const json = await response.json() as GraphQLResponse

    if (json.errors) {
      console.log('json.errors', json.errors)
      throw json.errors // Возвращаем массив ошибок, обработанных в NestJS
    }

    return json.data
  }, { scalars })
}

/**
 * Создаёт клиент для взаимодействия с API, поддерживающий выполнение запросов, мутаций, подписок,
 * а также операций с блокчейном. Позволяет динамически изменять заголовок авторизации.
 *
 * @param options - Опции для настройки подключения клиента.
 * @param options.api_url - Базовый URL API, с которым будет происходить взаимодействие.
 * @param options.headers - Необязательные заголовки, которые будут добавляться ко всем запросам. По умолчанию — пустой объект.
 * @param options.chain_url - URL узла блокчейна.
 * @param options.chain_id - Уникальный идентификатор цепочки блокчейна.
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

  async function login(email: string, wif: string): Promise<Mutations.Auth.Login.IOutput['login']> {
    const now = (await wallet.getInfo()).head_block_time.toString()

    const privateKey = PrivateKey.fromString(wif)
    const bytes = Bytes.fromString(now, 'utf8')
    const checksum = Checksum256.hash(bytes)
    const signature = privateKey.signDigest(checksum).toString()

    const variables: Mutations.Auth.Login.IInput = {
      data: {
        email,
        now,
        signature,
      },
    }

    const { [Mutations.Auth.Login.name]: result } = await thunder('mutation')(
      Mutations.Auth.Login.mutation,
      {
        variables,
      },
    )

    currentHeaders.Authorization = `Bearer ${result.tokens.access.token}`

    return result
  }

  if (options.wif && options.username) {
    wallet.setWif(options.username, options.wif)
  }
  else if ((options.wif && !options.username) || (!options.wif && options.username)) {
    throw new Error('wif и username должны быть указаны одновременно')
  }

  return {
    setToken: (token: string) => {
      currentHeaders.Authorization = `Bearer ${token}`
    },
    Query: thunder('query'),
    Mutation: thunder('mutation'),
    Subscription: ZeusSubscription(options.api_url.replace(/^http/, 'ws')),
    Wallet: wallet,
    login,
  }
}
