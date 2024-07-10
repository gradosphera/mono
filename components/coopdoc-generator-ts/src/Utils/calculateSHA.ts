import { createHash } from 'node:crypto'

export function calculateSha256(buffer: Uint8Array): string {
  const hash = createHash('sha256')
  hash.update(buffer)
  return hash.digest('hex').toUpperCase()
}
