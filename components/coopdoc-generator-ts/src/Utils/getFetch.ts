export async function getFetch(url: string, params?: URLSearchParams): Promise<any> {
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
