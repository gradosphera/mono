import { Client } from '@coopenomics/sdk'
console.log(process.env.BACKEND_URL)
console.log(process.env.CHAIN_URL)
console.log(process.env.CHAIN_ID)

// Создаем и экспортируем экземпляр API-клиента
export const client = Client.create({
  api_url: process.env.BACKEND_URL + '/v1/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
  chain_url: process.env.CHAIN_URL as string,
  chain_id: process.env.CHAIN_ID as string,
})

