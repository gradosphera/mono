import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { CapitalContract, SovietContract } from 'cooptypes'
import Blockchain from '../blockchain'
import config from '../configs'
import { getTotalRamUsage, globalRamStats } from '../utils/getTotalRamUsage'
import { addUser } from '../init/participant'
import { generateRandomUsername } from '../utils/randomUsername'
import { generateRandomSHA256 } from '../utils/randomHash'
import { sleep } from '../utils'
import { getCoopProgramWallet } from './wallet/walletUtils'
import { registerContributor } from './capital/registerContributor'
import { signAppendix } from './capital/signAppendix'
import { capitalProgramId, sourceProgramId } from './capital/consts'
import { makeCombinedChecksum256NameIndexKey } from './shared/combinedKeys'
import { commitToResult } from './capital/commitToResult'
import { processApprove } from './capital/processApprove'
import { refreshSegment } from './capital/refreshSegment'
import { signWalletAgreement } from './wallet/signWalletAgreement'
import { fakeDocument } from './shared/fakeDocument'
import { depositToWallet } from './wallet/depositToWallet'
import { signCapitalAgreement } from './capital/signCapitalAgreement'
import { addAuthor } from './capital/addAuthor'
import { getSegment } from './capital/getSegment'
import { investInProject } from './capital/investInProject'

// const CLI_PATH = 'src/index.ts'

const blockchain = new Blockchain(config.network, config.private_keys)
let project1: CapitalContract.Actions.CreateProject.ICreateProject
let _project2: CapitalContract.Actions.CreateProject.ICreateProject
let _project3: CapitalContract.Actions.CreateProject.ICreateProject

let tester1: string
let tester2: string
let tester3: string
let tester4: string
let tester5: string

let investor1: string
let investor2: string
let investor3: string
// let result1: CapitalContract.Actions.CreateResult.ICreateResult
// let result2: CapitalContract.Actions.CreateResult.ICreateResult
// let result3: CapitalContract.Actions.CreateResult.ICreateResult

const commits: string[] = []
const tester1CommitHours = 10
const tester2CommitHours = 20
const tester3CommitHours = 100
const investAmount1 = 100000
const investAmount2 = 25000
const investAmount3 = 25000
beforeAll(async () => {
  await blockchain.update_pass_instance()

  investor1 = generateRandomUsername()
  console.log('investor1: ', investor1)
  await addUser(investor1)

  tester1 = generateRandomUsername()
  console.log('tester1: ', tester1)
  await addUser(tester1)

  tester2 = generateRandomUsername()
  console.log('tester2: ', tester2)
  await addUser(tester2)

  tester3 = generateRandomUsername()
  console.log('tester3: ', tester3)
  await addUser(tester3)

  tester4 = generateRandomUsername()
  console.log('tester4: ', tester4)
  await addUser(tester4)

  tester5 = generateRandomUsername()
  console.log('tester5: ', tester5)
  await addUser(tester5)

  investor2 = generateRandomUsername()
  console.log('investor2: ', investor2)
  await addUser(investor2, tester4)

  investor3 = generateRandomUsername()
  console.log('investor3: ', investor3)
  await addUser(investor3, tester5)

  // const { stdout } = await execa('esno', [CLI_PATH, 'boot'], { stdio: 'inherit' })
  // expect(stdout).toContain('Boot process completed')
}, 500_000)

afterAll(() => {
  console.log('\n📊 **RAM USAGE SUMMARY** 📊')
  let totalGlobalRam = 0

  for (const [key, ramUsed] of Object.entries(globalRamStats)) {
    const ramKb = (ramUsed / 1024).toFixed(2)
    console.log(`  ${key} = ${ramKb} kb`)
    totalGlobalRam += ramUsed
  }

  console.log(`\n💾 **TOTAL RAM USED IN TESTS**: ${(totalGlobalRam / 1024).toFixed(2)} kb\n`)

  console.log(`tester1: ${tester1}\ntester2: ${tester2}\ntester3: ${tester3}\ntester4: ${tester4}\ntester5: ${tester5}\ninvestor1: ${investor1}\ninvestor2: ${investor2}\ninvestor3: ${investor3}`)
})

