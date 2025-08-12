// Комбинирование индекса (project_hash + username) как в C++ combine_checksum_ids
// Возвращает десятичную строку uint128 для использования с key_type 'i128'

function charToSymbol(c: string): number {
  if (c === '.') return 0
  if (c >= '1' && c <= '5') return c.charCodeAt(0) - '1'.charCodeAt(0) + 1
  if (c >= 'a' && c <= 'z') return c.charCodeAt(0) - 'a'.charCodeAt(0) + 6
  return 0
}

function nameToUint64(name: string): bigint {
  let value = 0n
  let i = 0
  for (; i < 12 && i < name.length; i++) {
    value <<= 5n
    value |= BigInt(charToSymbol(name[i]))
  }
  value <<= 4n + 5n * BigInt(12 - i)
  if (i < name.length) {
    value |= BigInt(charToSymbol(name[i])) & 0x0fn
  }
  return value
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  if (clean.length !== 64) throw new Error('Invalid sha256 hex')
  const out = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

function readBigUInt64LE(bytes: Uint8Array, offset = 0): bigint {
  let result = 0n
  for (let i = 0; i < 8; i++) {
    result |= BigInt(bytes[offset + i]) << (8n * BigInt(i))
  }
  return result
}

export function makeCombinedChecksum256NameIndexKey(projectHashHex: string, username: string): string {
  const bytes = hexToBytes(projectHashHex)
  const truncatedHashLE = readBigUInt64LE(bytes, 0)
  const nameValue = nameToUint64(username)
  const key128 = (truncatedHashLE << 64n) | nameValue
  return key128.toString()
}

export function makeCombinedChecksum256Uint64IndexKey(projectHashHex: string, id: number): string {
  const bytes = hexToBytes(projectHashHex)
  const truncatedHashLE = readBigUInt64LE(bytes, 0)
  const idValue = BigInt(id)
  const key128 = (truncatedHashLE << 64n) | idValue
  return key128.toString()
}
