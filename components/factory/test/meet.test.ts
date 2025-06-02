import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Cooperative } from 'cooptypes'
import { Generator } from '../src'
import type { IGenerate, IGeneratedDocument } from '../src/Interfaces/Documents'
import { MongoDBConnector } from '../src/Services/Databazor'
import { coopname, deleteAllFiles, generator, mongoUri } from './utils'
import { testDocumentGeneration } from './utils/testDocument'

beforeAll(async () => {
  await generator.connect(mongoUri)
})

beforeEach(async () => {

})

describe('тест генератора документов общих собраний', async () => {
  const testMeetHash = 'test_meet_hash_12345'
  const testDecisionId = 2

  // // Тестовые данные для документа 300 (передаются напрямую)
  // const testMeetData = {
  //   type: 'regular' as const,
  //   created_at_day: '15',
  //   created_at_month: 'декабря',
  //   created_at_year: '2024',
  //   open_at_date: '20.12.2024',
  //   open_at_time: '10:00',
  //   registration_datetime: '19.12.2024 до 18:00',
  //   close_at_datetime: '21.12.2024 18:00',
  //   presider_last_name: 'Иванов',
  //   presider_first_name: 'Иван',
  //   presider_middle_name: 'Иванович',
  // }

  // const testQuestions = [
  //   {
  //     number: '1',
  //     title: 'Утверждение годового отчёта',
  //     context: 'О деятельности кооператива за 2024 год',
  //     decision: 'Утвердить годовой отчёт кооператива за 2024 год',
  //   },
  //   {
  //     number: '2',
  //     title: 'Избрание совета кооператива',
  //     decision: 'Избрать новый состав совета кооператива',
  //   },
  // ]

  // it('генерируем предложение повестки дня (300)', async () => {
  //   await testDocumentGeneration<Cooperative.Registry.AnnualGeneralMeetingAgenda.Action>({
  //     registry_id: Cooperative.Registry.AnnualGeneralMeetingAgenda.registry_id,
  //     coopname: 'voskhod',
  //     username: 'individual',
  //     meet: testMeetData,
  //     questions: testQuestions,
  //   })
  // })

  it('генерируем решение совета о созыве собрания (301)', async () => {
    await testDocumentGeneration<Cooperative.Registry.AnnualGeneralMeetingSovietDecision.Action>({
      registry_id: Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id,
      coopname: 'voskhod',
      username: 'ant',
      decision_id: testDecisionId,
      meet_hash: testMeetHash,
    })
  })

  it('генерируем уведомление о проведении собрания (302)', async () => {
    await testDocumentGeneration<Cooperative.Registry.AnnualGeneralMeetingNotification.Action>({
      registry_id: Cooperative.Registry.AnnualGeneralMeetingNotification.registry_id,
      coopname: 'voskhod',
      username: 'individual',
      meet_hash: testMeetHash,
    })
  })

  it('генерируем заявление с бюллетенем для голосования (303)', async () => {
    await testDocumentGeneration<Cooperative.Registry.AnnualGeneralMeetingVotingBallot.Action>({
      registry_id: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.registry_id,
      coopname: 'voskhod',
      username: 'individual',
      meet_hash: testMeetHash,
    })
  })

  it('генерируем протокол решения общего собрания (304)', async () => {
    await testDocumentGeneration<Cooperative.Registry.AnnualGeneralMeetingDecision.Action>({
      registry_id: Cooperative.Registry.AnnualGeneralMeetingDecision.registry_id,
      coopname: 'voskhod',
      username: 'individual',
      meet_hash: testMeetHash,
    })
  })
})
