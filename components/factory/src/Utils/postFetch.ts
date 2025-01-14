export async function postFetch(url: string, body: any): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Ошибка ответа от ${url}: ${response.statusText}`)
    }

    return response.json()
  }
  catch (e: any) {
    throw new Error(`Ошибка соединения с ${url}: ${e.message}`)
  }
}
