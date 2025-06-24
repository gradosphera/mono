import { testMocks } from './testMocks'

export async function getFetch(url: string, params?: URLSearchParams): Promise<any> {
  if (process.env.NODE_ENV === 'test') {
    // Пробуем найти подходящий мок по url и params
    const mock = testMocks.find((m: any) => m.match(url, params))
    if (mock)
      return mock.data
  }

  try {
    const response = await fetch(`${url}?${params?.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.json()
  }
  catch (e: any) {
    throw new Error(`Ошибка соединения с ${url}: ${e.message}`)
  }
}
