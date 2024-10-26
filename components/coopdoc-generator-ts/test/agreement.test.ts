import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { CoopenomicsAgreement, IGeneratedDocument } from '../src'
import { Generator } from '../src'
import type { ExternalOrganizationData, IVars } from '../src/Models'
import { saveBufferToDisk } from '../src/Utils/saveBufferToDisk'

const mongoUri = 'mongodb://127.0.0.1:27017/cooperative-test'

const generator = new Generator()

generator.connect(mongoUri)

beforeAll(async () => {

})

beforeEach(async () => {

})

// describe('генерирует документ соглашения', async () => {
//   it('#1', async () => {
//     const voskhodData: ExternalOrganizationData = {
//       username: 'voskhod',
//       type: 'coop',
//       is_cooperative: true,
//       short_name: '"ПК Восход"',
//       full_name: 'Потребительский Кооператив "ВОСХОД"',
//       represented_by: {
//         first_name: 'Алексей',
//         last_name: 'Муравьев',
//         middle_name: 'Николаевич',
//         position: 'Председатель',
//         based_on: 'Решение общего собрания №1',
//       },
//       country: 'Russia',
//       city: 'Москва',
//       full_address: '117593 г. Москва, муниципальный округ Ясенево, проезд Соловьиный, дом 1, помещение 1/1',
//       email: 'copenomics@yandex.ru',
//       phone: '+71234567890',
//       details: {
//         inn: '9728130611',
//         ogrn: '1247700283346',
//         kpp: '772801001',
//       },
//       bank_account: {
//         account_number: '40703810038000110117',
//         currency: 'RUB',
//         card_number: '',
//         bank_name: 'ПАО Сбербанк',
//         details: {
//           bik: '044525225',
//           corr: '30101810400000000225',
//           kpp: '773643001',
//         },
//       },

//     }

//     await generator.save('organization', voskhodData)

//     const vars: IVars = {
//       coopname: 'voskhod',
//       full_abbr: 'потребительский кооператив',
//       full_abbr_genitive: 'потребительского кооператива',
//       full_abbr_dative: 'потребительскому кооперативу',
//       short_abbr: 'ПК',
//       website: 'цифровой-кооператив.рф',
//       name: 'Восход',
//       confidential_link: 'coopenomics.world/privacy',
//       confidential_email: 'privacy@coopenomics.world',
//       contact_email: 'contact@coopenomics.world',
//       passport_request: 'no',
//       wallet_agreement: {
//         protocol_number: '10-04-2024',
//         protocol_day_month_year: '10 апреля 2024 г.',
//       },
//       signature_agreement: {
//         protocol_number: '10-04-2024',
//         protocol_day_month_year: '10 апреля 2024 г.',
//       },
//       privacy_agreement: {
//         protocol_number: '10-04-2024',
//         protocol_day_month_year: '10 апреля 2024 г.',
//       },
//       user_agreement: {
//         protocol_number: '10-04-2024',
//         protocol_day_month_year: '10 апреля 2024 г.',
//       },
//       participant_application: {
//         protocol_number: '10-04-2024',
//         protocol_day_month_year: '10 апреля 2024 г.',
//       },
//       coopenomics_agreement: {
//         protocol_number: '10-04-2024',
//         protocol_day_month_year: '10 апреля 2024 г.',
//       },
//     }

//     await generator.save('vars', vars)

//     const coopname = 'test'

//     const organizationData: ExternalOrganizationData = {
//       username: coopname,
//       type: 'coop',
//       is_cooperative: true,
//       short_name: 'Ромашка',
//       full_name: 'Ромашка',
//       represented_by: {
//         first_name: 'Иван',
//         last_name: 'Иванов',
//         middle_name: 'Иванович',
//         position: 'Директор',
//         based_on: 'решения собрания учредителей №22',
//       },
//       country: 'Russia',
//       city: 'Moscow',
//       full_address: 'г. Москва, ул. Арбат д. 22, офис 306',
//       email: 'contact@exampleorg.com',
//       phone: '+71234567890',
//       details: {
//         kpp: '123456789',
//         inn: '0987654321',
//         ogrn: '0987654321098',
//       },
//       bank_account: {
//         account_number: '40817810099910004312',
//         currency: 'RUB',
//         card_number: '0987654321098765',
//         bank_name: 'ПАО СБЕРБАНК',
//         details: {
//           bik: '098765432',
//           corr: '30101810400000000225',
//           kpp: '098765432',
//         },
//       },
//     }

//     await generator.save('organization', organizationData)

//     const act: CoopenomicsAgreement.Action = {
//       registry_id: 50,
//       coopname: 'voskhod',
//       username: 'test',
//       lang: 'ru',
//     }

//     const document: IGeneratedDocument = await generator.generate(act)

//     const filename1 = `Соглашение_о_подключении_${coopname}.pdf`
//     await saveBufferToDisk(document.binary, filename1)
//   })
// })
