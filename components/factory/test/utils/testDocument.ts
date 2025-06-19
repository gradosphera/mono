import { expect } from 'vitest'
import { loadBufferFromDisk } from '../../src/Utils/loadBufferFromDisk'
import { saveBufferToDisk } from '../../src/Utils/saveBufferToDisk'
import type { IGenerate, IGeneratedDocument } from '../../src'
import { calculateSha256 } from '../../src/Utils/calculateSHA'
import { generator } from '.'

export async function testDocumentGeneration<T extends IGenerate = IGenerate>(
  params: T, // Динамический объект с любыми параметрами
) {
  const document: IGeneratedDocument = await generator.generate(params)

  // Генерируем уникальный суффикс для имен файлов
  const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 7)

  const filename1 = `${document.meta.title}-${document.meta.username}-${uniqueSuffix}.pdf`
  await saveBufferToDisk(document.binary, filename1)

  const regenerated_document: IGeneratedDocument = await generator.generate({
    ...document.meta,
  })

  const filename2 = `${document.meta.title}-${document.meta.username}-regenerated-${uniqueSuffix}.pdf`
  await saveBufferToDisk(regenerated_document.binary, filename2)

  expect(document.meta).toEqual(regenerated_document.meta)
  expect(document.hash).toEqual(regenerated_document.hash)

  const document_from_disk1 = await loadBufferFromDisk(filename1)
  const document_from_disk2 = await loadBufferFromDisk(filename2)

  const hash1 = calculateSha256(document_from_disk1)
  const hash2 = calculateSha256(document_from_disk2)

  const getted_document = await generator.getDocument({ hash: regenerated_document.hash })

  expect(getted_document).toBeDefined()
  expect(getted_document.hash).toEqual(document.hash)

  expect(hash1).toEqual(hash2)
}
