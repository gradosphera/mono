/** Значения CapitalStoryContentFormat в frontmatter (MARKDOWN, …). */

export function storyContentFormatFromCliOption(s: string): string {
  const k = s.trim().toLowerCase()
  const map: Record<string, string> = {
    markdown: 'MARKDOWN',
    mermaid: 'MERMAID',
    drawio: 'DRAWIO',
    bpmn: 'BPMN',
  }
  const v = map[k]
  if (!v) {
    throw new Error(
      `Неизвестный --format «${s}». Допустимо: markdown, mermaid, drawio, bpmn`,
    )
  }
  return v
}
