import path from 'node:path'
import type { RegistratorContract, SovietContract } from 'cooptypes'
import { Generator, type IGenerate, type IGeneratedDocument, Registry } from '../../src'
import { saveBufferToDisk } from '../../src/Utils/saveBufferToDisk'
import { loadBufferFromDisk } from '../../src/Utils/loadBufferFromDisk'
import { calculateSha256 } from '../../src/Utils/calculateSHA'
import type { ExternalEntrepreneurData, ExternalIndividualData, ExternalOrganizationData, IVars, PaymentData } from '../../src/Models'
import { MongoDBConnector } from '../../src/Services/Databazor'
// eslint-disable-next-line ts/no-require-imports
const fs = require('node:fs').promises

export const mongoUri = 'mongodb://127.0.0.1:27017/cooperative-x'
export const coopname = 'voskhod'

export const generator = new Generator()

export async function deleteAllFiles(folderPath: string) {
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
  catch (err: any) {
    console.error(`Error while deleting files: ${err.message}`)
  }
}

export async function preLoading() {
  await deleteAllFiles('./documents')

  const storage = new MongoDBConnector(mongoUri)
  await storage.connect()

  const collectionsToClear = [
    'vars',
    'paymentMethods',
    'individuals',
    'organizations',
    'entrepreneurs',
    'projects',
  ]

  for (const collectionName of collectionsToClear) {
    const collection = storage.getCollection(collectionName)
    await collection.deleteMany({})
  }

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

    await actions.insertOne({
      block_num: 0,
      account: 'soviet',
      name: 'votefor',
      receiver: 'soviet',
      data: {
        coopname: 'voskhod',
        member: 'ant',
        decision_id: '4',
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
        decision_id: '5',
      } as SovietContract.Actions.Decisions.VoteFor.IVoteForDecision,
    })

    if (!cooperative_is_exist) {
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
    }
  }

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

  await generator.save('vars', vars)

  const userData: ExternalIndividualData = {
    username: 'ant',
    first_name: 'Имя',
    last_name: 'Фамилия',
    middle_name: 'Отчество',
    birthdate: '2023-04-01',
    phone: '+71234567890',
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

  await generator.save('individual', userData)

  const organizationData: ExternalOrganizationData = {
    username: 'voskhod',
    type: 'coop',
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
    fact_address: '117593 г. Москва, муниципальный округ Ясенево, проезд Соловьиный, дом 1, помещение 1/1',
    email: 'copenomics@yandex.ru',
    phone: '+771234567890',
    details: {
      inn: '9728130611',
      ogrn: '1247700283346',
      kpp: '772801001',
    },
  }

  await generator.save('organization', organizationData)

  await generator.get('organization', { username: organizationData.username }) as any

  const paymentData: PaymentData = {
    username: 'voskhod',
    method_id: '1',
    method_type: 'bank_transfer',
    is_default: true,
    data: {
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
    deleted: false,
  }

  await generator.save('paymentMethod', paymentData)

  const entrepreneurData: ExternalEntrepreneurData = {
    username: 'entrepreneur',
    first_name: 'John',
    last_name: 'Doe',
    middle_name: 'Middle',
    birthdate: '2023-04-01',
    phone: '+71234567890',
    email: 'john.doe@example.com',
    full_address: 'переулок правды д. 1',
    country: 'Russia',
    city: 'Moscow',
    details: {
      inn: '0987654321',
      ogrn: '0987654321098',
    },
  }

  const saved = await generator.save('entrepreneur', entrepreneurData)
  console.log(saved)

  const paymentData2: PaymentData = {
    username: 'entrepreneur',
    method_id: '1',
    method_type: 'bank_transfer',
    is_default: true,
    data: {
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
    deleted: false,
  }

  await generator.save('paymentMethod', paymentData2)

  const branchData: ExternalOrganizationData = {
    username: 'branch',
    type: 'coop',
    short_name: '"КУ ПЕТРУШКА"',
    full_name: 'Кооперативный Участок "ПЕТРУШКА"',
    represented_by: {
      first_name: 'Иван',
      last_name: 'Иванов',
      middle_name: 'Иванович',
      position: 'Председатель кооперативного участка',
      based_on: 'Решение собрания совета №101',
    },
    country: 'Russia',
    city: 'Москва',
    full_address: '117593 г. Москва, муниципальный округ Ясенево, проезд Соловьиный, дом 1, помещение 1/1',
    fact_address: '117593 г. Москва, муниципальный округ Ясенево, проезд Соловьиный, дом 1, помещение 1/1',
    email: 'copenomics@yandex.ru',
    phone: '+771234567890',
    details: {
      inn: '9728130611',
      ogrn: '1247700283346',
      kpp: '772801001',
    },
  }

  await generator.save('organization', branchData)

  const paymentData3: PaymentData = {
    username: 'branch',
    method_id: '1',
    method_type: 'bank_transfer',
    is_default: true,
    data: {
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
    deleted: false,
  }

  await generator.save('paymentMethod', paymentData3)
}
