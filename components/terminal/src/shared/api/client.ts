import {createClient} from '@coopenomics/coopjs'
import { BACKEND_URL, CHAIN_ID, CHAIN_URL } from '../config'

// Создаем и экспортируем экземпляр API-клиента
export const client = createClient({
  baseUrl: BACKEND_URL + '/v1/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
  blockchainUrl: CHAIN_URL,
  chainId: CHAIN_ID,
})

