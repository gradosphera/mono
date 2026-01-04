import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import mongoose from 'mongoose'

export async function clearDB(): Promise<void> {
  // Очистка MongoDB
  // eslint-disable-next-line node/prefer-global/process
  await mongoose.connect(process.env.MONGO_URI as string)

  try {
    await mongoose.connection.collection('users').deleteMany({})
    console.log('Все документы удалены из коллекции users')
  }
  catch (e) {
    console.error('Ошибка при удалении:', e)
  }

  try {
    await mongoose.connection.collection('sync').deleteMany({})
    console.log('Все документы удалены из коллекции sync')
  }
  catch (e) {
    console.error('Ошибка при удалении:', e)
  }

  try {
    await mongoose.connection.collection('actions').deleteMany({})
    console.log('Все документы удалены из коллекции actions')
  }
  catch (e) {
    console.error('Ошибка при удалении:', e)
  }

  try {
    await mongoose.connection.collection('deltas').deleteMany({})
    console.log('Все документы удалены из коллекции deltas')
  }
  catch (e) {
    console.error('Ошибка при удалении:', e)
  }

  // PostgreSQL будет пересоздан полностью в скрипте extra_reboot.sh
}

export async function clearDirectory(dirPath: string): Promise<void> {
  try {
    const files = await fs.readdir(dirPath)
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = await fs.stat(filePath)

      if (stats.isDirectory()) {
        await clearDirectory(filePath)
        await fs.rmdir(filePath)
      }
      else {
        await fs.unlink(filePath)
      }
    }
  }
  catch (err) {
    console.error(`Error clearing directory ${dirPath}:`, err)
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath)
  }
  catch (err) {
    // console.error(`Error deleting file ${filePath}:`, err)
  }
}
