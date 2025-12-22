import { randomUUID } from 'node:crypto'
import axios from 'axios'
import { Generator, Registry } from '@coopenomics/factory'
import type { Cooperative } from 'cooptypes'
import { DraftContract } from 'cooptypes'
import mongoose from 'mongoose'
import type { Account, Contract } from '../types'
import config from '../configs'
import Blockchain from '../blockchain'
import { sleep } from '../utils'
import { CooperativeClass } from './cooperative'

export async function startInfra() {
  // инициализируем инстанс с ключами
  const blockchain = new Blockchain(config.network, config.private_keys)
  await blockchain.update_pass_instance()

  // регистрируем базовые аккаунты
  for (const account of config.accounts) {
    const { name, ownerPublicKey, activePublicKey } = account as Account
    await blockchain.createStandartAccount(
      'eosio',
      name,
      ownerPublicKey || config.default_public_key,
      activePublicKey || config.default_public_key,
    )
  }

  // пре-активируем фичу для запуска
  const url = `${config.network.protocol}://${config.network.host}${config.network.port}`

  try {
    const response = await axios.post(
      `${url}/v1/producer/schedule_protocol_feature_activations`,
      {
        protocol_features_to_activate: [
          '0ec7e080177b2c02b278d5088611686b49d739925a92d9bfcacd7fc6b74053bd',
        ],
      },
    )
    console.log('ok -> init activation: ', response.data)
  }
  catch (e) {
    console.log('error -> init activation: ', e)
  }

  // чуть ждём
  await sleep(1000)

  // устанавливаем биос
  const bios = config.contracts.find(el => el.name === 'eosio.boot')
  await blockchain.setContract(bios as Contract)

  // чуть ждём
  await sleep(2000)

  // активируем все оставшиеся фичи
  for (const feature of config.features)
    await blockchain.activateFeature(feature)

  // чуть ждём
  await sleep(2000)

  // устанавливаем все оставшиеся контракты
  const filtered_contracts = config.contracts.filter(
    el => el.name !== 'eosio.boot',
  )
  for (const contract of filtered_contracts)
    await blockchain.setContract(contract)

  await sleep(2000)

  console.log('создаём токен')
  await blockchain.createToken({
    issuer: 'eosio',
    maximum_supply: config.token.max_supply,
  })

  await sleep(2000)

  console.log('выпускаем токены')
  for (const allocation of config.allocations) {
    await blockchain.issueToken({
      to: allocation.to,
      quantity: allocation.quantity,
      memo: '',
    })
  }

  await sleep(2000)

  // выдаём кодовые разрешения всем указанным аккаунтам
  for (const account of config.accounts.filter(
    el => !!el.code_permissions_to,
  )) {
    for (const permission_to of account.code_permissions_to ?? []) {
      await blockchain.updateAccountPermissionsToCode(
        account.name,
        permission_to,
      )
    }
  }

  await sleep(1000)

  // инициализируем системный контракт
  await blockchain.initSystem({
    version: 0,
    core: `${config.token.precision},${config.token.symbol}`,
  })

  await sleep(1000)

  // инициализируем эмиссию
  await blockchain.initEmission({
    init_supply: config.emission.left_border,
    tact_duration: config.emission.tact_duration,
    emission_factor: config.emission.emission_factor,
  })

  await sleep(2000)

  await blockchain.initPowerup({
    args: {
      powerup_days: config.powerup.days,
      min_powerup_fee: config.powerup.min_powerup,
    },
  })

  await sleep(2000)

  for (const id in Registry) {
    const template = Registry[(id as unknown) as keyof typeof Registry]

    await blockchain.createDraft({
      scope: DraftContract.contractName.production,
      username: 'eosio',
      registry_id: id,
      lang: 'ru',
      title: template.Template.title,
      description: template.Template.description,
      context: template.Template.context,
      model: JSON.stringify(template.Template.model),
      translation_data: JSON.stringify(template.Template.translations.ru),
    })
  }

  console.log(`Арендуем ресурсы провайдеру`)
  await blockchain.powerup({
    payer: 'eosio',
    receiver: config.provider,
    days: config.powerup.days,
    payment: `100.0000 ${config.token.symbol}`,
    transfer: true,
  })

  await blockchain.transfer({
    from: 'eosio',
    to: config.provider,
    quantity: `1000.0000 ${config.token.symbol}`,
    memo: '',
  })

  console.log('Базовая инфраструктура установлена')

  return blockchain
}

