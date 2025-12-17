import fs from 'node:fs'
import path from 'node:path'

const documents_dir = process.env.DOCUMENTS_DIR || './documents'

export async function saveBufferToDisk(buffer: Uint8Array, fileName: string) {
  const fullPath = path.join(documents_dir, fileName)
  const dir = path.dirname(fullPath)

  // Создаем директорию, если она не существует
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(fullPath, buffer)
}
