import path from 'node:path'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { RegistratorContract, SovietContract } from 'cooptypes'
import { Generator } from '../src'
import type { IGeneratedDocument } from '../src/Interfaces/Documents'
import { saveBufferToDisk } from '../src/Utils/saveBufferToDisk'
import { loadBufferFromDisk } from '../src/Utils/loadBufferFromDisk'
import { calculateSha256 } from '../src/Utils/calculateSHA'
import { MongoDBConnector } from '../src/Services/Databazor'

const mongoUri = 'mongodb://127.0.0.1:27017/cooperative-test'
const coopname = 'voskhod'

import type { ExternalEntrepreneurData, ExternalIndividualData, ExternalOrganizationData, IVars } from '../src/Models'
import type { PaymentData } from '../src/Models/PaymentMethod'
import { CoopenomicsAgreement, PrivacyPolicy, Registry, RegulationElectronicSignature, UserAgreement, WalletAgreement } from '../src/templates'
import { signatureExample } from './signatureExample'

// eslint-disable-next-line ts/no-require-imports
const fs = require('node:fs').promises

async function deleteAllFiles(folderPath: string) {
  try {
    const absolutePath = path.resolve(folderPath)
    const files = await fs.readdir(absolutePath)

    for (const file of files) {
      const filePath = path.join(absolutePath, file)
      const stat = await fs.stat(filePath)

      if (stat.isFile()) {
        await fs.unlink(filePath) // Удаляет файл
        console.log(`Deleted: ${filePath}`)
      }
    }
    console.log('All files deleted successfully.')
  }
  catch (err) {
    console.error(`Error while deleting files: ${err.message}`)
  }
}

const generator = new Generator()
generator.connect(mongoUri)

beforeAll(async () => {
  await deleteAllFiles('./documents')
})

beforeEach(async () => {

})

