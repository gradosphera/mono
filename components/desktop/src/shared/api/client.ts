import { Client } from '@coopenomics/sdk'
import { env } from 'src/shared/config'

// Создаем и экспортируем экземпляр API-клиента
export const client = Client.create({
  api_url: env.BACKEND_URL + '/v1/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
  chain_url: env.CHAIN_URL as string,
  chain_id: env.CHAIN_ID as string,
})

