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
  await generator.connect(mongoUri)
})

beforeEach(async () => {

})

describe('тест генератора документов УХД', async () => {
  it('генерируем договор УХД для физического лица', async () => {
    await testDocumentGeneration<Cooperative.Registry.InvestmentAgreement.Action>({
      registry_id: Cooperative.Registry.InvestmentAgreement.registry_id,
      coopname: 'voskhod',
      username: 'individual',
    })
  })

  it('генерируем договор УХД для юридического лица', async () => {
    await testDocumentGeneration<Cooperative.Registry.InvestmentAgreement.Action>({
      registry_id: Cooperative.Registry.InvestmentAgreement.registry_id,
      coopname: 'voskhod',
      username: 'exampleorg',
    })
  })

  it('генерируем договор УХД для ИП', async () => {
    await testDocumentGeneration<Cooperative.Registry.InvestmentAgreement.Action>({
      registry_id: Cooperative.Registry.InvestmentAgreement.registry_id,
      coopname: 'voskhod',
      username: 'entrepreneur',
    })
  })
})
