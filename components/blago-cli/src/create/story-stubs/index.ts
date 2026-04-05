// Рыбы тел story по content_format (Capital) — чтобы черновик сразу отображался в UI.

import { storyStubBpmn } from './bpmn.js'
import { storyStubDrawio } from './drawio.js'
import { storyStubMarkdown } from './markdown.js'
import { storyStubMermaid } from './mermaid.js'

const STUB_BY_FORMAT: Record<'MARKDOWN' | 'MERMAID' | 'DRAWIO' | 'BPMN', string> = {
  MARKDOWN: storyStubMarkdown,
  MERMAID: storyStubMermaid,
  DRAWIO: storyStubDrawio,
  BPMN: storyStubBpmn,
}

export function storyStubBodyForFormat(contentFormat: string): string {
  const key = contentFormat as keyof typeof STUB_BY_FORMAT
  const body = STUB_BY_FORMAT[key]
  if (body === undefined) {
    throw new Error(`Нет рыбы для content_format «${contentFormat}»`)
  }
  return body
}