describe('тест генератора документов', async () => {
  it('устанавливаем шаблоны документов', async () => {
    const storage = new MongoDBConnector(mongoUri)
    await storage.connect()
    const deltas = storage.getCollection('deltas')
    const actions = storage.getCollection('actions')

    const draft = await deltas.findOne({ code: 'draft', scope: 'draft', table: 'drafts' })
    const translation = await deltas.findOne({ code: 'draft', scope: 'draft', table: 'translation' })

    // устанавливаем только если нет
    if (draft && translation)
      return

    let i = 0
    for (const [key, value] of Object.entries(Registry)) {
      i++
      await deltas.insertOne({
        block_num: 0,
        present: true,
        code: 'draft',
        scope: 'draft',
        table: 'drafts',
        primary_key: String(i),
        value: {
          id: String(i),
          registry_id: String(key),
          version: 1,
          default_translation_id: String(i),
          title: value.Template.title,
          description: value.Template.description,
          context: value.Template.context,
          model: JSON.stringify(value.Template.model),
        },
      })

      await deltas.insertOne({
        block_num: 0,
        present: true,
        code: 'draft',
        scope: 'draft',
        table: 'translations',
        primary_key: String(i),
        value: {
          id: String(i),
          draft_id: String(i),
          lang: 'ru',
          data: JSON.stringify(value.Template.translations.ru),
        },
      })

      const cooperative_is_exist = await deltas.findOne({
        'block_num': 0,
        'value.username': 'voskhod',
      })

      await actions.insertOne({
        block_num: 0,
        account: 'soviet',
        name: 'votefor',
        receiver: 'soviet',
        data: {
          coopname: 'voskhod',
          member: 'ant',
          decision_id: '1',
        } as SovietContract.Actions.Decisions.VoteFor.IVoteForDecision,
      })

      await actions.insertOne({
        block_num: 0,
        account: 'soviet',
        name: 'votefor',
        receiver: 'soviet',
        data: {
          coopname: 'voskhod',
          member: 'ant',
          decision_id: '2',
        } as SovietContract.Actions.Decisions.VoteFor.IVoteForDecision,
      })

      await actions.insertOne({
        block_num: 0,
        account: 'soviet',
        name: 'votefor',
        receiver: 'soviet',
        data: {
          coopname: 'voskhod',
          member: 'ant',
          decision_id: '3',
        } as SovietContract.Actions.Decisions.VoteFor.IVoteForDecision,
      })

      if (cooperative_is_exist)
        return

      await deltas.insertOne({
        block_num: 0,
        present: true,
        code: 'registrator',
        scope: 'registrator',
        table: 'orgs',
        primary_key: '1',
        value: {
          username: 'voskhod',
          parent_username: '',
          announce: '',
          description: '',
          is_cooperative: true,
          is_branched: false,
          coop_type: 'conscoop',
          registration: '2.0000 RUB',
          initial: '1.0000 RUB',
          minimum: '1.0000 RUB',
          org_initial: '100.0000 RUB',
          org_minimum: '1000.0000 RUB',
          org_registration: '1100.0000 RUB',
        } as RegistratorContract.Tables.Cooperatives.ICooperative,
      })

      await deltas.insertOne({
        block_num: 0,
        present: true,
        code: 'soviet',
        scope: 'voskhod',
        table: 'boards',
        primary_key: '1',
        value: {
          id: '0',
          type: 'soviet',
          name: 'Совет провайдера',
          description: '',
          test: 1,
          members: [
            {
              username: 'ant',
              is_voting: true,
              position_title: 'Председатель',
              position: 'chairman',
            },
          ],
          created_at: '2024-05-15T10:45:42.000',
          last_update: '2024-05-15T10:45:42.000',
        } as SovietContract.Tables.Boards.IBoards,
      })

      // console.log(key)
      // console.log(value)
    }
  })

  it('сохранение и извлечение данных пользователя', async () => {
    const userData: ExternalIndividualData = {
      username: 'ant',
      first_name: 'Имя',
      last_name: 'Фамилия',
      middle_name: 'Отчество',
      birthdate: '2023-04-01',
      phone: '+1234567890',
      email: 'john.doe@example.com',
      full_address: 'Переулок Правды д. 1',
      passport: {
        series: 7122,
        number: 112233,
        issued_by: 'отделом УФМС по г. Москва',
        issued_at: '22.04.2010',
        code: '111-232',
      },
    }

    const saved = await generator.save('individual', userData)
    const individual = await generator.get('individual', { username: userData.username }) as any

    // const individual = await generator.getIndividual({ username: userData.username }) as any

    Object.keys(userData).forEach((field) => {
      expect(individual[field]).toBeDefined()
    })

    expect(individual._id).toEqual(saved.insertedId)
  })

  it('сохранение, извлечение и удаление банковских реквизитов пользователя', async () => {
    const paymentData: PaymentData = {
      username: 'ant',
      method_id: 1,
      user_type: 'individual',
      method_type: 'sbp',
      is_default: true,
      data: {
        phone: '+7-111-111-111-11',
      },
      deleted: false,
    }

    const saved = await generator.save('paymentMethod', paymentData)
    const paymentMethod = await generator.get('paymentMethod', { username: 'ant', method_id: paymentData.method_id }) as any
    expect(paymentMethod.deleted).toEqual(false)

    Object.keys(paymentData).forEach((field) => {
      expect(paymentMethod[field]).toBeDefined()
    })

    expect(paymentMethod._id).toEqual(saved.insertedId)

    const paymentList = await generator.list('paymentMethod', { username: 'ant', method_id: paymentData.method_id })

    expect(paymentList.limit).toBeDefined()
    expect(paymentList.results).toBeDefined()
    expect(paymentList.totalPages).toBeDefined()
    expect(paymentList.totalResults).toBeDefined()

    expect(paymentList.results.length).toEqual(1)

    await generator.del('paymentMethod', { username: 'ant', method_id: paymentData.method_id })

    const updatedPaymentMethod = await generator.get('paymentMethod', { username: 'ant', method_id: paymentData.method_id }) as any

    expect(updatedPaymentMethod.deleted).toEqual(true)
  })

  it('сохранение данных кооператива', async () => {
    const organizationData: ExternalOrganizationData = {
      username: 'voskhod',
      type: 'coop',
      is_cooperative: true,
      short_name: '"ПК Восход"',
      full_name: 'Потребительский Кооператив "ВОСХОД"',
      represented_by: {
        first_name: 'Алексей',
        last_name: 'Муравьев',
        middle_name: 'Николаевич',
        position: 'Председатель',
        based_on: 'Решение общего собрания №1',
      },
      country: 'Russia',
      city: 'Москва',
      full_address: '117593 г. Москва, муниципальный округ Ясенево, проезд Соловьиный, дом 1, помещение 1/1',
      email: 'copenomics@yandex.ru',
      phone: '+71234567890',
      details: {
        inn: '9728130611',
        ogrn: '1247700283346',
        kpp: '772801001',
      },
      bank_account: {
        account_number: '40703810038000110117',
        currency: 'RUB',
        card_number: '',
        bank_name: 'ПАО Сбербанк',
        details: {
          bik: '044525225',
          corr: '30101810400000000225',
          kpp: '773643001',
        },
      },

    }

    const saved = await generator.save('organization', organizationData)

    const organization = await generator.get('organization', { username: organizationData.username }) as any

    Object.keys(organizationData).forEach((field) => {
      expect(organization[field]).toBeDefined()
    })

    expect(organization._id).toEqual(saved.insertedId)
  })

  it('сохранение и извлечение переменных кооператива', async () => {
    const vars: IVars = {
      coopname: 'voskhod',
      full_abbr: 'потребительский кооператив',
      full_abbr_genitive: 'потребительского кооператива',
      full_abbr_dative: 'потребительскому кооперативу',
      short_abbr: 'ПК',
      website: 'цифровой-кооператив.рф',
      name: 'Восход',
      confidential_link: 'coopenomics.world/privacy',
      confidential_email: 'privacy@coopenomics.world',
      contact_email: 'contact@coopenomics.world',
      passport_request: 'yes',
      wallet_agreement: {
        protocol_number: '10-04-2024',
        protocol_day_month_year: '10 апреля 2024 г.',
      },
      signature_agreement: {
        protocol_number: '10-04-2024',
        protocol_day_month_year: '10 апреля 2024 г.',
      },
      privacy_agreement: {
        protocol_number: '10-04-2024',
        protocol_day_month_year: '10 апреля 2024 г.',
      },
      user_agreement: {
        protocol_number: '10-04-2024',
        protocol_day_month_year: '10 апреля 2024 г.',
      },
      participant_application: {
        protocol_number: '10-04-2024',
        protocol_day_month_year: '10 апреля 2024 г.',
      },
    }

    const saved = await generator.save('vars', vars)
    const extractedCovars = await generator.get('vars', { coopname: vars.coopname }) as any

    expect(extractedCovars).toBeDefined()

    Object.keys(vars).forEach((field) => {
      expect(extractedCovars[field]).toBeDefined()
    })

    expect(extractedCovars._id).toEqual(saved.insertedId)
  })

  it('синтезируем сборку модели кооператива', async () => {
    const cooperative = await generator.constructCooperative(coopname)
    expect(cooperative).toBeDefined()

    if (cooperative) {
      expect(cooperative.username).toEqual('voskhod')
      expect(cooperative.is_cooperative).toEqual(true)
      expect(cooperative.members.length).toEqual(cooperative.totalMembers)
    }
  })

  it('генерируем заявление на присоединение к ЦПП "Цифровой Кошелёк"', async () => {
    const params: WalletAgreement.Action = {
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
      registry_id: WalletAgreement.registry_id,
      protocol_number: '01-01-2024',
      protocol_day_month_year: '1 января 2024 г.',
    }

    const document: IGeneratedDocument = await generator.generate(params)

    const filename1 = `${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(document.binary, filename1)

    const regenerated_document: IGeneratedDocument = await generator.generate({
      ...document.meta,
    })

    const filename2 = `regenerated-${document.meta.title}-${document.meta.username}.pdf`
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

    console.log('hash1: ', hash1)
    console.log('hash2: ', hash2)
    console.log(document.meta)

    expect(hash1).toEqual(hash2)
  })

  it('генерируем согласие с правилами ЭЦП', async () => {
    const params: RegulationElectronicSignature.Action = {
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
      registry_id: RegulationElectronicSignature.registry_id,
      protocol_number: '01-01-2024',
      protocol_day_month_year: '1 января 2024 г.',
    }

    const document: IGeneratedDocument = await generator.generate(params)

    const filename1 = `${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(document.binary, filename1)

    const regenerated_document: IGeneratedDocument = await generator.generate({
      ...document.meta,
    })

    const filename2 = `regenerated-${document.meta.title}-${document.meta.username}.pdf`
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

    console.log('hash1: ', hash1)
    console.log('hash2: ', hash2)
    console.log(document.meta)

    expect(hash1).toEqual(hash2)
  })

  it('генерируем согласие с политикой конфиденциальности', async () => {
    const params: PrivacyPolicy.Action = {
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
      registry_id: PrivacyPolicy.registry_id,
      protocol_number: '01-01-2024',
      protocol_day_month_year: '1 января 2024 г.',
    }

    const document: IGeneratedDocument = await generator.generate(params)

    const filename1 = `${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(document.binary, filename1)

    const regenerated_document: IGeneratedDocument = await generator.generate({
      ...document.meta,
    })

    const filename2 = `regenerated-${document.meta.title}-${document.meta.username}.pdf`
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

    console.log('hash1: ', hash1)
    console.log('hash2: ', hash2)
    console.log(document.meta)

    expect(hash1).toEqual(hash2)
  })

  it('генерируем согласие с пользовательским соглашением', async () => {
    const params: UserAgreement.Action = {
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
      registry_id: UserAgreement.registry_id,
      protocol_number: '01-01-2024',
      protocol_day_month_year: '1 января 2024 г.',
    }

    const document: IGeneratedDocument = await generator.generate(params)

    const filename1 = `${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(document.binary, filename1)

    const regenerated_document: IGeneratedDocument = await generator.generate({
      ...document.meta,
    })

    const filename2 = `regenerated-${document.meta.title}-${document.meta.username}.pdf`
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

    console.log('hash1: ', hash1)
    console.log('hash2: ', hash2)
    console.log(document.meta)

    expect(hash1).toEqual(hash2)
  })

  it('генерируем согласие с пользовательским соглашением платформы "Кооперативная Экономика"', async () => {
    const params: CoopenomicsAgreement.Action = {
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
      registry_id: CoopenomicsAgreement.registry_id,
      protocol_number: '01-01-2024',
      protocol_day_month_year: '1 января 2024 г.',
    }

    const document: IGeneratedDocument = await generator.generate(params)

    const filename1 = `${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(document.binary, filename1)

    const regenerated_document: IGeneratedDocument = await generator.generate({
      ...document.meta,
    })

    const filename2 = `regenerated-${document.meta.title}-${document.meta.username}.pdf`
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

    console.log('hash1: ', hash1)
    console.log('hash2: ', hash2)
    console.log(document.meta)

    expect(hash1).toEqual(hash2)
  })

  it('генерируем заявление на вступление физического лица', async () => {
    const document: IGeneratedDocument = await generator.generate({
      registry_id: 100,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
      signature: signatureExample,
    })

    const filename1 = `${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(document.binary, filename1)

    const regenerated_document: IGeneratedDocument = await generator.generate({
      ...document.meta,
    })
    const filename2 = `regenerated-${document.meta.title}-${document.meta.username}.pdf`
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

    // console.log('hash1: ', hash1)
    // console.log('hash2: ', hash2)
    // console.log(document)

    expect(hash1).toEqual(hash2)

    const decision_document: IGeneratedDocument = await generator.generate({
      registry_id: 501,
      coopname: 'voskhod',
      username: 'ant',
      lang: 'ru',
      decision_id: 1,
    })

    const filename3 = `${decision_document.meta.title}-${decision_document.meta.username}.pdf`
    await saveBufferToDisk(decision_document.binary, filename3)
  })

  it('сохранение данных организации', async () => {
    const organizationData: ExternalOrganizationData = {
      username: 'exampleorg',
      type: 'ooo',
      is_cooperative: false,
      short_name: 'Ромашка',
      full_name: 'Ромашка',
      represented_by: {
        first_name: 'Иван',
        last_name: 'Иванов',
        middle_name: 'Иванович',
        position: 'Директор',
        based_on: 'решения собрания учредителей №22',
      },
      country: 'Russia',
      city: 'Moscow',
      full_address: 'г. Москва, ул. Арбат д. 22, офис 306',
      email: 'contact@exampleorg.com',
      phone: '+71234567890',
      details: {
        kpp: '123456789',
        inn: '0987654321',
        ogrn: '0987654321098',
      },
      bank_account: {
        account_number: '40817810099910004312',
        currency: 'RUB',
        card_number: '0987654321098765',
        bank_name: 'ПАО СБЕРБАНК',
        details: {
          bik: '098765432',
          corr: '30101810400000000225',
          kpp: '098765432',
        },
      },
    }

    const saved = await generator.save('organization', organizationData)

    const organization = await generator.get('organization', { username: organizationData.username }) as any

    expect(organization._id).toEqual(saved.insertedId)

    Object.keys(organizationData).forEach((field) => {
      expect(organization[field]).toBeDefined()
    })
  })

  it('генерируем заявление на вступление юридического лица', async () => {
    const document: IGeneratedDocument = await generator.generate({
      registry_id: 100,
      coopname: 'voskhod',
      username: 'exampleorg',
      lang: 'ru',
      signature: signatureExample,
    })

    const filename1 = `${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(document.binary, filename1)

    const regenerated_document: IGeneratedDocument = await generator.generate({
      ...document.meta,
    })

    const filename2 = `regenerated-${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(regenerated_document.binary, filename2)

    expect(document.meta).toEqual(regenerated_document.meta)
    expect(document.hash).toEqual(regenerated_document.hash)

    const document_from_disk1 = await loadBufferFromDisk(filename1)
    const document_from_disk2 = await loadBufferFromDisk(filename2)

    const hash1 = calculateSha256(document_from_disk1)
    const hash2 = calculateSha256(document_from_disk2)

    // console.log('hash1: ', hash1)
    // console.log('hash2: ', hash2)
    // console.log(document)

    expect(hash1).toEqual(hash2)

    const decision_document: IGeneratedDocument = await generator.generate({
      registry_id: 501,
      coopname: 'voskhod',
      username: 'exampleorg',
      lang: 'ru',
      decision_id: 2,
    })

    const filename3 = `${decision_document.meta.title}-${decision_document.meta.username}.pdf`
    await saveBufferToDisk(decision_document.binary, filename3)
  })

  it('сохранение данных индивидуального предпринимателя', async () => {
    const entrepreneurData: ExternalEntrepreneurData = {
      username: 'entrepreneur',
      first_name: 'John',
      last_name: 'Doe',
      middle_name: 'Middle',
      birthdate: '2023-04-01',
      phone: '+1234567890',
      email: 'john.doe@example.com',
      full_address: 'переулок правды д. 1',
      country: 'Russia',
      city: 'Moscow',
      details: {
        inn: '0987654321',
        ogrn: '0987654321098',
      },
      bank_account: {
        account_number: '40817810099910004312',
        currency: 'RUB',
        card_number: '0987654321098765',
        bank_name: 'Example Bank',
        details: {
          bik: '098765432',
          corr: '30101810400000000225',
          kpp: '098765432',
        },
      },
    }

    const saved = await generator.save('entrepreneur', entrepreneurData)
    console.log(saved)
    const entrepreneur = await generator.get('entrepreneur', { username: entrepreneurData.username }) as any
    console.log(entrepreneur)
    expect(entrepreneur._id).toEqual(saved.insertedId)

    Object.keys(entrepreneurData).forEach((field) => {
      expect(entrepreneur[field]).toBeDefined()
    })
  })

  it('генерируем заявление на вступление индивидуального предпринимателя', async () => {
    const document: IGeneratedDocument = await generator.generate({
      registry_id: 100,
      coopname: 'voskhod',
      username: 'entrepreneur',
      lang: 'ru',
      signature: signatureExample,
    })

    const filename1 = `${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(document.binary, filename1)

    const regenerated_document: IGeneratedDocument = await generator.generate({
      ...document.meta,
    })

    const filename2 = `regenerated-${document.meta.title}-${document.meta.username}.pdf`
    await saveBufferToDisk(regenerated_document.binary, filename2)

    expect(document.meta).toEqual(regenerated_document.meta)
    expect(document.hash).toEqual(regenerated_document.hash)

    const document_from_disk1 = await loadBufferFromDisk(filename1)
    const document_from_disk2 = await loadBufferFromDisk(filename2)

    const hash1 = calculateSha256(document_from_disk1)
    const hash2 = calculateSha256(document_from_disk2)

    // console.log('hash1: ', hash1)
    // console.log('hash2: ', hash2)
    // console.log(document)

    expect(hash1).toEqual(hash2)

    const decision_document: IGeneratedDocument = await generator.generate({
      registry_id: 501,
      coopname: 'voskhod',
      username: 'entrepreneur',
      lang: 'ru',
      decision_id: 3,
    })

    const filename3 = `${decision_document.meta.title}-${decision_document.meta.username}.pdf`
    await saveBufferToDisk(decision_document.binary, filename3)
  })
})
