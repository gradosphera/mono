import axios from 'axios'

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function checkHealth() {
  const check = async (): Promise<void> => {
    try {
      const response = await axios.post('http://127.0.0.1:8888/v1/chain/get_info')
      const result = response.data
      await sleep(1000)

      console.log('Node is healthy. Continue.', result)
    }

    catch (error: any) {
      console.error(error)
      console.log('Блокчейн не доступен с ошибкой. Он поднят? docker compose up -d')

      await sleep(1000)

      return check() // Повторный вызов функции
    }
  }

  return check()
}
