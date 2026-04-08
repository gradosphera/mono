// Пути артефактов ChatCoop (pull): не для blago add / push.

function normRel(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/^\/+/, '')
}

/** Переписка Matrix (`…/messages/…`) и транскрипции (`…/meetings/…`) — только `blago pull` / `restore`. */
export function isPullOnlyCommunicationRelativePath(rel: string): boolean {
  const n = normRel(rel)
  return n.includes('/messages/') || n.includes('/meetings/')
}
