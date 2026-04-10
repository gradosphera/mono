/** Нормализация меток задачи: trim, без пустых, без дубликатов (порядок сохраняется). */
export function normalizeIssueLabels(labels: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of labels) {
    const t = typeof raw === 'string' ? raw.trim() : ''
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

/** Чтение `metadata.labels` из ответа CapitalIssue (metadata — JSON). */
export function getIssueLabels(issue: { metadata?: unknown } | null | undefined): string[] {
  if (!issue?.metadata || typeof issue.metadata !== 'object' || issue.metadata === null) {
    return []
  }
  const labels = (issue.metadata as Record<string, unknown>).labels
  if (!Array.isArray(labels)) return []
  const strings = labels.filter((x): x is string => typeof x === 'string')
  return normalizeIssueLabels(strings)
}
