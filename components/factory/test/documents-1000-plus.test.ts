import { beforeAll, describe, it } from 'vitest'
import { Generator } from '../src'
import { testDocumentGeneration } from './utils/testDocument'
import { generator, mongoUri } from './utils'

beforeAll(async () => {
  await generator.connect(mongoUri)
})

describe('тест генератора документов с registry_id >= 1000', async () => {
  // Документы капитализации и генерации
  it('генерируем соглашение о капитализации', async () => {
    await testDocumentGeneration({
      registry_id: 1000,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем соглашение о генерации', async () => {
    await testDocumentGeneration({
      registry_id: 1001,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем приложение к соглашению о генерации', async () => {
    await testDocumentGeneration({
      registry_id: 1002,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документы расходов
  it('генерируем заявление о расходах', async () => {
    await testDocumentGeneration({
      registry_id: 1010,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем решение о расходах', async () => {
    await testDocumentGeneration({
      registry_id: 1011,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документы инвестиций в генерацию
  it('генерируем заявление об инвестициях денег в генерацию', async () => {
    await testDocumentGeneration({
      registry_id: 1020,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем заявление о возврате неиспользованных денег генерации', async () => {
    await testDocumentGeneration({
      registry_id: 1025,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документы инвестиций в капитализацию
  it('генерируем заявление об инвестициях денег в капитализацию', async () => {
    await testDocumentGeneration({
      registry_id: 1030,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документы взносов результатов
  it('генерируем заявление о взносе результатов', async () => {
    await testDocumentGeneration({
      registry_id: 1040,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем решение о взносе результатов', async () => {
    await testDocumentGeneration({
      registry_id: 1041,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем акт о взносе результатов', async () => {
    await testDocumentGeneration({
      registry_id: 1042,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документы получения займов
  it('генерируем заявление о получении займа', async () => {
    await testDocumentGeneration({
      registry_id: 1050,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем решение о получении займа', async () => {
    await testDocumentGeneration({
      registry_id: 1051,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документы инвестиций имущества в генерацию
  it('генерируем заявление об инвестициях имущества в генерацию', async () => {
    await testDocumentGeneration({
      registry_id: 1060,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем решение об инвестициях имущества в генерацию', async () => {
    await testDocumentGeneration({
      registry_id: 1061,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем акт об инвестициях имущества в генерацию', async () => {
    await testDocumentGeneration({
      registry_id: 1062,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документы инвестиций имущества в капитализацию
  it('генерируем заявление об инвестициях имущества в капитализацию', async () => {
    await testDocumentGeneration({
      registry_id: 1070,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем решение об инвестициях имущества в капитализацию', async () => {
    await testDocumentGeneration({
      registry_id: 1071,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем акт об инвестициях имущества в капитализацию', async () => {
    await testDocumentGeneration({
      registry_id: 1072,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документы конвертации
  it('генерируем заявление о конвертации генерации в основной кошелёк', async () => {
    await testDocumentGeneration({
      registry_id: 1080,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем заявление о конвертации генерации в проект', async () => {
    await testDocumentGeneration({
      registry_id: 1081,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем заявление о конвертации генерации в капитализацию', async () => {
    await testDocumentGeneration({
      registry_id: 1082,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем заявление о конвертации капитализации в основной кошелёк', async () => {
    await testDocumentGeneration({
      registry_id: 1090,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })
})
