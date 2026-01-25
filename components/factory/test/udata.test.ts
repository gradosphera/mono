import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { FactoryDataEnum } from '../src/Models/Udata'
import { Generator } from '../src'
import { coopname, generator, mongoUri } from './utils'

beforeAll(async () => {
  await generator.connect(mongoUri)
})

beforeEach(async () => {
  // Очистка коллекции udatas перед каждым тестом
  const storage = generator.storage
  if (storage) {
    const collection = storage.getCollection('udatas')
    await collection.deleteMany({})
  }
})

describe('тест модели пользовательских данных (udata)', () => {
  it('сохранение, извлечение и удаление пользовательских данных', async () => {
    const udata1 = {
      coopname: 'voskhod',
      username: 'testuser1',
      key: FactoryDataEnum.SOME_KEY,
      value: 'test value 1',
      metadata: { additional: 'data1' },
    }

    const udata2 = {
      coopname: 'voskhod',
      username: 'testuser1',
      key: FactoryDataEnum.ANOTHER_KEY,
      value: 'test value 2',
      metadata: { additional: 'data2' },
    }

    const udata3 = {
      coopname: 'voskhod',
      username: 'testuser2',
      key: FactoryDataEnum.SOME_KEY,
      value: 'test value 3',
      metadata: { additional: 'data3' },
    }

    // Сохраняем данные
    const saved1 = await generator.save('udata', udata1)
    const saved2 = await generator.save('udata', udata2)
    const saved3 = await generator.save('udata', udata3)

    expect(saved1.insertedId).toBeDefined()
    expect(saved2.insertedId).toBeDefined()
    expect(saved3.insertedId).toBeDefined()

    // Извлекаем конкретные данные
    const retrieved1 = await generator.get('udata', {
      coopname: 'voskhod',
      username: 'testuser1',
      key: FactoryDataEnum.SOME_KEY,
    }) as any

    const retrieved2 = await generator.get('udata', {
      coopname: 'voskhod',
      username: 'testuser1',
      key: FactoryDataEnum.ANOTHER_KEY,
    }) as any

    const retrieved3 = await generator.get('udata', {
      coopname: 'voskhod',
      username: 'testuser2',
      key: FactoryDataEnum.SOME_KEY,
    }) as any

    // Проверяем, что данные извлечены корректно
    expect(retrieved1.value).toEqual('test value 1')
    expect(retrieved1.metadata.additional).toEqual('data1')
    expect(retrieved1.deleted).toEqual(false)
    expect(retrieved1.block_num).toBeDefined()
    expect(retrieved1._id).toEqual(saved1.insertedId)

    expect(retrieved2.value).toEqual('test value 2')
    expect(retrieved2.metadata.additional).toEqual('data2')
    expect(retrieved2.deleted).toEqual(false)
    expect(retrieved2.block_num).toBeDefined()
    expect(retrieved2._id).toEqual(saved2.insertedId)

    expect(retrieved3.value).toEqual('test value 3')
    expect(retrieved3.metadata.additional).toEqual('data3')
    expect(retrieved3.deleted).toEqual(false)
    expect(retrieved3.block_num).toBeDefined()
    expect(retrieved3._id).toEqual(saved3.insertedId)

    // Проверяем получение списка данных
    const udataList1 = await generator.list('udata', { coopname: 'voskhod', username: 'testuser1' })
    const udataList2 = await generator.list('udata', { coopname: 'voskhod', username: 'testuser2' })

    expect(udataList1.results).toHaveLength(2) // testuser1 имеет 2 разных ключа
    expect(udataList2.results).toHaveLength(1) // testuser2 имеет 1 ключ

    expect(udataList1.page).toBeDefined()
    expect(udataList1.limit).toBeDefined()
    expect(udataList1.totalPages).toBeDefined()
    expect(udataList1.totalResults).toBeDefined()

    expect(udataList2.page).toBeDefined()
    expect(udataList2.limit).toBeDefined()
    expect(udataList2.totalPages).toBeDefined()
    expect(udataList2.totalResults).toBeDefined()

    // Проверяем историю данных
    const history1 = await generator.getHistory('udata', {
      coopname: 'voskhod',
      username: 'testuser1',
      key: FactoryDataEnum.SOME_KEY,
    }) as any[]

    expect(history1).toHaveLength(1)
    expect(history1[0].value).toEqual('test value 1')

    // Удаляем данные
    await generator.del('udata', {
      coopname: 'voskhod',
      username: 'testuser1',
      key: FactoryDataEnum.SOME_KEY,
    })

    await generator.del('udata', {
      coopname: 'voskhod',
      username: 'testuser1',
      key: FactoryDataEnum.ANOTHER_KEY,
    })

    await generator.del('udata', {
      coopname: 'voskhod',
      username: 'testuser2',
      key: FactoryDataEnum.SOME_KEY,
    })

    // Проверяем, что данные помечены как удаленные
    const deleted1 = await generator.get('udata', {
      coopname: 'voskhod',
      username: 'testuser1',
      key: FactoryDataEnum.SOME_KEY,
    }) as any

    const deleted2 = await generator.get('udata', {
      coopname: 'voskhod',
      username: 'testuser1',
      key: FactoryDataEnum.ANOTHER_KEY,
    }) as any

    const deleted3 = await generator.get('udata', {
      coopname: 'voskhod',
      username: 'testuser2',
      key: FactoryDataEnum.SOME_KEY,
    }) as any

    expect(deleted1.deleted).toEqual(true)
    expect(deleted2.deleted).toEqual(true)
    expect(deleted3.deleted).toEqual(true)
  })

  it('тестирование версионности данных по блок', async () => {
    const baseUdata = {
      coopname: 'voskhod',
      username: 'versionuser',
      key: FactoryDataEnum.SOME_KEY,
    }

    // Сохраняем первую версию (version 1)
    const udata1 = {
      ...baseUdata,
      value: 'version 1',
      metadata: { version: 1 },
    }

    const saved1 = await generator.save('udata', udata1)
    expect(saved1.insertedId).toBeDefined()

    // Ждем 2 секунды между сохранениями
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Сохраняем вторую версию (version 2)
    const udata2 = {
      ...baseUdata,
      value: 'version 2',
      metadata: { version: 2 },
    }

    const saved2 = await generator.save('udata', udata2)
    expect(saved2.insertedId).toBeDefined()
    expect(saved1.insertedId).not.toEqual(saved2.insertedId)

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Сохраняем третью версию (version 3)
    const udata3 = {
      ...baseUdata,
      value: 'version 3',
      metadata: { version: 3 },
    }

    const saved3 = await generator.save('udata', udata3)
    expect(saved3.insertedId).toBeDefined()
    expect(saved3.insertedId).not.toEqual(saved2.insertedId)
    expect(saved3.insertedId).not.toEqual(saved1.insertedId)

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Сохраняем четвертую версию (version 4)
    const udata4 = {
      ...baseUdata,
      value: 'version 4',
      metadata: { version: 4 },
    }

    const saved4 = await generator.save('udata', udata4)
    expect(saved4.insertedId).toBeDefined()
    expect(saved4.insertedId).not.toEqual(saved3.insertedId)

    // Все сохраненные версии имеют уникальные ObjectId
    const savedIds = [saved1.insertedId, saved2.insertedId, saved3.insertedId, saved4.insertedId]
    expect(new Set(savedIds).size).toEqual(4)

    // Извлекаем текущую версию - должна быть самая свежая (version 4)
    const current = await generator.get('udata', {
      coopname: 'voskhod',
      username: 'versionuser',
      key: FactoryDataEnum.SOME_KEY,
    }) as any

    expect(current.value).toEqual('version 4')
    expect(current.metadata.version).toEqual(4)
    expect(current.block_num).toBeDefined()

    // Проверяем историю - должны быть все 4 версии
    const history = await generator.getHistory('udata', {
      coopname: 'voskhod',
      username: 'versionuser',
      key: FactoryDataEnum.SOME_KEY,
    }) as any[]

    expect(history.length).toEqual(4)

    // История отсортирована по убыванию block_num
    expect(history[0].value).toEqual('version 4') // Самая свежая
    expect(history[1].value).toEqual('version 3')
    expect(history[2].value).toEqual('version 2')
    expect(history[3].value).toEqual('version 1') // Самая старая

    // Проверяем, что block_num уменьшаются
    expect(history[0].block_num).toBeGreaterThanOrEqual(history[1].block_num)
    expect(history[1].block_num).toBeGreaterThanOrEqual(history[2].block_num)
    expect(history[2].block_num).toBeGreaterThanOrEqual(history[3].block_num)

    // Тестируем извлечение по конкретному блоку
    // Находим block_num второй версии (version 2)
    const version2Entry = history.find(h => h.value === 'version 2')
    expect(version2Entry).toBeDefined()
    const version2BlockNum = version2Entry.block_num

    // Создаем фильтр с block_num = version2BlockNum
    // Это должно вернуть версию, которая была актуальна ДО этого блока
    const filterWithBlock = {
      coopname: 'voskhod',
      username: 'versionuser',
      key: FactoryDataEnum.SOME_KEY,
      block_num: version2BlockNum,
    }

    const versionAtBlock = await generator.get('udata', filterWithBlock) as any
    expect(versionAtBlock).toBeDefined()
    // Должна вернуться version 2, так как она была сохранена с block_num = version2BlockNum
    expect(versionAtBlock.value).toEqual('version 2')
    expect(versionAtBlock.metadata.version).toEqual(2)

    // Еще один тест - запрашиваем версию на блоке перед version2BlockNum
    const blockBeforeVersion2 = version2BlockNum - 1
    const filterBeforeVersion2 = {
      coopname: 'voskhod',
      username: 'versionuser',
      key: FactoryDataEnum.SOME_KEY,
      block_num: blockBeforeVersion2,
    }

    const versionBeforeVersion2 = await generator.get('udata', filterBeforeVersion2) as any
    expect(versionBeforeVersion2).toBeDefined()
    // Должна вернуться version 1, так как version 2 еще не была сохранена
    expect(versionBeforeVersion2.value).toEqual('version 1')
    expect(versionBeforeVersion2.metadata.version).toEqual(1)
  })

  it('тестирование нескольких пользователей с одинаковыми ключами', async () => {
    const users = ['user1', 'user2', 'user3']

    // Сохраняем одинаковые ключи для разных пользователей
    for (const username of users) {
      const udata = {
        coopname: 'voskhod',
        username,
        key: FactoryDataEnum.SOME_KEY,
        value: `value for ${username}`,
        metadata: { user: username },
      }

      await generator.save('udata', udata)
    }

    // Проверяем, что каждый пользователь имеет свои данные
    for (const username of users) {
      const retrieved = await generator.get('udata', {
        coopname: 'voskhod',
        username,
        key: FactoryDataEnum.SOME_KEY,
      }) as any

      expect(retrieved.value).toEqual(`value for ${username}`)
      expect(retrieved.metadata.user).toEqual(username)
    }

    // Проверяем список всех данных
    const allUdata = await generator.list('udata', { coopname: 'voskhod' })
    expect(allUdata.results).toHaveLength(3)
    expect(allUdata.totalResults).toEqual(3)
  })
})
