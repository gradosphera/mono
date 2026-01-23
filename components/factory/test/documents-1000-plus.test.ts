import { beforeAll, describe, it } from 'vitest'
import { Generator } from '../src'
import { testDocumentGeneration } from './utils/testDocument'
import { generator, mongoUri } from './utils'

beforeAll(async () => {
  await generator.connect(mongoUri)
})

describe('тест генератора документов с registry_id >= 1000', async () => {
  // Шаблоны документов ЦПП ГЕНЕРАТОР
  it('генерируем положение о целевой потребительской программе "ГЕНЕРАТОР"', async () => {
    await testDocumentGeneration({
      registry_id: 994,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем шаблон пользовательского соглашения (оферты) по участию в целевой потребительской программе "ГЕНЕРАТОР"', async () => {
    await testDocumentGeneration({
      registry_id: 995,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  it('генерируем пользовательское соглашение (оферту) по участию в целевой потребительской программе "ГЕНЕРАТОР"', async () => {
    await testDocumentGeneration({
      registry_id: 996,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

  // Шаблоны документов
  it('генерируем шаблон договора участия в хозяйственной деятельности', async () => {
    await testDocumentGeneration({
      registry_id: 997,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
    })
  })

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
      contributor_hash: 'ed3bcfd5b681aa83d3956642e19320d5036c5a7533ebb4c4bdd81db412c6474301f7561cbe0d61fc666334119c21bffbb955526ee923f5e637d6167af2a903a2',
      lang: 'ru',
    })
  })

  it('генерируем приложение к соглашению о генерации для проекта (1002)', async () => {
    await testDocumentGeneration({
      registry_id: 1002,
      coopname: 'voskhod',
      username: 'ant',
      appendix_hash: 'A001ZSA1',
      contributor_hash: 'ED3BCFC5B681AA83D123456789ABCDEF',
      contributor_created_at: '11.04.2024',
      project_name: 'Проект цифровой платформы',
      project_hash: 'B2C3D4E5F6789ABC',
      lang: 'ru',
    })
  })

  it('генерируем дополнение к приложению для компонента (1003)', async () => {
    await testDocumentGeneration({
      registry_id: 1003,
      coopname: 'voskhod',
      username: 'ant',
      appendix_hash: 'A002ZSA2',
      parent_appendix_hash: 'A001ZSA1',
      contributor_hash: 'ED3BCFC5B681AA83D123456789ABCDEF',
      contributor_created_at: '11.04.2024',
      component_name: 'Компонент разработки',
      component_hash: 'A1B2C3D4E5F6789A',
      project_name: 'Проект цифровой платформы',
      project_hash: 'B2C3D4E5F6789ABC',
      lang: 'ru',
    })
  })

  it('генерируем заявление на инициализацию проекта', async () => {
    await testDocumentGeneration({
      registry_id: 1005,
      coopname: 'voskhod',
      username: 'ant',
      project_name: 'Проект цифровой платформы',
      project_hash: 'B2C3D4E5F6789ABC',
      component_name: 'Компонент разработки',
      component_hash: 'A1B2C3D4E5F6789A',
      is_component: true,
      lang: 'ru',
    })
  })

  it('генерируем решение об инициализации проекта', async () => {
    await testDocumentGeneration({
      registry_id: 1006,
      coopname: 'voskhod',
      username: 'ant',
      decision_id: 1,
      project_name: 'Проект цифровой платформы',
      project_hash: 'B2C3D4E5F6789ABC',
      component_name: 'Компонент разработки',
      component_hash: 'A1B2C3D4E5F6789A',
      is_component: true,
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
      appendix_hash: 'A001INV1',
      appendix_created_at: '12.01.2026',
      contributor_hash: 'INV123456789ABCDEF',
      contributor_created_at: '10.01.2026',
      project_hash: 'PRJ20260115001',
      amount: '50000.00 RUB',
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