describe('тест контракта CAPITAL', () => {
  it('создаём программу генерации', async () => {
    const program = await getCoopProgramWallet(blockchain, 'voskhod', sourceProgramId)
    if (!program) {
      const data: SovietContract.Actions.Programs.CreateProgram.ICreateProgram = {
        coopname: 'voskhod',
        is_can_coop_spend_share_contributions: true,
        username: 'ant',
        title: 'Договор УХД',
        announce: '',
        description: '',
        preview: '',
        images: '',
        calculation_type: 'free',
        fixed_membership_contribution: '0.0000 RUB',
        membership_percent_fee: '0',
        meta: '',
        type: 'source',
      }

      const result = await blockchain.api.transact(
        {
          actions: [
            {
              account: SovietContract.contractName.production,
              name: SovietContract.Actions.Programs.CreateProgram.actionName,
              authorization: [
                {
                  actor: 'ant',
                  permission: 'active',
                },
              ],
              data,
            },
          ],
        },
        {
          blocksBehind: 3,
          expireSeconds: 30,
        },
      )
      getTotalRamUsage(result)
      expect(result.transaction_id).toBeDefined()
    }
  })

  it('создаём программу капитализации', async () => {
    const program = await getCoopProgramWallet(blockchain, 'voskhod', capitalProgramId)

    if (!program) {
      const data: SovietContract.Actions.Programs.CreateProgram.ICreateProgram = {
        coopname: 'voskhod',
        is_can_coop_spend_share_contributions: false,
        username: 'ant',
        title: 'Капитализация',
        announce: '',
        description: '',
        preview: '',
        images: '',
        calculation_type: 'free',
        fixed_membership_contribution: '0.0000 RUB',
        membership_percent_fee: '0',
        meta: '',
        type: 'capital',
      }

      const result = await blockchain.api.transact(
        {
          actions: [
            {
              account: SovietContract.contractName.production,
              name: SovietContract.Actions.Programs.CreateProgram.actionName,
              authorization: [
                {
                  actor: 'ant',
                  permission: 'active',
                },
              ],
              data,
            },
          ],
        },
        {
          blocksBehind: 3,
          expireSeconds: 30,
        },
      )
      getTotalRamUsage(result)
      expect(result.transaction_id).toBeDefined()
    }
  })

  it('инициализируем контракт CAPITAL и сверяем конфиг', async () => {
    const data: CapitalContract.Actions.SetConfig.ISetConfig = {
      coopname: 'voskhod',
      config: {
        coordinator_bonus_percent: 4,
        expense_pool_percent: 100,
        coordinator_invite_validity_days: 30,
        voting_period_in_days: 7,
        authors_voting_percent: 38.2,
        creators_voting_percent: 38.2,
      },
    }

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.SetConfig.actionName,
            authorization: [
              {
                actor: 'voskhod',
                permission: 'active',
              },
            ],
            data,
          },
        ],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      },
    )
    getTotalRamUsage(result)
    expect(result.transaction_id).toBeDefined()

    const state = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      CapitalContract.contractName.production,
      'state',
      1,
      'voskhod',
      'voskhod',
    ))[0]
    console.log('state: ', state)
    expect(state).toBeDefined()
    expect(state.coopname).toBe('voskhod')
    expect(parseFloat(state.config.coordinator_bonus_percent)).toBe(data.config.coordinator_bonus_percent)
    expect(parseFloat(state.config.expense_pool_percent)).toBe(data.config.expense_pool_percent)
    expect(parseFloat(state.config.coordinator_invite_validity_days)).toBe(data.config.coordinator_invite_validity_days)
    expect(parseFloat(state.config.voting_period_in_days)).toBe(data.config.voting_period_in_days)
    expect(parseFloat(state.config.authors_voting_percent)).toBe(data.config.authors_voting_percent)
    expect(parseFloat(state.config.creators_voting_percent)).toBe(data.config.creators_voting_percent)
  })

  it('создаём проект', async () => {
    const hash = generateRandomSHA256()
    const parentHash = '0000000000000000000000000000000000000000000000000000000000000000'

    const data: CapitalContract.Actions.CreateProject.ICreateProject = {
      coopname: 'voskhod',
      project_hash: hash,
      parent_hash: parentHash,
      title: `Идея ${hash.slice(0, 10)}`,
      description: `Описание ${hash.slice(0, 10)}`,
      meta: '',
    }

    project1 = data

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.CreateProject.actionName,
            authorization: [
              {
                actor: 'voskhod',
                permission: 'active',
              },
            ],
            data,
          },
        ],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      },
    )

    expect(result.transaction_id).toBeDefined()

    const project = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      project1.project_hash,
      project1.project_hash,
      3,
      'sha256',
    ))[0]

    expect(project).toBeDefined()
    console.log('project: ', project)
    expect(project.coopname).toBe('voskhod')
    expect(project.status).toBe('pending')
    // План/факт и счетчики по умолчанию
    expect(project.plan.target_expense_pool).toBe('0.0000 RUB')
    expect(project.fact.target_expense_pool).toBe('0.0000 RUB')
    expect(project.fact.accumulated_expense_pool).toBe('0.0000 RUB')
    expect(project.fact.used_expense_pool).toBe('0.0000 RUB')
    expect(project.fact.invest_pool).toBe('0.0000 RUB')
    expect(project.counts.total_authors).toBe(0)
    expect(project.counts.total_creators).toBe(0)
    expect(project.counts.total_investors).toBe(0)
    expect(project.counts.total_contributors).toBe(0)
    expect(project.counts.total_commits).toBe(0)
    expect(project.project_hash).toBe(data.project_hash)
    expect(project.title).toBe(data.title)
    expect(project.description).toBe(data.description)
    getTotalRamUsage(result)
  })

  it('заключаем договор УХД и приложения к договору со множеством участников', async () => {
    const testerNames = [tester1, tester2, tester3, tester4, tester5, investor1, investor2, investor3]
    for (const tester of testerNames) {
      const appendixHash = generateRandomSHA256()
      const contributorHash = generateRandomSHA256()
      await registerContributor(blockchain, 'voskhod', tester, contributorHash, '1000.0000 RUB')
      await signAppendix(blockchain, 'voskhod', tester, project1.project_hash, appendixHash)
      const contributor = (await blockchain.getTableRows(
        CapitalContract.contractName.production,
        'voskhod',
        'contributors',
        1,
        tester,
        tester,
        2,
        'i64',
      ))[0]
      expect(contributor).toBeDefined()
      expect(contributor.appendixes).toContain(project1.project_hash)
      expect(contributor.status).toBe('active')
    }
  })

  it(`подписываем соглашения о ЦПП "Цифровой Кошелек" и "Капитализация"`, async () => {
    const testerNames = [tester1, tester2, tester3, tester4, tester5, investor1, investor2, investor3] // Можно передавать любое количество пользователей

    for (const tester of testerNames) {
      await signWalletAgreement(blockchain, 'voskhod', tester, fakeDocument)
      await signCapitalAgreement(blockchain, 'voskhod', tester, fakeDocument)
    }
  })

  it(`пополняем баланс кошелька investor1`, async () => {
    const { depositId, program, userWallet } = await depositToWallet(blockchain, 'voskhod', investor1, investAmount1)
  })

  it(`пополняем баланс кошелька investor2`, async () => {
    const { depositId, program, userWallet } = await depositToWallet(blockchain, 'voskhod', investor2, investAmount2 * 2)
  })

  it(`пополняем баланс кошелька investor3`, async () => {
    const { depositId, program, userWallet } = await depositToWallet(blockchain, 'voskhod', investor3, investAmount3)
  })

  it('добавляем мастера к проекту', async () => {
    const data: CapitalContract.Actions.SetMaster.ISetMaster = {
      coopname: 'voskhod',
      project_hash: project1.project_hash,
      master: tester1,
    }

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.SetMaster.actionName,
            authorization: [
              {
                actor: 'voskhod',
                permission: 'active',
              },
            ],
            data,
          },
        ],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      },
    )
    getTotalRamUsage(result)
    expect(result.transaction_id).toBeDefined()

    const project = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      project1.project_hash,
      project1.project_hash,
      3,
      'sha256',
    ))[0]

    expect(project).toBeDefined()
    console.log('project: ', project)
    expect(project.master).toBe(tester1)
  })

  it('добавляем автора к идее', async () => {
    const { project, segment } = await addAuthor(blockchain, 'voskhod', project1.project_hash, tester1)

    console.log('segment: ', segment)
    expect(segment).toBeDefined()
    expect(segment.username).toBe(tester1)
    expect(segment.project_hash).toBe(project1.project_hash)
    expect(segment.is_author).toBe(1)
    expect(segment.is_creator).toBe(0)
    expect(segment.is_coordinator).toBe(0)
    expect(segment.is_investor).toBe(0)
    expect(segment.is_contributor).toBe(0)
    expect(segment.is_coordinator).toBe(0)
    expect(segment.is_investor).toBe(0)
    expect(segment.is_contributor).toBe(0)
    expect(project).toBeDefined()
    expect(project.counts.total_authors).toBe(1)
  })

  it('устанавливаем план проекта', async () => {
    const data: CapitalContract.Actions.SetPlan.ISetPlan = {
      coopname: 'voskhod',
      master: tester1,
      project_hash: project1.project_hash,
      plan_creators_hours: 100,
      plan_expenses: '10000.0000 RUB',
      plan_hour_cost: '1000.0000 RUB',
    }

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.SetPlan.actionName,
            authorization: [
              {
                actor: 'voskhod',
                permission: 'active',
              },
            ],
            data,
          },
        ],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      },
    )
    getTotalRamUsage(result)
    expect(result.transaction_id).toBeDefined()

    const project = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      project1.project_hash,
      project1.project_hash,
      3,
      'sha256',
    ))[0]

    expect(project).toBeDefined()
    console.log('plan: ', project.plan)
    // Проверяем плановые показатели согласно формулам из generation.cpp
    expect(project.plan.hour_cost).toBe('1000.0000 RUB')
    expect(parseInt(project.plan.creators_hours)).toBe(100)
    expect(project.plan.target_expense_pool).toBe('10000.0000 RUB')

    // Себестоимости и премии
    expect(project.plan.creators_base_pool).toBe('100000.0000 RUB')
    expect(project.plan.authors_base_pool).toBe('61800.0000 RUB')
    expect(project.plan.coordinators_base_pool).toBe('6872.0000 RUB')
    expect(project.plan.creators_bonus_pool).toBe('100000.0000 RUB')
    expect(project.plan.authors_bonus_pool).toBe('61800.0000 RUB')

    // Инвестиции и коэффициент возврата
    expect(project.plan.invest_pool).toBe('168672.0000 RUB')
    expect(project.plan.total_received_investments).toBe('178672.0000 RUB')
    expect(project.plan.coordinators_investment_pool).toBe('178672.0000 RUB')
    expect(parseFloat(project.plan.return_base_percent)).toBeCloseTo(100, 10)
    expect(parseFloat(project.plan.use_invest_percent)).toBeCloseTo(100, 10)

    // Итого генерация, бонусы вкладчиков и общая сумма с расходами
    expect(project.plan.total_generation_pool).toBe('330472.0000 RUB')
    expect(project.plan.contributors_bonus_pool).toBe('534703.6960 RUB')
    expect(project.plan.total).toBe('875175.6960 RUB')
  })

  it('стартовать проект на приём коммитов', async () => {
    const data: CapitalContract.Actions.StartProject.IStartProject = {
      coopname: 'voskhod',
      project_hash: project1.project_hash,
    }
    const tx = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.StartProject.actionName,
            authorization: [{ actor: 'voskhod', permission: 'active' }],
            data,
          },
        ],
      },
      { blocksBehind: 3, expireSeconds: 30 },
    )
    getTotalRamUsage(tx)
    expect(tx.transaction_id).toBeDefined()

    const project = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      project1.project_hash,
      project1.project_hash,
      3,
      'sha256',
    ))[0]
    expect(project).toBeDefined()
    expect(project.status).toBe('active')
  })

  it('добавить коммит создателя tester1 на 10 часов по 1000 RUB', async () => {
    const { finalProject, commitHash, commit } = await commitToResult(blockchain, 'voskhod', project1.project_hash, tester1, tester1CommitHours)
    commits.push(commitHash)

    console.log('commit: ', commit)
    console.log('project fact: ', finalProject.fact)
    expect(finalProject.fact.creators_hours).toBe(10)
    expect(finalProject.fact.creators_base_pool).toBe('10000.0000 RUB')
    expect(finalProject.fact.creators_bonus_pool).toBe('10000.0000 RUB')
    expect(finalProject.fact.authors_bonus_pool).toBe('6180.0000 RUB')
    expect(finalProject.fact.total_generation_pool).toBe('32360.0000 RUB')
    expect(finalProject.fact.contributors_bonus_pool).toBe('52358.4800 RUB')
    expect(finalProject.fact.total).toBe('84718.4800 RUB')
  })

  it('обновить CRPS и проверить распределение авторских наград после первого коммита', async () => {
    // Обновляем сегмент tester1 через CRPS
    const { prevSegment, updatedSegment } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, tester1)

    console.log('Сегмент до обновления:', prevSegment)
    console.log('Сегмент после обновления:', updatedSegment)

    // Проверяем, что весь пул авторских вознаграждений распределился одному автору
    // В проекте authors_bonus_pool = '6180.0000 RUB' должен полностью перейти в author_bonus
    expect(updatedSegment.author_bonus).toBe('6180.0000 RUB')

    // Базовая награда автора также должна быть распределена
    // Из формулы генерации: base_bonus_coefficient * authors_bonus_pool / total_authors = 1.0 * 6180 / 1 = 6180
    expect(updatedSegment.author_base).toBe('6180.0000 RUB')

    // Проверяем, что is_author = true
    expect(updatedSegment.is_author).toBe(1)

    console.log(`✅ Авторские награды успешно распределены: base=${updatedSegment.author_base}, bonus=${updatedSegment.author_bonus}`)
  })

  it('добавляем второго автора tester2 к идее', async () => {
    const { project, segment } = await addAuthor(blockchain, 'voskhod', project1.project_hash, tester2)

    console.log('segment tester2: ', segment)
    expect(segment).toBeDefined()
    expect(segment.username).toBe(tester2)
    expect(segment.project_hash).toBe(project1.project_hash)
    expect(segment.is_author).toBe(1)
    expect(segment.is_creator).toBe(0)
    expect(segment.is_coordinator).toBe(0)
    expect(segment.is_investor).toBe(0)
    expect(segment.is_contributor).toBe(0)
    expect(project).toBeDefined()
    expect(project.counts.total_authors).toBe(2) // Теперь у нас 2 автора
  })

  it('добавить коммит создателя tester2 на 20 часов по 1000 RUB', async () => {
    const { finalProject, commitHash, commit } = await commitToResult(blockchain, 'voskhod', project1.project_hash, tester2, tester2CommitHours)
    commits.push(commitHash)

    console.log('commit tester2: ', commit)
    console.log('project fact after tester2 commit: ', finalProject.fact)

    expect(commit.amounts.creators_base_pool).toBe('20000.0000 RUB')
    expect(commit.amounts.creators_bonus_pool).toBe('20000.0000 RUB')
    expect(commit.amounts.authors_bonus_pool).toBe('12360.0000 RUB')
    expect(commit.amounts.authors_base_pool).toBe('12360.0000 RUB')
    expect(commit.amounts.total_generation_pool).toBe('64720.0000 RUB')
    expect(commit.amounts.contributors_bonus_pool).toBe('104716.9600 RUB')
    expect(commit.amounts.total_contribution).toBe('169436.9600 RUB')

    // Проверяем накопительные значения после двух коммитов (10 + 20 = 30 часов)
    expect(finalProject.fact.creators_hours).toBe(30)
    expect(finalProject.fact.creators_base_pool).toBe('30000.0000 RUB')
    expect(finalProject.fact.creators_bonus_pool).toBe('30000.0000 RUB')
    expect(finalProject.fact.authors_bonus_pool).toBe('18540.0000 RUB')
    expect(finalProject.fact.total_generation_pool).toBe('97080.0000 RUB')
    expect(finalProject.fact.contributors_bonus_pool).toBe('157075.4400 RUB')
    expect(finalProject.fact.total).toBe('254155.4400 RUB')
  })

  it('обновить CRPS для обоих авторов и проверить распределение авторских наград', async () => {
    // Обновляем сегмент tester1 через CRPS
    await sleep(1000) // т.к. ранее мы делали обновление и будет дублирование - надо подождать
    const { prevSegment: prevTester1, updatedSegment: updatedTester1 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, tester1)
    // Обновляем сегмент tester2 через CRPS
    const { prevSegment: prevTester2, updatedSegment: updatedTester2 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, tester2)

    // console.log('Tester1 - сегмент до обновления:', prevTester1)
    // console.log('Tester1 - сегмент после обновления:', updatedTester1)
    // console.log('Tester2 - сегмент до обновления:', prevTester2)
    // console.log('Tester2 - сегмент после обновления:', updatedTester2)

    // Получаем проект для проверки текущего authors_bonus_pool
    const project = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      project1.project_hash,
      project1.project_hash,
      3,
      'sha256',
    ))[0]

    console.log('Current project authors_bonus_pool:', project.fact.authors_bonus_pool)

    // После второго коммита авторский пул составляет 18540 RUB, прирост составил 12360 RUB
    // Он должен распределиться поровну между двумя авторами: 12360 / 2 = 6180 RUB каждому

    // Проверяем tester1 (у него была награда от первого коммита + доля от второго)
    // tester1 должен получить: 6180 (от первого коммита) + 6180 (доля от второго) = 12360
    // Но поскольку распределение происходит от текущего пула, каждый получает половину от 12360 = 6180
    expect(updatedTester1.author_bonus).toBe('12360.0000 RUB')
    expect(updatedTester1.author_base).toBe('12360.0000 RUB')
    // Проверяем что сумма к ссуде равна 0 т.к. инвестиций нет
    expect(updatedTester1.provisional_amount).toBe('0.0000 RUB')

    // Проверяем tester2 (получает свою долю от текущего пула)
    expect(updatedTester2.author_bonus).toBe('6180.0000 RUB')
    expect(updatedTester2.author_base).toBe('6180.0000 RUB')
    // Проверяем что сумма к ссуде равна 0 т.к. инвестиций нет
    expect(updatedTester2.provisional_amount).toBe('0.0000 RUB')

    // Проверяем, что оба являются авторами
    expect(updatedTester1.is_author).toBe(1)
    expect(updatedTester2.is_author).toBe(1)

    console.log(`✅ Авторские награды успешно распределены между двумя авторами:`)
    console.log(`   tester1: base=${updatedTester1.author_base}, bonus=${updatedTester1.author_bonus}`)
    console.log(`   tester2: base=${updatedTester2.author_base}, bonus=${updatedTester2.author_bonus}`)
  })

  it('проверяем, что оба пайщика являются авторами и создателями', async () => {
    const segment1 = await getSegment(blockchain, 'voskhod', project1.project_hash, tester1)
    const segment2 = await getSegment(blockchain, 'voskhod', project1.project_hash, tester2)
    expect(segment1.is_author).toBe(1)
    expect(segment2.is_author).toBe(1)
    expect(segment1.is_creator).toBe(1)
    expect(segment2.is_creator).toBe(1)
  })

  it('открыть приём инвестиций', async () => {
    const data: CapitalContract.Actions.OpenProject.IOpenProject = {
      coopname: 'voskhod',
      project_hash: project1.project_hash,
    }
    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.OpenProject.actionName,
            authorization: [{ actor: 'voskhod', permission: 'active' }],
            data,
          },
        ],
      },
      { blocksBehind: 3, expireSeconds: 30 },
    )

    const project = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      project1.project_hash,
      project1.project_hash,
      3,
      'sha256',
    ))[0]
    console.log('project: ', project)
    expect(project).toBeDefined()
    expect(project.is_opened).toBe(1)
    expect(project.fact.target_expense_pool).toBe('10000.0000 RUB')
    expect(project.fact.accumulated_expense_pool).toBe('0.0000 RUB')
    expect(project.fact.used_expense_pool).toBe('0.0000 RUB')
  })

  it('инвестировать в проект аккаунтом investor1 на 100000 RUB', async () => {
    fakeDocument.signatures[0].signer = investor1
    const { project, transactionId } = await investInProject(blockchain, 'voskhod', investor1, project1.project_hash, `${investAmount1}.0000 RUB`, fakeDocument)
    expect(project).toBeDefined()
    expect(transactionId).toBeDefined()
    expect(project.fact.total_received_investments).toBe('100000.0000 RUB')
    expect(project.fact.invest_pool).toBe('90000.0000 RUB')
    expect(project.fact.accumulated_expense_pool).toBe('10000.0000 RUB')
    expect(parseFloat(project.fact.use_invest_percent)).toBeCloseTo(58.54, 1)
    expect(parseFloat(project.fact.return_base_percent)).toBeCloseTo(100, 1)
  })

  it('обновляем сегменты tester1, tester2 и investor1 и проверяем обеспечение инвестициями для ссуд', async () => {
    await sleep(1000)

    const { prevSegment: prevTester1, updatedSegment: updatedTester1 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, tester1)
    const { prevSegment: prevTester2, updatedSegment: updatedTester2 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, tester2)
    const { prevSegment: prevInvestor1, updatedSegment: updatedInvestor1 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, investor1)

    console.log('updatedTester1: ', updatedTester1)
    console.log('updatedTester2: ', updatedTester2)
    console.log('updatedInvestor1: ', updatedInvestor1)

    expect(updatedTester1.provisional_amount).toBe('22360.0000 RUB')
    expect(updatedTester2.provisional_amount).toBe('26180.0000 RUB')
    expect(updatedInvestor1.provisional_amount).toBe('0.0000 RUB')
    // Проверяем что сумма инвестиций равна 100000 RUB
    expect(updatedInvestor1.investor_amount).toBe('100000.0000 RUB')
    // Проверяем что используемая сумма инвестиций равна 58540 RUB
    expect(updatedInvestor1.investor_base).toBe('58540.0000 RUB')
  })

  it('tester3 вносит 100000 RUB коммитом и делает сумму инвестиций недостаточной для полного обеспечения', async () => {
    const { finalProject, commitHash, commit } = await commitToResult(blockchain, 'voskhod', project1.project_hash, tester3, tester3CommitHours)
    commits.push(commitHash)

    console.log('commit tester3: ', commit)
    console.log('project fact after tester3 commit: ', finalProject.fact)

    expect(finalProject.fact.creators_hours).toBe(130)
    expect(finalProject.fact.creators_base_pool).toBe('130000.0000 RUB')
    expect(finalProject.fact.creators_bonus_pool).toBe('130000.0000 RUB')
    expect(finalProject.fact.authors_base_pool).toBe('80340.0000 RUB')
    expect(finalProject.fact.authors_bonus_pool).toBe('80340.0000 RUB')
    expect(finalProject.fact.total_generation_pool).toBe('420680.0000 RUB')
    expect(finalProject.fact.contributors_bonus_pool).toBe('680660.2400 RUB')
    expect(finalProject.fact.total).toBe('1101340.2400 RUB')

    expect(parseFloat(finalProject.fact.use_invest_percent)).toBeCloseTo(100, 1)
    expect(parseFloat(finalProject.fact.return_base_percent)).toBeCloseTo(42.78, 1)

    await sleep(1000)
    // Проверяем сегменты
    const { prevSegment: prevTester1, updatedSegment: updatedTester1 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, tester1)
    const { prevSegment: prevTester2, updatedSegment: updatedTester2 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, tester2)
    const { prevSegment: prevInvestor1, updatedSegment: updatedInvestor1 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, investor1)

    // console.log('prevTester2: ', prevTester2)
    // console.log('updatedTester2: ', updatedTester2)
    // console.log('updatedInvestor1: ', updatedInvestor1)

    expect(updatedTester1.provisional_amount).toBe('22788.8181 RUB')
    expect(updatedTester2.provisional_amount).toBe('24423.3146 RUB')
    expect(updatedInvestor1.provisional_amount).toBe('0.0000 RUB')
    expect(updatedInvestor1.investor_base).toBe('100000.0000 RUB')
    expect(updatedInvestor1.investor_amount).toBe('100000.0000 RUB')
  })

  it('инвестировать в проект аккаунтом investor2 на 25000 RUB с координатором tester4', async () => {
    fakeDocument.signatures[0].signer = investor2
    const { project, prevProject, transactionId } = await investInProject(blockchain, 'voskhod', investor2, project1.project_hash, `${investAmount2}.0000 RUB`, fakeDocument)
    expect(project).toBeDefined()
    expect(transactionId).toBeDefined()
    // console.log('prevProject: ', prevProject)
    // console.log('project: ', project)
    expect(project.counts.total_coordinators).toBe(1)
    expect(project.fact.coordinators_investment_pool).toBe('25000.0000 RUB')
    expect(project.fact.coordinators_base_pool).toBe('961.5384 RUB')
    expect(project.fact.total_received_investments).toBe('125000.0000 RUB')
    expect(parseFloat(project.fact.return_base_percent)).toBeCloseTo(54.42, 1)
    expect(parseFloat(project.fact.use_invest_percent)).toBeCloseTo(100, 1)

    // Проверяем сегменты
    const { prevSegment: prevTester4, updatedSegment: updatedTester4 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, tester4)
    expect(updatedTester4.provisional_amount).toBe('523.3133 RUB')
    expect(updatedTester4.coordinator_base).toBe('961.5384 RUB')
    expect(updatedTester4.is_coordinator).toBe(1)
    expect(updatedTester4.coordinator_investments).toBe('25000.0000 RUB')

    console.log('updatedTester4: ', updatedTester4)

    const { prevSegment: prevInvestor2, updatedSegment: updatedInvestor2 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, investor2)
    console.log('updatedInvestor2: ', updatedInvestor2)
    expect(updatedInvestor2.provisional_amount).toBe('0.0000 RUB')
    expect(updatedInvestor2.investor_base).toBe('25000.0000 RUB')
    expect(updatedInvestor2.investor_amount).toBe('25000.0000 RUB')
  })

  it('инвестировать в проект аккаунтом investor3 еще на 25000 RUB с координатором tester5', async () => {
    fakeDocument.signatures[0].signer = investor3
    const { project, prevProject, transactionId } = await investInProject(blockchain, 'voskhod', investor3, project1.project_hash, `${investAmount3}.0000 RUB`, fakeDocument)
    expect(project).toBeDefined()
    expect(transactionId).toBeDefined()
    console.log('prevProject: ', prevProject)
    console.log('project: ', project)
    expect(project.counts.total_coordinators).toBe(2)
    expect(project.fact.coordinators_investment_pool).toBe('50000.0000 RUB')
    expect(project.fact.coordinators_base_pool).toBe('1923.0768 RUB')
    expect(project.fact.total_received_investments).toBe('150000.0000 RUB')
    expect(parseFloat(project.fact.return_base_percent)).toBeCloseTo(65.9558, 1)
    expect(parseFloat(project.fact.use_invest_percent)).toBeCloseTo(100, 1)

    const { prevSegment: prevTester5, updatedSegment: updatedTester5 } = await refreshSegment(blockchain, 'voskhod', project1.project_hash, tester5)
    console.log('updatedTester5: ', updatedTester5)
    // expect(updatedTester5.provisional_amount).toBe('0.0000 RUB')
    // expect(updatedTester5.investor_base).toBe('25000.0000 RUB')
    // expect(updatedTester5.investor_amount).toBe('25000.0000 RUB')
  })

  // it('финансировать результат проекта на 10000 RUB', async () => {
  //   await allocateFundsToResult(blockchain, 'voskhod', project1.project_hash, result1.result_hash, '10000.0000 RUB')
  // })

  // it('финансировать результат проекта на 20000 RUB', async () => {
  //   await allocateFundsToResult(blockchain, 'voskhod', project1.project_hash, result1.result_hash, '20000.0000 RUB')
  // })

  // it('добавить коммит создателя tester1 на 10 часов по 1000 RUB', async () => {
  //   const { finalResult, commitHash } = await commitToResult(blockchain, 'voskhod', result1.result_hash, result1.project_hash, tester1, tester1CommitHours)
  //   commits.push(commitHash)

  //   expect(finalResult.creators_base).toBe('10000.0000 RUB')
  //   expect(finalResult.creators_bonus).toBe('3820.0000 RUB')
  //   expect(finalResult.authors_bonus).toBe('16180.0000 RUB')
  //   expect(finalResult.generated).toBe('30000.0000 RUB')
  //   expect(finalResult.capitalists_bonus).toBe('48540.0000 RUB')
  //   expect(finalResult.total).toBe('78540.0000 RUB')
  // })

  // it('добавить коммит создателя tester2 на 10 часов по 1000 RUB', async () => {
  //   const { finalResult, commitHash } = await commitToResult(blockchain, 'voskhod', result1.result_hash, result1.project_hash, tester2, tester2CommitHours)
  //   commits.push(commitHash)

  //   expect(finalResult.creators_base).toBe('20000.0000 RUB')
  //   expect(finalResult.creators_bonus).toBe('7640.0000 RUB')
  //   expect(finalResult.authors_bonus).toBe('32360.0000 RUB')
  //   expect(finalResult.generated).toBe('60000.0000 RUB')
  //   expect(finalResult.capitalists_bonus).toBe('97080.0000 RUB')
  //   expect(finalResult.total).toBe('157080.0000 RUB')
  // })

  // TODO: заменить на получение ссуды, а возврат перенести ниже
  // it('пишем заявление на возврат в кошелёк от tester1 на 10000 RUB', async () => {
  //   const withdrawAmount = `${(tester1CommitHours * parseFloat(ratePerHour)).toFixed(4)} RUB`
  //   console.log('commits: ', commits)
  //   const { withdrawHash, transactionId } = await withdrawContribution(
  //     blockchain,
  //     'voskhod',
  //     tester1,
  //     result1.result_hash,
  //     result1.project_hash,
  //     [commits[0]],
  //     withdrawAmount,
  //     fakeDocument,
  //   )
  // })

  // it('пишем заявление на возврат в кошелёк от tester2 на 10000 RUB', async () => {
  //   const withdrawAmount = `${(tester2CommitHours * parseFloat(ratePerHour)).toFixed(4)} RUB`

  //   const { withdrawHash, transactionId } = await withdrawContribution(
  //     blockchain,
  //     'voskhod',
  //     tester2,
  //     result1.result_hash,
  //     result1.project_hash,
  //     [commits[1]],
  //     withdrawAmount,
  //     fakeDocument,
  //   )
  // })

  // it('регистрируем расход на 1000 RUB', async () => {
  //   const expenseAmount = '1000.0000 RUB'

  //   const { expenseHash } = await registerExpense(
  //     blockchain,
  //     'voskhod', // coopname
  //     result1.result_hash, // resultHash
  //     project1.project_hash, // projectHash
  //     tester1, // creator
  //     4, // fund_id (фонд хозяйственных расходов)
  //     expenseAmount,
  //     fakeDocument, // fakeDocument
  //   )
  // })

  // it('регистрируем расход на 5000 RUB', async () => {
  //   const expenseAmount = '5000.0000 RUB'

  //   const { expenseHash } = await registerExpense(
  //     blockchain,
  //     'voskhod', // coopname
  //     result1.result_hash, // resultHash
  //     project1.project_hash, // projectHash
  //     tester1, // creator
  //     4, // fund_id (фонд хозяйственных расходов)
  //     expenseAmount,
  //     fakeDocument, // fakeDocument
  //   )
  // })

  // /// ____________
  // it('завершаем цикл и стартуем распределение', async () => {
  //   const data: CapitalContract.Actions.StartDistribution.IStart = {
  //     coopname: 'voskhod',
  //     application: 'voskhod',
  //     result_hash: result1.result_hash,
  //   }

  //   const result = await blockchain.api.transact(
  //     {
  //       actions: [
  //         {
  //           account: CapitalContract.contractName.production,
  //           name: CapitalContract.Actions.StartDistribution.actionName,
  //           authorization: [
  //             {
  //               actor: 'voskhod',
  //               permission: 'active',
  //             },
  //           ],
  //           data,
  //         },
  //       ],
  //     },
  //     {
  //       blocksBehind: 3,
  //       expireSeconds: 30,
  //     },
  //   )

  //   getTotalRamUsage(result)
  //   expect(result.transaction_id).toBeDefined()

  //   const blockchainResult = (await blockchain.getTableRows(
  //     CapitalContract.contractName.production,
  //     'voskhod',
  //     'results',
  //     1,
  //     result1.result_hash,
  //     result1.result_hash,
  //     2,
  //     'sha256',
  //   ))[0]

  //   expect(blockchainResult).toBeDefined()
  //   expect(blockchainResult.result_hash).toBe(result1.result_hash)
  //   expect(blockchainResult.project_hash).toBe(project1.project_hash)
  //   expect(blockchainResult.coopname).toBe('voskhod')
  //   expect(blockchainResult.status).toBe('closed')

  //   expect(blockchainResult.creators_amount_remain).toBe(blockchainResult.creators_amount)
  //   expect(blockchainResult.creators_bonus_remain).toBe(blockchainResult.creators_bonus)
  //   expect(blockchainResult.authors_bonus_remain).toBe(blockchainResult.authors_bonus)
  //   expect(blockchainResult.capitalists_bonus_remain).toBe(blockchainResult.capitalists_bonus)
  //   console.log('Результат после старта приёма: ', blockchainResult)
  // })

  // it('обновляем капитал первого создателя в результате', async () => {
  //   const claim_hash = generateRandomSHA256()

  //   const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
  //     coopname: 'voskhod',
  //     application: 'voskhod',
  //     result_hash: result1.result_hash,
  //     username: tester1,
  //     claim_hash,
  //   }

  //   const result = await blockchain.api.transact(
  //     {
  //       actions: [
  //         {
  //           account: CapitalContract.contractName.production,
  //           name: CapitalContract.Actions.CreateClaim.actionName,
  //           authorization: [
  //             {
  //               actor: 'voskhod',
  //               permission: 'active',
  //             },
  //           ],
  //           data,
  //         },
  //       ],
  //     },
  //     {
  //       blocksBehind: 3,
  //       expireSeconds: 30,
  //     },
  //   )
  //   getTotalRamUsage(result)
  //   expect(result.transaction_id).toBeDefined()

  //   const blockchainResult = (await blockchain.getTableRows(
  //     CapitalContract.contractName.production,
  //     'voskhod',
  //     'results',
  //     1,
  //     result1.result_hash,
  //     result1.result_hash,
  //     2,
  //     'sha256',
  //   ))[0]

  //   expect(blockchainResult).toBeDefined()
  //   console.log('blockchainResult: ', blockchainResult)
  // })

  // it('обновляем капитал второго создателя в результате', async () => {
  //   const claim_hash = generateRandomSHA256()

  //   const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
  //     coopname: 'voskhod',
  //     application: 'voskhod',
  //     result_hash: result1.result_hash,
  //     username: tester2,
  //     claim_hash,
  //   }

  //   const result = await blockchain.api.transact(
  //     {
  //       actions: [
  //         {
  //           account: CapitalContract.contractName.production,
  //           name: CapitalContract.Actions.CreateClaim.actionName,
  //           authorization: [
  //             {
  //               actor: 'voskhod',
  //               permission: 'active',
  //             },
  //           ],
  //           data,
  //         },
  //       ],
  //     },
  //     {
  //       blocksBehind: 3,
  //       expireSeconds: 30,
  //     },
  //   )
  //   getTotalRamUsage(result)
  //   expect(result.transaction_id).toBeDefined()

  //   const blockchainResult = (await blockchain.getTableRows(
  //     CapitalContract.contractName.production,
  //     'voskhod',
  //     'results',
  //     1,
  //     result1.result_hash,
  //     result1.result_hash,
  //     2,
  //     'sha256',
  //   ))[0]

  //   expect(blockchainResult).toBeDefined()
  //   console.log('blockchainResult: ', blockchainResult)
  // })

  // it('повторно обновляем капитал второго создателя в результате и ожидаем ошибку', async () => {
  //   const claim_hash = generateRandomSHA256()

  //   const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
  //     coopname: 'voskhod',
  //     application: 'voskhod',
  //     result_hash: result1.result_hash,
  //     username: tester2,
  //     claim_hash,
  //   }

  //   try {
  //     await sleep(1000)
  //     await blockchain.api.transact(
  //       {
  //         actions: [
  //           {
  //             account: CapitalContract.contractName.production,
  //             name: CapitalContract.Actions.CreateClaim.actionName,
  //             authorization: [
  //               {
  //                 actor: 'voskhod',
  //                 permission: 'active',
  //               },
  //             ],
  //             data,
  //           },
  //         ],
  //       },
  //       {
  //         blocksBehind: 3,
  //         expireSeconds: 30,
  //       },
  //     )
  //     throw new Error('Ожидалась ошибка, но транзакция прошла успешно')
  //   }
  //   catch (error: any) {
  //     const message = error.json?.error?.details?.[0]?.message
  //     expect(message).toMatch(/Клайм уже существует/i)
  //   }
  // })

  // it('обновляем капитал инвестора в результате', async () => {
  //   const claim_hash = generateRandomSHA256()

  //   const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
  //     coopname: 'voskhod',
  //     application: 'voskhod',
  //     result_hash: result1.result_hash,
  //     username: investor1,
  //     claim_hash,
  //   }

  //   const result = await blockchain.api.transact(
  //     {
  //       actions: [
  //         {
  //           account: CapitalContract.contractName.production,
  //           name: CapitalContract.Actions.CreateClaim.actionName,
  //           authorization: [
  //             {
  //               actor: 'voskhod',
  //               permission: 'active',
  //             },
  //           ],
  //           data,
  //         },
  //       ],
  //     },
  //     {
  //       blocksBehind: 3,
  //       expireSeconds: 30,
  //     },
  //   )
  //   getTotalRamUsage(result)
  //   expect(result.transaction_id).toBeDefined()

  //   const blockchainResult = (await blockchain.getTableRows(
  //     CapitalContract.contractName.production,
  //     'voskhod',
  //     'results',
  //     1,
  //     result1.result_hash,
  //     result1.result_hash,
  //     2,
  //     'sha256',
  //   ))[0]

  //   expect(blockchainResult).toBeDefined()
  //   console.log('investorResult: ', blockchainResult)
  // })

  // it('повторно обновляем капитал инвестора в результате и ожидаем ошибку', async () => {
  //   const claim_hash = generateRandomSHA256()

  //   const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
  //     coopname: 'voskhod',
  //     application: 'voskhod',
  //     result_hash: result1.result_hash,
  //     username: investor1,
  //     claim_hash,
  //   }

  //   try {
  //     await sleep(1000)
  //     await blockchain.api.transact(
  //       {
  //         actions: [
  //           {
  //             account: CapitalContract.contractName.production,
  //             name: CapitalContract.Actions.CreateClaim.actionName,
  //             authorization: [
  //               {
  //                 actor: 'voskhod',
  //                 permission: 'active',
  //               },
  //             ],
  //             data,
  //           },
  //         ],
  //       },
  //       {
  //         blocksBehind: 3,
  //         expireSeconds: 30,
  //       },
  //     )
  //     throw new Error('Ожидалась ошибка, но транзакция прошла успешно')
  //   }
  //   catch (error: any) {
  //     const message = error.json?.error?.details?.[0]?.message
  //     expect(message).toMatch(/Клайм уже существует/i)
  //   }
  // })
})
