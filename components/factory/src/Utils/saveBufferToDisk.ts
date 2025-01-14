import fs from 'node:fs'

const documents_dir = process.env.DOCUMENTS_DIR || './documents'

export async function saveBufferToDisk(buffer: Uint8Array, fileName: string) {
  fs.writeFileSync(`${documents_dir}/${fileName}`, buffer)
}
