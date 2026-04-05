/**
 * Desktop передаёт в SDK `BACKEND_URL + '/v1/graphql'`. В config blago ожидаем тот же базовый BACKEND_URL.
 */
export function toGraphqlApiUrl(apiUrl: string): string {
  const base = apiUrl.trim().replace(/\/+$/, '')
  if (base.length === 0) {
    return apiUrl.trim()
  }
  if (/\/v1\/graphql$/i.test(base) || /\/graphql$/i.test(base)) {
    return base
  }
  return `${base}/v1/graphql`
}
