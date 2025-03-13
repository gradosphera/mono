import { exec } from 'node:child_process'
import { config } from 'dotenv'

config()

export async function runContainer(): Promise<void> {
  return new Promise((resolve, reject) => {
    exec('docker compose up -d node', (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка при запуске контейнера: ${error.message}`)
        reject(error)
        return
      }
      resolve()
    })
  })
}
