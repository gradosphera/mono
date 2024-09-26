import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

// Функция для выполнения GET запроса
export async function getRequest(url: string, params: Record<string, any>): Promise<any> {
  try {
    // eslint-disable-next-line node/prefer-global/process
    const response = await axios.get(`${process.env.COOPBACK_URL}/v1/${url}`, {
      params,
      headers: {
        // eslint-disable-next-line node/prefer-global/process
        'server-secret': process.env.SERVER_SECRET,
      },
    })
    return response.data
  }
  catch (error: any) {
    console.error('Ошибка при выполнении GET запроса:', error.message)
    throw error
  }
}

// Функция для выполнения POST запроса
export async function postRequest(url: string, data: any): Promise<any> {
  try {
    // eslint-disable-next-line node/prefer-global/process
    const response = await axios.post(`${process.env.COOPBACK_URL}/v1/${url}`, data, {
      headers: {
        // eslint-disable-next-line node/prefer-global/process
        'server-secret': process.env.SERVER_SECRET,
      },
    })
    return response.data
  }
  catch (error: any) {
    console.error('Ошибка при выполнении POST запроса:', error.message)
    throw error
  }
}
