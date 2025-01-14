import {createClient} from '@coopenomics/sdk'
import { BACKEND_URL, CHAIN_ID, CHAIN_URL } from '../config'

// Создаем и экспортируем экземпляр API-клиента
export const client = createClient({
  api_url: BACKEND_URL + '/v1/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
  chain_url: CHAIN_URL,
  chain_id: CHAIN_ID,
})

