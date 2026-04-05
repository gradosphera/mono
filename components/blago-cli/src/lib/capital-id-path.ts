/** Префикс сегмента пути из Capital id (число проекта или строка задачи вида PREFIX-12). */
export function capitalIdPathPrefix(capitalId: string | number): string {
  const s = String(capitalId).trim()
  if (s === '') {
    return '0'
  }
  const t = s.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return t.length > 0 ? t : 'id'
}

/**
 * Два символа в начале имени файла требования (как короткий префикс id у задач):
 * из букв/цифр `_id`; если меньше 2 — добираем из story_hash (только запасной пул символов).
 */
export function storyRequirementIdPrefix2(recordId: string, storyHashFallback: string): string {
  const alnum = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase()
  let pool = alnum(recordId)
  if (pool.length < 2) {
    pool = `${pool}${alnum(storyHashFallback)}`
  }
  if (pool.length >= 2) {
    return pool.slice(0, 2)
  }
  return `${pool}00`.slice(0, 2)
}
