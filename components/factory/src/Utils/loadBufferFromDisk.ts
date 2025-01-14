import fs from 'node:fs'

// eslint-disable-next-line node/prefer-global/buffer
export function loadBufferFromDisk(fileName: string): Buffer {
  const buffer = fs.readFileSync(`documents/${fileName}`)
  return buffer
}