export async function installInitialData(blockchain: Blockchain, isExtended = false) {
  const organizationData: Cooperative.Users.IOrganizationData = {
    username: 'voskhod',
    type: 'coop',
    short_name: '"ПК Восход"',
    full_name: 'Потребительский Кооператив "ВОСХОД"',
    represented_by: {
      first_name: 'Иван',
      last_name: 'Иванов',
      middle_name: 'Иванович',
      position: 'Председатель',
      based_on: 'Решение общего собрания №1',
    },
    country: 'Российская Федерация',
    city: 'Москва',
    fact_address: '117593 г. Москва, муниципальный округ Ясенево, проезд Соловьиный, дом 1, помещение 1/1',
    full_address:
      '117593 г. Москва, муниципальный округ Ясенево, проезд Соловьиный, дом 1, помещение 1/1',
    email: 'copenomics@yandex.ru',
    phone: '+71234567890',
    details: {
      inn: '9728130611',
      ogrn: '1247700283346',
      kpp: '772801001',
    },

  }

  const generator = new Generator()
  // eslint-disable-next-line node/prefer-global/process
  await generator.connect(process.env.MONGO_URI as string)

  await generator.save('organization', organizationData)
  console.log('Провайдер добавлен: ', organizationData)

  await generator.save('paymentMethod', {
    is_default: true,
    method_id: randomUUID(),
    method_type: 'bank_transfer',
    username: 'voskhod',
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
  })

  const userData: Cooperative.Users.IIndividualData = {
    username: 'ant',
    first_name: 'Иван',
    last_name: 'Иванов',
    middle_name: 'Иванович',
    birthdate: '1990/04/01',
    phone: '+71234567890',
    email: 'ivanov@example.com',
    full_address: 'Переулок Правды д. 1',
    passport: {
      series: 7122,
      number: 112233,
      issued_by: 'отделом УФМС по г. Москва',
      issued_at: '2010/05/10',
      code: '111-232',
    },
  }

  await generator.save('individual', userData)

  // добавляем переменные кооператива
  const vars: Cooperative.Model.IVars = {
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
    passport_request: 'no',
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
    blagorost_provision: {
      protocol_number: '11-04-2024',
      protocol_day_month_year: '11 апреля 2024 г.',
    },
    blagorost_offer_template: {
      protocol_number: '12-04-2024',
      protocol_day_month_year: '12 апреля 2024 г.',
    },
  }

  await generator.save('vars', vars)

  // eslint-disable-next-line node/prefer-global/process
  await mongoose.connect(process.env.MONGO_URI as string)

  try {
    await mongoose.connection.collection('sync').deleteMany({})
    console.log('Все документы удалены из коллекции sync')
  }
  catch (e) {
    console.error('Ошибка при удалении:', e)
  }

  try {
    await mongoose.connection.collection('actions').deleteMany({})
    console.log('Все документы удалены из коллекции actions')
  }
  catch (e) {
    console.error('Ошибка при удалении:', e)
  }

  try {
    await mongoose.connection.collection('deltas').deleteMany({})
    console.log('Все документы удалены из коллекции deltas')
  }
  catch (e) {
    console.error('Ошибка при удалении:', e)
  }

  // добавляем пользователя для подключений
  try {
    await mongoose.connection.collection('users').insertOne({
      email: 'ivanov@example.com',
      username: 'ant',
      type: 'individual',
      role: 'chairman',
      is_registered: true,
    })
  }
  catch (e) { console.log('user is exist') }

  // имитируем установку
  try {
    await mongoose.connection.collection('monos').insertOne({
      coopname: 'voskhod',
      status: 'active',
    })
  }
  catch (e) {
    console.log('system is exist')
  }
  // сохраняем зашированный ключ в vault
  try {
    await mongoose.connection.collection('vaults').insertOne({
      username: 'voskhod',
      permission: 'active',
      wif: '9d6479a9d77ead53fb0e5e54b3608a95:2046ee3c1577d48aecbee49e8f25c4c2df37ab02f15d73d0d1b6352f53a4b774cb9e71b6028fd7caf64568e195c7878dfbb5d2bf10a3766d90ba9e92ea724428',
    })
  }
  catch (e) { console.log('vault is exist') }

  console.log('Добавляем пайщика ant')

  await blockchain.addUser({
    coopname: 'voskhod',
    referer: 'voskhod',
    username: 'ant',
    type: 'individual',
    created_at: '2025-01-15T10:00:00',
    initial: '100.0000 RUB',
    minimum: '200.0000 RUB',
    spread_initial: true,
    meta: 'Основатель кооператива ВОСХОД',
  })

  console.log('Устанавливаем дефолтный публичный ключ для ant')

  await blockchain.changeKey({
    coopname: 'voskhod',
    changer: 'voskhod',
    username: 'ant',
    public_key: config.default_public_key,
  })

  // Если расширенный режим, сначала добавляем дополнительных пайщиков
  if (isExtended) {
    console.log('Добавляем дополнительных пайщиков для расширенного совета')

    const extraUsers = [
      {
        username: 'petr',
        first_name: 'Петр',
        last_name: 'Сидоров',
        middle_name: 'Сергеевич',
        email: 'sidorov@example.com',
      },
      {
        username: 'anna',
        first_name: 'Анна',
        last_name: 'Петрова',
        middle_name: 'Ивановна',
        email: 'petrova@example.com',
      },
      {
        username: 'mikhail',
        first_name: 'Михаил',
        last_name: 'Кузнецов',
        middle_name: 'Андреевич',
        email: 'kuznetsov@example.com',
      },
      {
        username: 'olga',
        first_name: 'Ольга',
        last_name: 'Соколова',
        middle_name: 'Викторовна',
        email: 'sokolova@example.com',
      },
    ]

    for (const user of extraUsers) {
      // Добавляем в MongoDB
      const userData: Cooperative.Users.IIndividualData = {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name,
        birthdate: '1990/04/01',
        phone: '+71234567890',
        email: user.email,
        full_address: 'г. Москва, ул. Примерная д. 1',
        passport: {
          series: 7122,
          number: Math.floor(Math.random() * 900000) + 100000,
          issued_by: 'отделом УФМС по г. Москва',
          issued_at: '2010/05/10',
          code: '111-232',
        },
      }

      await generator.save('individual', userData)

      // Добавляем пользователя в базу для подключений
      try {
        await mongoose.connection.collection('users').insertOne({
          email: user.email,
          username: user.username,
          type: 'individual',
          role: 'member',
          status: 'active',
          is_registered: true,
        })
      }
      catch (e) { console.log(`user ${user.username} is exist`) }

      console.log(`Добавляем пайщика ${user.username}`)

      // Добавляем в блокчейн
      await blockchain.addUser({
        coopname: 'voskhod',
        referer: 'voskhod',
        username: user.username,
        type: 'individual',
        created_at: '2025-01-15T10:00:00',
        initial: '100.0000 RUB',
        minimum: '300.0000 RUB',
        spread_initial: true,
        meta: `Член совета кооператива ВОСХОД - ${user.first_name} ${user.middle_name} ${user.last_name}`,
      })

      console.log(`Устанавливаем дефолтный публичный ключ для ${user.username}`)

      await blockchain.changeKey({
        coopname: 'voskhod',
        changer: 'voskhod',
        username: user.username,
        public_key: config.default_public_key,
      })
    }
  }

  console.log('Создаём совет')

  const boardMembers: Array<{
    username: string
    is_voting: boolean
    position_title: string
    position: 'chairman' | 'member'
  }> = [
    {
      username: 'ant',
      is_voting: true,
      position_title: 'Председатель совета',
      position: 'chairman',
    },
  ]

  // Если расширенный режим, добавляем дополнительных членов
  if (isExtended) {
    boardMembers.push(
      {
        username: 'petr',
        is_voting: true,
        position_title: 'Член совета',
        position: 'member',
      },
      {
        username: 'anna',
        is_voting: true,
        position_title: 'Член совета',
        position: 'member',
      },
      {
        username: 'mikhail',
        is_voting: true,
        position_title: 'Член совета',
        position: 'member',
      },
      {
        username: 'olga',
        is_voting: true,
        position_title: 'Член совета',
        position: 'member',
      },
    )
  }

  await blockchain.createBoard({
    coopname: 'voskhod',
    username: 'ant',
    type: 'soviet',
    members: boardMembers,
    name: 'Совет',
    description: isExtended ? 'Совет кооператива ВОСХОД (расширенный состав)' : 'Совет кооператива ВОСХОД',
  })

  console.log('Создаём программы и соглашения')

  const cooperative = new CooperativeClass(blockchain)

  await cooperative.createPrograms(config.provider)

  console.log('Начальные данные установлены')
}

export async function installExtraData(blockchain: Blockchain) {
  // В расширенном режиме пайщики уже добавлены в installInitialData
  // Здесь можно добавить дополнительную логику инициализации если потребуется
  console.log('Дополнительная инициализация для расширенного режима выполнена')
}
