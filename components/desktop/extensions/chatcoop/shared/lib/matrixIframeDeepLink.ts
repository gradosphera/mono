/**
 * Element Web: открыть комнату через hash-маршрут `#/room/<roomId>`.
 * Базовый `iframeUrl` от бэкенда может уже содержать hash — для deep link он заменяется.
 */
export function buildMatrixIframeSrc(baseUrl: string, matrixRoomId: string | undefined): string {
  const trimmed = matrixRoomId?.trim()
  if (!trimmed) {
    return baseUrl
  }
  const withoutHash = baseUrl.split('#')[0] ?? baseUrl
  return `${withoutHash}#/room/${encodeURIComponent(trimmed)}`
}
