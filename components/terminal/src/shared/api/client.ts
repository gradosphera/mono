import {createClient} from '@coopenomics/coopjs'
import { BACKEND_URL } from '../config'

// Создаем и экспортируем экземпляр API-клиента
export const client = createClient({
  baseUrl: BACKEND_URL + '/v1/graphql',
  headers: {
    'Content-Type': 'application/json',
  }
})

