import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { RegistratorContract, SovietContract } from 'cooptypes'
import { Cooperative } from 'cooptypes'
import { v4 as uuidv4 } from 'uuid'
import { Generator } from '../src'
import type { IGenerate, IGeneratedDocument } from '../src/Interfaces/Documents'
import { saveBufferToDisk } from '../src/Utils/saveBufferToDisk'
import { loadBufferFromDisk } from '../src/Utils/loadBufferFromDisk'
import { calculateSha256 } from '../src/Utils/calculateSHA'
import { MongoDBConnector } from '../src/Services/Databazor'

import type { ExternalEntrepreneurData, ExternalIndividualData, ExternalOrganizationData, ExternalProjectData, IVars } from '../src/Models'
import type { PaymentData } from '../src/Models/PaymentMethod'
import type { CoopenomicsAgreement } from '../src/templates'
import { PrivacyPolicy, Registry, RegulationElectronicSignature, UserAgreement, WalletAgreement } from '../src/templates'
import { signatureExample } from './signatureExample'
import { coopname, deleteAllFiles, generator, mongoUri } from './utils'
import { testDocumentGeneration } from './utils/testDocument'

beforeAll(async () => {
  generator.connect(mongoUri)
})

beforeEach(async () => {

})

describe('тест генератора документов', async () => {
  it('генерируем заявление на паевый взнос имуществом', async () => {
    await testDocumentGeneration<Cooperative.Registry.AssetContributionStatement.Action>({
      registry_id: Cooperative.Registry.AssetContributionStatement.registry_id,
      coopname: 'voskhod',
      username: 'entrepreneur',
      request: {
        hash: '917f7443a115d495574dbe73405b7b6be3fed929526ba736228f3ff234ad7fce',
        title: 'Молоко "Бурёнка"',
        unit_of_measurement: 'Литр',
        units: 10,
        unit_cost: '100.0000 RUB',
        total_cost: '1000.0000 RUB',
        currency: 'RUB',
        type: 'Материальный',
        program_id: 1,
      },
    })
  })

  it('генерируем решение о приеме паевого взноса имуществом', async () => {
    await testDocumentGeneration<Cooperative.Registry.AssetContributionDecision.Action>({
      registry_id: Cooperative.Registry.AssetContributionDecision.registry_id,
      coopname: 'voskhod',
      username: 'entrepreneur',
      request_id: 1,
      decision_id: 1,
    })
  })

  it('генерируем акт о приёме паевого взноса имуществом', async () => {
    await testDocumentGeneration<Cooperative.Registry.AssetContributionAct.Action>({
      registry_id: Cooperative.Registry.AssetContributionAct.registry_id,
      coopname: 'voskhod',
      username: 'entrepreneur',
      request_id: 1,
      decision_id: 1,
      act_id: '123',
      receiver: 'ant',
    })
  })

  it('генерируем заявление на возврат паевого взноса имуществом', async () => {
    await testDocumentGeneration<Cooperative.Registry.ReturnByAssetStatement.Action>({
      registry_id: Cooperative.Registry.ReturnByAssetStatement.registry_id,
      coopname: 'voskhod',
      username: 'entrepreneur',
      request: {
        hash: '917f7443a115d495574dbe73405b7b6be3fed929526ba736228f3ff234ad7fce',
        title: 'Молоко "Бурёнка"',
        unit_of_measurement: 'Литр',
        units: 10,
        unit_cost: '100.0000 RUB',
        total_cost: '1000.0000 RUB',
        currency: 'RUB',
        type: 'Материальный',
        program_id: 1,
      },
    })
  })

  it('генерируем решение о возврате паевого взноса имуществом', async () => {
    await testDocumentGeneration<Cooperative.Registry.ReturnByAssetDecision.Action>({
      registry_id: Cooperative.Registry.AssetContributionDecision.registry_id,
      coopname: 'voskhod',
      username: 'entrepreneur',
      request_id: 1,
      decision_id: 1,
    })
  })

  it('генерируем акт о возврате паевого взноса имуществом', async () => {
    await testDocumentGeneration<Cooperative.Registry.ReturnByAssetAct.Action>({
      registry_id: Cooperative.Registry.ReturnByAssetAct.registry_id,
      coopname: 'voskhod',
      username: 'entrepreneur',
      request_id: 1,
      decision_id: 1,
      act_id: '123',
      transmitter: 'ant',
    })
  })
})
