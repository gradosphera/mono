/**
 * В Capital родитель у корневого проекта часто приходит как null/«» или нулевой checksum256 (64×«0»).
 * Такая строка truthy в JS — без нормализации сущность ошибочно считается вложенным компонентом.
 */
export function effectiveParentHash(parent_hash: string | null | undefined): string | undefined {
  if (parent_hash === undefined || parent_hash === null) {
    return undefined
  }
  const t = String(parent_hash).trim()
  if (t === '') {
    return undefined
  }
  if (/^0+$/.test(t)) {
    return undefined
  }
  return t
}
