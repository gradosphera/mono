import { beforeAll, describe, it } from 'vitest'
import { Generator } from '../src'
import { testDocumentGeneration } from './utils/testDocument'
import { generator, mongoUri } from './utils'

describe('тест генератора документов ЦПП БЛАГОРОСТ', async () => {
  beforeAll(async () => {
    await generator.connect(mongoUri)
  })

  // Документ 998 - Положение о ЦПП БЛАГОРОСТ
  it('генерируем Положение о ЦПП БЛАГОРОСТ', async () => {
    await testDocumentGeneration({
      registry_id: 998,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документ 999 - Шаблон публичной оферты (без шапки)
  it('генерируем шаблон публичной оферты по ЦПП БЛАГОРОСТ', async () => {
    // Добавляем данные протокола для документа 998
    await generator.update('vars', { coopname: 'voskhod' }, {
      blagorost_program: {
        protocol_number: '01-12-2024',
        protocol_day_month_year: '01 декабря 2024 г.',
      },
    })

    await testDocumentGeneration({
      registry_id: 999,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Документ 1000 - Публичная оферта для пайщика (с шапкой)
  it('генерируем публичную оферту для пайщика по ЦПП БЛАГОРОСТ', async () => {
    // Добавляем данные протокола для документа 999
    await generator.update('vars', { coopname: 'voskhod' }, {
      blagorost_offer_template: {
        protocol_number: '15-12-2024',
        protocol_day_month_year: '15 декабря 2024 г.',
      },
    })

    await testDocumentGeneration({
      registry_id: 1000,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })
})
