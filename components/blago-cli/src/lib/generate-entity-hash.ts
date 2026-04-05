// 64 hex — как generateUniqueHash на desktop / канон Capital для story_hash.

import { randomBytes } from 'node:crypto'

export function generateEntityHashHex64(): string {
  return randomBytes(32).toString('hex')
}
