import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { CapitalContract, SovietContract } from 'cooptypes'
import Blockchain from '../blockchain'
import config from '../configs'
import { getTotalRamUsage, globalRamStats } from '../utils/getTotalRamUsage'
import { addUser } from '../init/participant'
import { generateRandomUsername } from '../utils/randomUsername'
import { generateRandomSHA256 } from '../utils/randomHash'
import { generateRandomContributionAmount, generateRandomDescription, generateRandomMeta, generateRandomProjectData, generateRandomPropertyDescription, sleep } from '../utils'
import { getCoopProgramWallet, getLedgerAccountById, getUserProgramWalletAmount } from './wallet/walletUtils'
import { registerContributor } from './capital/registerContributor'
import { signAppendix } from './capital/signAppendix'
import { capitalProgramId, circulationAccountId, sourceProgramId } from './capital/consts'
import { commitToResult } from './capital/commitToResult'
import { refreshSegment } from './capital/refreshSegment'
import { signWalletAgreement } from './wallet/signWalletAgreement'
import { fakeDocument } from './shared/fakeDocument'
import { depositToWallet } from './wallet/depositToWallet'
import { signCapitalAgreement } from './capital/signCapitalAgreement'
import { addAuthor } from './capital/addAuthor'
import { getSegment } from './capital/getSegment'
import { investInProject } from './capital/investInProject'
import { processDebt } from './capital/processDebt'
import { processCreateProjectProperty } from './capital/processCreateProjectProperty'
import { processCreateProgramProperty } from './capital/processCreateProgramProperty'
import { processStartVoting } from './capital/processStartVoting'
import { createVoteDistribution, submitVote } from './capital/submitVote'
import { processCompleteVoting } from './capital/processCompleteVoting'
import { processPushResult } from './capital/processPushResult'
import { processConvertSegment } from './capital/processConvertSegment'
import { processCalculateVotes } from './capital/processCalculateVotes'
import { processAddContributor } from './capital/processAddContributor'
import { processDeleteProject } from './capital/processDeleteProject'
import { getProject } from './capital/getProject'
import { processFundProgram } from './capital/processFundProgram'
import { processRefreshProg } from './capital/processRefreshProg'
import { processFundProject } from './capital/processFundProject'
import { processRefreshProj } from './capital/processRefreshProj'
// const CLI_PATH = 'src/index.ts'

const blockchain = new Blockchain(config.network, config.private_keys)
let metaProject: CapitalContract.Actions.CreateProject.ICreateProject
let componentProject: CapitalContract.Actions.CreateProject.ICreateProject
let newComponentProject: CapitalContract.Actions.CreateProject.ICreateProject

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

let totalToCapitalConvertAmount = 0
let totalToProjectConvertAmount = 0
// Хранение хэшей долгов для каждого пользователя
let userDebtHashes: { [username: string]: string[] } = {}
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

  // Инициализируем массивы хэшей долгов для каждого пользователя
  userDebtHashes = {
    [tester1]: [],
    [tester2]: [],
    [tester3]: [],
    [tester4]: [],
    [tester5]: [],
    [investor1]: [],
    [investor2]: [],
    [investor3]: [],
  }

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
        type: 'generator',
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
        type: 'blagorost',
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
        energy_decay_rate_per_day: 0.11,
        level_depth_base: 1000,
        level_growth_coefficient: 1.5,
        energy_gain_coefficient: 0.01,
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

  it('создаём мета-проект и компонент-проект', async () => {
    // Создаём мета-проект
    const metaHash = generateRandomSHA256()
    const parentHash = '0000000000000000000000000000000000000000000000000000000000000000'

    const metaData: CapitalContract.Actions.CreateProject.ICreateProject = {
      coopname: 'voskhod',
      project_hash: metaHash,
      parent_hash: parentHash,
      title: `Мета-проект ${metaHash.slice(0, 10)}`,
      description: generateRandomDescription(),
      invite: '',
      data: generateRandomProjectData(800, 1500),
      meta: generateRandomMeta(),
      can_convert_to_project: true,
    }

    metaProject = metaData

    const metaResult = await blockchain.api.transact(
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
            data: metaData,
          },
        ],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      },
    )

    expect(metaResult.transaction_id).toBeDefined()
    getTotalRamUsage(metaResult)

    // Создаём компонент-проект
    const componentHash = generateRandomSHA256()

    const componentData: CapitalContract.Actions.CreateProject.ICreateProject = {
      coopname: 'voskhod',
      project_hash: componentHash,
      parent_hash: metaHash, // Родительский хэш указывает на мета-проект
      title: `Компонент-проект ${componentHash.slice(0, 10)}`,
      description: generateRandomDescription(),
      meta: generateRandomMeta(),
      data: generateRandomProjectData(1000, 2500),
      invite: '',
      can_convert_to_project: true,
    }

    componentProject = componentData

    const componentResult = await blockchain.api.transact(
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
            data: componentData,
          },
        ],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      },
    )

    expect(componentResult.transaction_id).toBeDefined()
    getTotalRamUsage(componentResult)

    // Проверяем мета-проект
    const metaProjectState = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      metaProject.project_hash,
      metaProject.project_hash,
      3,
      'sha256',
    ))[0]

    expect(metaProjectState).toBeDefined()
    console.log('meta project: ', metaProjectState)
    expect(metaProjectState.coopname).toBe('voskhod')
    expect(metaProjectState.status).toBe('pending')
    expect(metaProjectState.parent_hash).toBe('0000000000000000000000000000000000000000000000000000000000000000')

    // Проверяем компонент-проект
    const componentProjectState = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      componentProject.project_hash,
      componentProject.project_hash,
      3,
      'sha256',
    ))[0]

    expect(componentProjectState).toBeDefined()
    console.log('component project: ', componentProjectState)
    expect(componentProjectState.coopname).toBe('voskhod')
    expect(componentProjectState.status).toBe('pending')
    expect(componentProjectState.parent_hash).toBe(metaProject.project_hash)

    console.log(`✅ Создали мета-проект: ${metaProject.project_hash}`)
    console.log(`✅ Создали компонент-проект: ${componentProject.project_hash} (parent: ${metaProject.project_hash})`)
  })

  it('заключаем договор УХД, приложение к мета-проекту и проекту компоненту со множеством участников', async () => {
    const testerNames = [tester1, tester2, tester3, tester4, tester5, investor1, investor2, investor3]
    for (const tester of testerNames) {
      const appendixHash = generateRandomSHA256()
      const metaAppendixHash = generateRandomSHA256()
      const contributorHash = generateRandomSHA256()
      // Используем разные суммы для каждого участника
      const contributionAmount = '1000.0000 RUB'
      console.log(`Регистрируем ${tester} с взносом ${contributionAmount}`)
      await registerContributor(blockchain, 'voskhod', tester, contributorHash, contributionAmount)
      await signAppendix(blockchain, 'voskhod', tester, metaProject.project_hash, metaAppendixHash)
      await signAppendix(blockchain, 'voskhod', tester, componentProject.project_hash, appendixHash)

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
      expect(contributor.appendixes).toContain(metaProject.project_hash)
      expect(contributor.appendixes).toContain(componentProject.project_hash)
      expect(contributor.status).toBe('active')
    }
  }, 1000_000)

  it(`подписываем соглашения о ЦПП "Цифровой Кошелек" и "Капитализация"`, async () => {
    const testerNames = [tester1, tester2, tester3, tester4, tester5, investor1, investor2, investor3] // Можно передавать любое количество пользователей

    for (const tester of testerNames) {
      await signWalletAgreement(blockchain, 'voskhod', tester, fakeDocument)
      await signCapitalAgreement(blockchain, 'voskhod', tester, fakeDocument)
    }
  }, 1000_000)

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
      project_hash: componentProject.project_hash,
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
      componentProject.project_hash,
      componentProject.project_hash,
      3,
      'sha256',
    ))[0]

    expect(project).toBeDefined()
    console.log('project: ', project)
    expect(project.master).toBe(tester1)

    const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, tester1)
    expect(segment.is_author).toBe(1)
  })

  // не делаем потому что мастер - это сразу и автор сейчас.
  // it('добавляем автора к идее', async () => {
  //   const { project, segment } = await addAuthor(blockchain, 'voskhod', componentProject.project_hash, tester2)

  //   console.log('segment: ', segment)
  //   expect(segment).toBeDefined()
  //   expect(segment.username).toBe(tester2)
  //   expect(segment.project_hash).toBe(componentProject.project_hash)
  //   expect(segment.is_author).toBe(1)
  //   expect(segment.is_creator).toBe(0)
  //   expect(segment.is_coordinator).toBe(0)
  //   expect(segment.is_investor).toBe(0)
  //   expect(segment.is_contributor).toBe(0)
  //   expect(segment.is_coordinator).toBe(0)
  //   expect(segment.is_investor).toBe(0)
  //   expect(segment.is_contributor).toBe(0)
  //   expect(project).toBeDefined()
  //   expect(project.counts.total_authors).toBe(1)
  // })

  it('устанавливаем план проекта', async () => {
    const data: CapitalContract.Actions.SetPlan.ISetPlan = {
      coopname: 'voskhod',
      master: tester1,
      project_hash: componentProject.project_hash,
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
      componentProject.project_hash,
      componentProject.project_hash,
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
    expect(project.plan.contributors_bonus_pool).toBe('204231.6960 RUB')
    expect(project.plan.total).toBe('544703.6960 RUB')
  })

  it('стартовать проект на приём коммитов', async () => {
    const data: CapitalContract.Actions.StartProject.IStartProject = {
      coopname: 'voskhod',
      project_hash: componentProject.project_hash,
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
      componentProject.project_hash,
      componentProject.project_hash,
      3,
      'sha256',
    ))[0]
    expect(project).toBeDefined()
    expect(project.status).toBe('active')
  })

  it('добавить коммит создателя tester1 на 10 часов по 1000 RUB', async () => {
    const { finalProject, commitHash, commit } = await commitToResult(blockchain, 'voskhod', componentProject.project_hash, tester1, tester1CommitHours)
    commits.push(commitHash)

    console.log('commit: ', commit)
    console.log('project fact: ', finalProject.fact)
    expect(finalProject.fact.creators_hours).toBe(10)
    expect(finalProject.fact.creators_base_pool).toBe('10000.0000 RUB')
    expect(finalProject.fact.creators_bonus_pool).toBe('10000.0000 RUB')
    expect(finalProject.fact.authors_bonus_pool).toBe('6180.0000 RUB')
    expect(finalProject.fact.total_generation_pool).toBe('32360.0000 RUB')
    expect(finalProject.fact.contributors_bonus_pool).toBe('19998.4800 RUB')
    expect(finalProject.fact.total).toBe('52358.4800 RUB')
  })

  it('обновить CRPS и проверить распределение авторских наград после первого коммита', async () => {
    // Обновляем сегмент tester1 через CRPS
    const { prevSegment, updatedSegment } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester1)

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
    const { project, segment } = await addAuthor(blockchain, 'voskhod', componentProject.project_hash, tester2)

    console.log('segment tester2: ', segment)
    expect(segment).toBeDefined()
    expect(segment.username).toBe(tester2)
    expect(segment.project_hash).toBe(componentProject.project_hash)
    expect(segment.is_author).toBe(1)
    expect(segment.is_creator).toBe(0)
    expect(segment.is_coordinator).toBe(0)
    expect(segment.is_investor).toBe(0)
    expect(segment.is_contributor).toBe(0)
    expect(project).toBeDefined()
    expect(project.counts.total_authors).toBe(2) // Теперь у нас 2 автора
  })

  it('добавить коммит создателя tester2 на 20 часов по 1000 RUB', async () => {
    const { finalProject, commitHash, commit } = await commitToResult(blockchain, 'voskhod', componentProject.project_hash, tester2, tester2CommitHours)
    commits.push(commitHash)

    console.log('commit tester2: ', commit)
    console.log('project fact after tester2 commit: ', finalProject.fact)

    expect(commit.amounts.creators_base_pool).toBe('20000.0000 RUB')
    expect(commit.amounts.creators_bonus_pool).toBe('20000.0000 RUB')
    expect(commit.amounts.authors_bonus_pool).toBe('12360.0000 RUB')
    expect(commit.amounts.authors_base_pool).toBe('12360.0000 RUB')
    expect(commit.amounts.total_generation_pool).toBe('64720.0000 RUB')
    expect(commit.amounts.contributors_bonus_pool).toBe('39996.9600 RUB')
    expect(commit.amounts.total_contribution).toBe('104716.9600 RUB')

    // Проверяем накопительные значения после двух коммитов (10 + 20 = 30 часов)
    expect(finalProject.fact.creators_hours).toBe(30)
    expect(finalProject.fact.creators_base_pool).toBe('30000.0000 RUB')
    expect(finalProject.fact.creators_bonus_pool).toBe('30000.0000 RUB')
    expect(finalProject.fact.authors_bonus_pool).toBe('18540.0000 RUB')
    expect(finalProject.fact.total_generation_pool).toBe('97080.0000 RUB')
    expect(finalProject.fact.contributors_bonus_pool).toBe('59995.4400 RUB')
    expect(finalProject.fact.total).toBe('157075.4400 RUB')
  })

  it('обновить CRPS для обоих авторов и проверить распределение авторских наград', async () => {
    // Обновляем сегмент tester1 через CRPS
    await sleep(1000) // т.к. ранее мы делали обновление и будет дублирование - надо подождать
    const { prevSegment: prevTester1, updatedSegment: updatedTester1 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester1)
    // Обновляем сегмент tester2 через CRPS
    const { prevSegment: prevTester2, updatedSegment: updatedTester2 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester2)

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
      componentProject.project_hash,
      componentProject.project_hash,
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
    const segment1 = await getSegment(blockchain, 'voskhod', componentProject.project_hash, tester1)
    const segment2 = await getSegment(blockchain, 'voskhod', componentProject.project_hash, tester2)
    expect(segment1.is_author).toBe(1)
    expect(segment2.is_author).toBe(1)
    expect(segment1.is_creator).toBe(1)
    expect(segment2.is_creator).toBe(1)
  })

  it('открыть приём инвестиций', async () => {
    const data: CapitalContract.Actions.OpenProject.IOpenProject = {
      coopname: 'voskhod',
      project_hash: componentProject.project_hash,
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
      componentProject.project_hash,
      componentProject.project_hash,
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
    const { project, transactionId } = await investInProject(blockchain, 'voskhod', investor1, componentProject.project_hash, `${investAmount1}.0000 RUB`, fakeDocument)
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

    const { prevSegment: prevTester1, updatedSegment: updatedTester1 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester1)
    const { prevSegment: prevTester2, updatedSegment: updatedTester2 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester2)
    const { prevSegment: prevInvestor1, updatedSegment: updatedInvestor1 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, investor1)

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
    const { finalProject, commitHash, commit } = await commitToResult(blockchain, 'voskhod', componentProject.project_hash, tester3, tester3CommitHours)
    commits.push(commitHash)

    console.log('commit tester3: ', commit)
    console.log('project fact after tester3 commit: ', finalProject.fact)

    expect(finalProject.fact.creators_hours).toBe(130)
    expect(finalProject.fact.creators_base_pool).toBe('130000.0000 RUB')
    expect(finalProject.fact.creators_bonus_pool).toBe('130000.0000 RUB')
    expect(finalProject.fact.authors_base_pool).toBe('80340.0000 RUB')
    expect(finalProject.fact.authors_bonus_pool).toBe('80340.0000 RUB')
    expect(finalProject.fact.total_generation_pool).toBe('420680.0000 RUB')
    expect(finalProject.fact.contributors_bonus_pool).toBe('259980.2400 RUB')
    expect(finalProject.fact.total).toBe('680660.2400 RUB')

    expect(parseFloat(finalProject.fact.use_invest_percent)).toBeCloseTo(100, 1)
    expect(parseFloat(finalProject.fact.return_base_percent)).toBeCloseTo(42.78, 1)

    await sleep(1000)
    // Проверяем сегменты
    const { prevSegment: prevTester1, updatedSegment: updatedTester1 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester1)
    const { prevSegment: prevTester2, updatedSegment: updatedTester2 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester2)
    const { prevSegment: prevInvestor1, updatedSegment: updatedInvestor1 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, investor1)

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
    const { project, prevProject, transactionId } = await investInProject(blockchain, 'voskhod', investor2, componentProject.project_hash, `${investAmount2}.0000 RUB`, fakeDocument)
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
    const { prevSegment: prevTester4, updatedSegment: updatedTester4 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester4)
    expect(updatedTester4.provisional_amount).toBe('523.3133 RUB')
    expect(updatedTester4.coordinator_base).toBe('961.5384 RUB')
    expect(updatedTester4.is_coordinator).toBe(1)
    expect(updatedTester4.coordinator_investments).toBe('25000.0000 RUB')

    console.log('updatedTester4: ', updatedTester4)

    const { prevSegment: prevInvestor2, updatedSegment: updatedInvestor2 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, investor2)
    console.log('updatedInvestor2: ', updatedInvestor2)
    expect(updatedInvestor2.provisional_amount).toBe('0.0000 RUB')
    expect(updatedInvestor2.investor_base).toBe('25000.0000 RUB')
    expect(updatedInvestor2.investor_amount).toBe('25000.0000 RUB')
  })

  it('инвестировать в проект аккаунтом investor3 еще на 25000 RUB с координатором tester5', async () => {
    fakeDocument.signatures[0].signer = investor3
    const { project, prevProject, transactionId } = await investInProject(blockchain, 'voskhod', investor3, componentProject.project_hash, `${investAmount3}.0000 RUB`, fakeDocument)
    expect(project).toBeDefined()
    expect(transactionId).toBeDefined()
    // console.log('prevProject: ', prevProject)
    console.log('project: ', project)
    expect(project.counts.total_coordinators).toBe(2)
    expect(project.fact.coordinators_investment_pool).toBe('50000.0000 RUB')
    expect(project.fact.coordinators_base_pool).toBe('1923.0768 RUB')
    expect(project.fact.total_received_investments).toBe('150000.0000 RUB')
    expect(parseFloat(project.fact.return_base_percent)).toBeCloseTo(65.9558, 1)
    expect(parseFloat(project.fact.use_invest_percent)).toBeCloseTo(100, 1)

    const { prevSegment: prevTester5, updatedSegment: updatedTester5 } = await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester5)
    // console.log('updatedTester5: ', updatedTester5)
    expect(updatedTester5.provisional_amount).toBe('634.1912 RUB')
    expect(updatedTester5.coordinator_base).toBe('961.5384 RUB')
    expect(updatedTester5.is_coordinator).toBe(1)
    expect(updatedTester5.coordinator_investments).toBe('25000.0000 RUB')
  })

  it(`берем ссуду на 10000 RUB от tester1`, async () => {
    // Обновляем сегмент перед получением ссуды
    await sleep(1000)
    await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester1)
    const repaidAtDate = new Date()
    repaidAtDate.setDate(repaidAtDate.getDate() + 30)

    // Процессим полный цикл получения долга
    const debtResult = await processDebt(
      blockchain,
      'voskhod',
      tester1,
      componentProject.project_hash,
      '10000.0000 RUB',
      fakeDocument,
      repaidAtDate,
    )
    // Сохраняем хэш долга для последующего использования
    userDebtHashes[tester1].push(debtResult.debtHash)

    // Проверяем что debt_amount увеличился на 10000.0000 RUB в сегменте
    expect(debtResult.segmentAfter.debt_amount).toBe('10000.0000 RUB')

    // Проверяем что debt_amount увеличился у контрибьютора
    expect(debtResult.contributorAfter.debt_amount).toBe('10000.0000 RUB')

    console.log(`✅ Долг на 10000.0000 RUB успешно получен пользователем ${tester1}`)
  })

  it('внести имущество на 10000 RUB в проект от tester4', async () => {
    const data: CapitalContract.Actions.CreateProjectProperty.ICreateProjectProperty = {
      coopname: 'voskhod',
      username: tester4,
      project_hash: componentProject.project_hash,
      property_hash: generateRandomSHA256(),
      property_amount: '10000.0000 RUB',
      property_description: generateRandomPropertyDescription(),
    }

    const res = await processCreateProjectProperty(blockchain, data)
    const prevTotalCost = parseFloat(res.segmentBefore.total_segment_cost)

    expect(res.segmentAfter.total_segment_cost).not.toBe(res.segmentBefore.total_segment_cost)
    expect(parseFloat(res.segmentAfter.total_segment_cost)).toBeGreaterThan(prevTotalCost)

    // Проверяем точное приращение
    const prevContributedAsPropertor = parseFloat(res.segmentBefore.property_base.split(' ')[0])
    const afterContributedAsPropertor = parseFloat(res.segmentAfter.property_base.split(' ')[0])
    expect(afterContributedAsPropertor).toBe(prevContributedAsPropertor + 10000)

    const programWalletBefore = await getCoopProgramWallet(blockchain, 'voskhod', capitalProgramId)
  })

  it('внести программный имущественный взнос на 10000 RUB от tester5 и проверить точное приращение блокированных средств и паевого фонда', async () => {
    const programWalletBefore = await getCoopProgramWallet(blockchain, 'voskhod', capitalProgramId)
    const ledgerShareBefore = await getLedgerAccountById(blockchain, 'voskhod', circulationAccountId)

    const data: CapitalContract.Actions.CreateProgramProperty.ICreateProgramProperty = {
      coopname: 'voskhod',
      username: tester5,
      property_hash: generateRandomSHA256(),
      property_amount: '10000.0000 RUB',
      property_description: generateRandomPropertyDescription(),
      statement: fakeDocument,
    }

    // добавляем в ожидаемую общую сумму программы капитализации
    totalToCapitalConvertAmount += parseFloat(data.property_amount.split(' ')[0])

    const res = await processCreateProgramProperty(blockchain, data, fakeDocument)
    expect(res.txCreateId).toBeDefined()
    expect(res.txAct1Id).toBeDefined()
    expect(res.txAct2Id).toBeDefined()

    // Логирование состояний до/после
    // console.log('Program wallet before:', res.programWalletBefore)
    // console.log('Program wallet after:', res.programWalletAfter)
    // console.log('Ledger share before:', res.ledgerShareBefore)
    // console.log('Ledger share after:', res.ledgerShareAfter)

    // Проверяем точное приращение: блокированные средства программы +10000.0000 RUB
    const prevBlocked = parseFloat(res.programWalletBefore.blocked.split(' ')[0])
    const afterBlocked = parseFloat(res.programWalletAfter.blocked.split(' ')[0])
    expect(afterBlocked).toBe(prevBlocked + 10000)

    // Проверяем точное приращение: паевой фонд в бухгалтерии +10000.0000 RUB
    const prevAvailable = parseFloat(res.ledgerShareBefore.available.split(' ')[0])
    const afterAvailable = parseFloat(res.ledgerShareAfter.available.split(' ')[0])
    expect(afterAvailable).toBe(prevAvailable + 10000)
  })

  it('внести проектный имущественный взнос на 10000 RUB от tester5 и проверить точное приращение в сегменте проекта', async () => {
    const data: CapitalContract.Actions.CreateProjectProperty.ICreateProjectProperty = {
      coopname: 'voskhod',
      username: tester5,
      property_hash: generateRandomSHA256(),
      property_amount: '10000.0000 RUB',
      property_description: generateRandomPropertyDescription(),
      project_hash: componentProject.project_hash,
    }

    const res = await processCreateProjectProperty(blockchain, data)
    expect(res.txCreateId).toBeDefined()

    // Логирование состояний до/после
    // console.log('Segment before:', res.segmentBefore)
    // console.log('Segment after:', res.segmentAfter)
    // console.log('Project before:', res.projectBefore)
    // console.log('Project after:', res.projectAfter)

    // Проверяем точное приращение: имущественный взнос в сегменте +10000.0000 RUB
    const prevProperty = parseFloat(res.segmentBefore.property_base.split(' ')[0])
    const afterProperty = parseFloat(res.segmentAfter.property_base.split(' ')[0])
    expect(afterProperty).toBe(prevProperty + 10000)

    // Проверяем точное приращение: общая стоимость сегмента +10000.0000 RUB
    const prevTotal = parseFloat(res.segmentBefore.total_segment_cost.split(' ')[0])
    const afterTotal = parseFloat(res.segmentAfter.total_segment_cost.split(' ')[0])
    expect(afterTotal).toBe(prevTotal + 10000)

    // Проверяем точное приращение: имущественная база проекта +10000.0000 RUB
    const prevPropertyBase = parseFloat(res.projectBefore.fact.property_base_pool.split(' ')[0])
    const afterPropertyBase = parseFloat(res.projectAfter.fact.property_base_pool.split(' ')[0])
    expect(afterPropertyBase).toBe(prevPropertyBase + 10000)
    expect(afterPropertyBase).toBe(20000)
  })

  it(`берем ссуду координатору 100 RUB от tester4`, async () => {
    // Обновляем сегмент перед получением ссуды
    await sleep(1000)
    await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester4)
    const repaidAtDate = new Date()
    repaidAtDate.setDate(repaidAtDate.getDate() + 30)

    // Процессим полный цикл получения долга
    const debtResult = await processDebt(
      blockchain,
      'voskhod',
      tester4,
      componentProject.project_hash,
      '100.0000 RUB',
      fakeDocument,
      repaidAtDate,
    )

    // Сохраняем хэш долга для последующего использования
    userDebtHashes[tester4].push(debtResult.debtHash)

    // Проверяем что debt_amount увеличился на 100 RUB в сегменте
    expect(debtResult.segmentAfter.debt_amount).toBe('100.0000 RUB')

    // Проверяем что debt_amount увеличился у контрибьютора
    expect(debtResult.contributorAfter.debt_amount).toBe('100.0000 RUB')

    // Проверяем что долг перешел в статус 'paid' (готов к использованию/погашению)
    expect(debtResult.debtAfter.status).toBe('paid')

    console.log('debtResult tester4: ', debtResult)
    console.log(`Сохранен debt_hash для ${tester4}:`, debtResult.debtHash)

    console.log(`✅ Долг на 100 RUB успешно получен пользователем ${tester4}`)
  })

  it(`берем ссуду создателю 200 RUB от tester1`, async () => {
    // Обновляем сегмент перед получением ссуды
    await sleep(1000)
    await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester1)
    const repaidAtDate = new Date()
    repaidAtDate.setDate(repaidAtDate.getDate() + 30)

    // Процессим полный цикл получения долга
    const debtResult = await processDebt(
      blockchain,
      'voskhod',
      tester1,
      componentProject.project_hash,
      '200.0000 RUB',
      fakeDocument,
      repaidAtDate,
    )

    // Сохраняем хэш долга для последующего использования
    userDebtHashes[tester1].push(debtResult.debtHash)

    // Проверяем что debt_amount увеличился на 200 RUB в сегменте (плюс предыдущий долг 10000)
    expect(debtResult.segmentAfter.debt_amount).toBe('10200.0000 RUB')

    // Проверяем что debt_amount увеличился у контрибьютора
    expect(debtResult.contributorAfter.debt_amount).toBe('10200.0000 RUB')

    // Проверяем что долг перешел в статус 'paid' (готов к использованию/погашению)
    expect(debtResult.debtAfter.status).toBe('paid')

    console.log('debtResult tester1: ', debtResult)
    console.log(`Сохранен debt_hash для ${tester1}:`, debtResult.debtHash)

    console.log(`✅ Долг на 200 RUB успешно получен пользователем ${tester1}`)
  })

  it(`берем ссуду создателю 150 RUB от tester2`, async () => {
    // Обновляем сегмент перед получением ссуды
    await sleep(1000)
    await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester2)
    const repaidAtDate = new Date()
    repaidAtDate.setDate(repaidAtDate.getDate() + 30)

    // Процессим полный цикл получения долга
    const debtResult = await processDebt(
      blockchain,
      'voskhod',
      tester2,
      componentProject.project_hash,
      '150.0000 RUB',
      fakeDocument,
      repaidAtDate,
    )

    // Сохраняем хэш долга для последующего использования
    userDebtHashes[tester2].push(debtResult.debtHash)

    // Проверяем что debt_amount увеличился на 150 RUB в сегменте
    expect(debtResult.segmentAfter.debt_amount).toBe('150.0000 RUB')

    // Проверяем что debt_amount увеличился у контрибьютора
    expect(debtResult.contributorAfter.debt_amount).toBe('150.0000 RUB')

    // Проверяем что долг перешел в статус 'paid' (готов к использованию/погашению)
    expect(debtResult.debtAfter.status).toBe('paid')

    console.log('debtResult tester2: ', debtResult)
    console.log(`Сохранен debt_hash для ${tester2}:`, debtResult.debtHash)

    console.log(`✅ Долг на 150 RUB успешно получен пользователем ${tester2}`)
  })

  it(`берем ссуду создателю 250 RUB от tester3`, async () => {
    // Обновляем сегмент перед получением ссуды
    await sleep(1000)
    await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, tester3)
    const repaidAtDate = new Date()
    repaidAtDate.setDate(repaidAtDate.getDate() + 30)

    // Процессим полный цикл получения долга
    const debtResult = await processDebt(
      blockchain,
      'voskhod',
      tester3,
      componentProject.project_hash,
      '250.0000 RUB',
      fakeDocument,
      repaidAtDate,
    )

    // Сохраняем хэш долга для последующего использования
    userDebtHashes[tester3].push(debtResult.debtHash)

    // Проверяем что debt_amount увеличился на 250 RUB в сегменте
    expect(debtResult.segmentAfter.debt_amount).toBe('250.0000 RUB')

    // Проверяем что debt_amount увеличился у контрибьютора
    expect(debtResult.contributorAfter.debt_amount).toBe('250.0000 RUB')

    // Проверяем что долг перешел в статус 'paid' (готов к использованию/погашению)
    expect(debtResult.debtAfter.status).toBe('paid')

    console.log('debtResult tester3: ', debtResult)
    console.log(`Сохранен debt_hash для ${tester3}:`, debtResult.debtHash)

    console.log(`✅ Долг на 250 RUB успешно получен пользователем ${tester3}`)
  })

  it('начать голосование по проекту и проверить изменение статуса с active на voting', async () => {
    const data: CapitalContract.Actions.StartVoting.IStartVoting = {
      coopname: 'voskhod',
      project_hash: componentProject.project_hash,
    }

    const res = await processStartVoting(blockchain, data)
    expect(res.txStartId).toBeDefined()

    // Проверяем изменение статуса проекта с 'active' на 'voting'
    expect(res.projectBefore.status).toBe('active')
    expect(res.projectAfter.status).toBe('voting')

    // Проверяем что данные голосования инициализированы
    expect(res.projectAfter.voting.authors_voting_percent).toBeCloseTo(38.2, 10)
    expect(res.projectAfter.voting.creators_voting_percent).toBeCloseTo(38.2, 10)
    expect(res.projectAfter.voting.amounts.authors_equal_spread).toBe('49650.1200 RUB')
    expect(res.projectAfter.voting.amounts.creators_direct_spread).toBe('80340.0000 RUB')
    expect(res.projectAfter.voting.total_voters).toBe(3)
    expect(res.projectAfter.voting.votes_received).toBe(0)

    expect(parseFloat(res.projectAfter.fact.creators_bonus_pool)).toBeCloseTo(parseFloat(res.projectAfter.voting.amounts.creators_direct_spread) + parseFloat(res.projectAfter.voting.amounts.creators_bonuses_on_voting), 10)

    expect(parseFloat(res.projectAfter.fact.authors_bonus_pool)).toBeCloseTo(parseFloat(res.projectAfter.voting.amounts.authors_equal_spread) + parseFloat(res.projectAfter.voting.amounts.authors_bonuses_on_voting), 10)

    expect(res.projectAfter.voting.amounts.authors_equal_per_author).toBe('24825.0600 RUB')

    expect(parseFloat(res.projectAfter.voting.amounts.total_voting_pool)).toBeCloseTo(parseFloat(res.projectAfter.voting.amounts.creators_bonuses_on_voting) + parseFloat(res.projectAfter.voting.amounts.authors_bonuses_on_voting), 10)

    expect(res.projectAfter.voting.amounts.total_voting_pool).toBe('80349.8800 RUB')
    expect(res.projectAfter.voting.amounts.active_voting_amount).toBe('53566.5866 RUB')
  })

  it('голосовать аккаунтом tester1', async () => {
    const voters = [tester1, tester2, tester3]

    // Получаем текущий проект для получения active_voting_amount
    const currentProject = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      componentProject.project_hash,
      componentProject.project_hash,
      3,
      'sha256',
    ))[0]

    const votingAmount = currentProject.voting.amounts.active_voting_amount
    console.log('Голосующая сумма для распределения:', votingAmount)

    // Создаем список получателей - все кроме голосующего
    const recipients = voters.filter(v => v !== tester1)
    const voteDistribution = createVoteDistribution(recipients, tester1, votingAmount)

    const result = await submitVote(
      blockchain,
      'voskhod',
      tester1,
      componentProject.project_hash,
      voteDistribution,
    )

    // Проверяем что транзакция прошла успешно
    expect(result.txId).toBeDefined()

    // Проверяем увеличение количества голосов в проекте
    expect(result.projectAfter.voting.votes_received).toBe(result.projectBefore.voting.votes_received + 1)

    // Проверяем что новые голоса появились в таблице
    expect(result.votesAfter.length).toBe(result.votesBefore.length + 2)

    // Проверяем что у участника раньше не было голосов, а теперь есть
    expect(result.voterVotesBefore.length).toBe(0)
    expect(result.voterVotesAfter.length).toBe(2)

    console.log('VOTING RESULT tester1: ', result)

    // Проверяем что голоса соответствуют ожидаемому распределению
    result.voterVotesAfter.forEach((vote: any) => {
      expect(vote.voter).toBe(tester1)
      expect(vote.project_hash).toBe(componentProject.project_hash)
      const expectedVote = result.voteInput.find(v => v.recipient === vote.recipient)
      expect(expectedVote).toBeDefined()
      expect(vote.amount).toBe(expectedVote!.amount)
    })
  })

  it('голосовать аккаунтом tester2', async () => {
    const voters = [tester1, tester2, tester3]

    // Получаем текущий проект для получения active_voting_amount
    const currentProject = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      componentProject.project_hash,
      componentProject.project_hash,
      3,
      'sha256',
    ))[0]

    const votingAmount = currentProject.voting.amounts.active_voting_amount

    // Создаем список получателей - все кроме голосующего
    const recipients = voters.filter(v => v !== tester2)
    const voteDistribution = createVoteDistribution(recipients, tester2, votingAmount)

    const result = await submitVote(
      blockchain,
      'voskhod',
      tester2,
      componentProject.project_hash,
      voteDistribution,
    )
    console.log('VOTING RESULT tester2: ', result)
    expect(result.txId).toBeDefined()
    expect(result.projectAfter.voting.votes_received).toBe(result.projectBefore.voting.votes_received + 1)
    expect(result.votesAfter.length).toBe(result.votesBefore.length + 2)
    expect(result.voterVotesBefore.length).toBe(0)
    expect(result.voterVotesAfter.length).toBe(2)
  })

  it('голосовать аккаунтом tester3', async () => {
    const voters = [tester1, tester2, tester3]

    // Получаем текущий проект для получения active_voting_amount
    const currentProject = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'projects',
      1,
      componentProject.project_hash,
      componentProject.project_hash,
      3,
      'sha256',
    ))[0]

    const votingAmount = currentProject.voting.amounts.active_voting_amount

    // Создаем список получателей - все кроме голосующего
    const recipients = voters.filter(v => v !== tester3)
    const voteDistribution = createVoteDistribution(recipients, tester3, votingAmount)

    const result = await submitVote(
      blockchain,
      'voskhod',
      tester3,
      componentProject.project_hash,
      voteDistribution,
    )

    console.log('VOTING RESULT tester3: ', result)

    expect(result.txId).toBeDefined()
    expect(result.projectAfter.voting.votes_received).toBe(result.projectBefore.voting.votes_received + 1)
    expect(result.votesAfter.length).toBe(result.votesBefore.length + 2)
    expect(result.voterVotesBefore.length).toBe(0)
    expect(result.voterVotesAfter.length).toBe(2)
  })

  it('завершаем голосование и проверяем изменение статуса проекта с voting на completed', async () => {
    const data: CapitalContract.Actions.CompleteVoting.ICompleteVoting = {
      coopname: 'voskhod',
      project_hash: componentProject.project_hash,
    }

    const result = await processCompleteVoting(blockchain, data)

    expect(result.txId).toBeDefined()
    expect(result.projectBefore.status).toBe('voting')
    expect(result.projectAfter.status).toBe('result')
  })

  it('рассчитываем голоса для участника tester1', async () => {
    const data: CapitalContract.Actions.CalculateVotes.IFinalVoting = {
      coopname: 'voskhod',
      username: tester1,
      project_hash: componentProject.project_hash,
    }

    const result = await processCalculateVotes(blockchain, data)
    expect(parseFloat(result.segmentAfter.voting_bonus)).toBeCloseTo(parseFloat(result.projectAfter.voting.amounts.equal_voting_amount), 2)
    expect(parseFloat(result.segmentAfter.voting_bonus)).toBeCloseTo(parseFloat(result.projectAfter.voting.amounts.total_voting_pool) / 3, 2)

    expect(result.txId).toBeDefined()
  })

  it('рассчитываем голоса для участника tester2', async () => {
    const data: CapitalContract.Actions.CalculateVotes.IFinalVoting = {
      coopname: 'voskhod',
      username: tester2,
      project_hash: componentProject.project_hash,
    }

    const result = await processCalculateVotes(blockchain, data)
    expect(parseFloat(result.segmentAfter.voting_bonus)).toBeCloseTo(parseFloat(result.projectAfter.voting.amounts.equal_voting_amount), 2)
    expect(parseFloat(result.segmentAfter.voting_bonus)).toBeCloseTo(parseFloat(result.projectAfter.voting.amounts.total_voting_pool) / 3, 2)

    expect(result.txId).toBeDefined()
  })

  it('рассчитываем голоса для участника tester3', async () => {
    const data: CapitalContract.Actions.CalculateVotes.IFinalVoting = {
      coopname: 'voskhod',
      username: tester3,
      project_hash: componentProject.project_hash,
    }

    const result = await processCalculateVotes(blockchain, data)
    expect(parseFloat(result.segmentAfter.voting_bonus)).toBeCloseTo(parseFloat(result.projectAfter.voting.amounts.equal_voting_amount), 2)
    expect(parseFloat(result.segmentAfter.voting_bonus)).toBeCloseTo(parseFloat(result.projectAfter.voting.amounts.total_voting_pool) / 3, 2)

    expect(result.txId).toBeDefined()
  })

  it('вносим результаты в кооператив для участников с интеллектуальными ролями', async () => {
    // Список участников с интеллектуальными ролями (НЕ чистые инвесторы)
    // Чистые инвесторы (investor1-3) НЕ вносят результат через pushrslt
    const participantsWithIntellectualRoles = [tester1, tester2, tester3, tester4, tester5]

    for (const participant of participantsWithIntellectualRoles) {
      // Обновляем сегмент
      await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, participant)
      // Получаем сегмент участника для определения сумм
      const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, participant)
      const contributionAmount = segment.total_segment_cost
      const debtAmount = segment.debt_amount

      console.log(`Сегмент ${participant} до внесения результата:`, segment)
      console.log(`Сумма взноса: ${contributionAmount}, Сумма долга: ${debtAmount}`)
      console.log(`Хэши долгов для погашения:`, userDebtHashes[participant])

      const result = await processPushResult(
        blockchain,
        'voskhod',
        participant,
        componentProject.project_hash,
        contributionAmount,
        debtAmount,
        userDebtHashes[participant], // Передаем вектор хэшей долгов
      )

      expect(result.transactionId).toBeDefined()
      expect(result.segmentBefore.status).toBe('ready')
      expect(result.segmentAfter.status).toBe('contributed')

      console.log(`✅ Результат внесен в кооператив для ${participant}`)
    }
  })

  it('конвертируем сегмент tester1 в главный кошелек и программу капитализации', async () => {
    // Получаем сегмент tester1 для определения доступных сумм
    const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, tester1)
    console.log(`Сегмент tester1 перед конвертацией:`, segment)

    // Рассчитываем суммы для конвертации динамически
    const provisionalAmount = parseFloat(segment.provisional_amount.split(' ')[0])
    const debtAmount = parseFloat(segment.debt_amount.split(' ')[0])
    const totalSegmentCost = parseFloat(segment.total_segment_cost.split(' ')[0])

    const walletAmountValue = provisionalAmount - debtAmount
    const capitalAmountValue = totalSegmentCost - debtAmount - walletAmountValue

    const walletAmount = `${walletAmountValue.toFixed(4)} RUB`
    const capitalAmount = `${capitalAmountValue.toFixed(4)} RUB`
    const projectAmount = '0.0000 RUB'

    console.log(`Конвертация tester1: кошелек=${walletAmount}, капитализация=${capitalAmount}, проект=${projectAmount}`)

    totalToCapitalConvertAmount += parseFloat(capitalAmount.split(' ')[0])
    totalToProjectConvertAmount += parseFloat(projectAmount.split(' ')[0])
    const result = await processConvertSegment(
      blockchain,
      'voskhod',
      tester1,
      componentProject.project_hash,
      walletAmount,
      capitalAmount,
      projectAmount,
    )

    expect(result.transactionId).toBeDefined()
    expect(result.segmentBefore.status).toBe('contributed')
    expect(result.segmentAfter).toBeUndefined()

    console.log(`✅ Сегмент ${tester1} конвертирован`)
  })

  it('конвертируем сегмент tester2 в проект и программу капитализации', async () => {
    // Получаем сегмент tester2 для определения доступных сумм
    const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, tester2)
    console.log(`Сегмент tester2 перед конвертацией:`, segment)

    // Конвертируем все доступные средства в проект
    const availableAmount = parseFloat(segment.total_segment_base_cost.split(' ')[0]) - parseFloat(segment.debt_amount.split(' ')[0])
    const walletAmount = '0.0000 RUB'
    const capitalAmount = `${parseFloat(segment.total_segment_cost.split(' ')[0]) - parseFloat(segment.debt_amount) - availableAmount} RUB`
    const projectAmount = `${availableAmount.toFixed(4)} RUB`
    totalToCapitalConvertAmount += parseFloat(capitalAmount.split(' ')[0])
    totalToProjectConvertAmount += parseFloat(projectAmount.split(' ')[0])
    console.log(`Конвертация tester2: только в проект=${projectAmount}`)

    const result = await processConvertSegment(
      blockchain,
      'voskhod',
      tester2,
      componentProject.project_hash,
      walletAmount,
      capitalAmount,
      projectAmount,
    )

    expect(result.transactionId).toBeDefined()
    expect(result.segmentBefore.status).toBe('contributed')
    expect(result.segmentAfter).toBeUndefined()

    console.log(`✅ Сегмент ${tester2} конвертирован в проект`)
  })

  it('конвертируем сегмент tester3 в капитализацию', async () => {
    // Получаем сегмент tester3 для определения доступных сумм
    const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, tester3)
    console.log(`Сегмент tester3 перед конвертацией:`, segment)

    // Конвертируем все доступные средства в капитализацию
    const availableAmount = parseFloat(segment.total_segment_cost.split(' ')[0]) - parseFloat(segment.debt_amount.split(' ')[0])
    const walletAmount = '0.0000 RUB'
    const capitalAmount = `${availableAmount.toFixed(4)} RUB`
    const projectAmount = '0.0000 RUB'

    console.log(`Конвертация tester3: только в капитализацию=${capitalAmount}`)

    totalToCapitalConvertAmount += parseFloat(capitalAmount.split(' ')[0])
    totalToProjectConvertAmount += parseFloat(projectAmount.split(' ')[0])
    const result = await processConvertSegment(
      blockchain,
      'voskhod',
      tester3,
      componentProject.project_hash,
      walletAmount,
      capitalAmount,
      projectAmount,
    )

    expect(result.transactionId).toBeDefined()
    expect(result.segmentBefore.status).toBe('contributed')
    expect(result.segmentAfter).toBeUndefined()

    console.log(`✅ Сегмент ${tester3} конвертирован в капитализацию`)
  })

  it('конвертируем сегмент tester4 в капитализацию', async () => {
    // Получаем сегмент tester4 для определения доступных сумм
    const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, tester4)
    console.log(`Сегмент tester4 перед конвертацией:`, segment)

    // Конвертируем в разные направления
    const availableAmount = parseFloat(segment.total_segment_cost.split(' ')[0]) - parseFloat(segment.debt_amount.split(' ')[0])
    const walletAmount = '0.0000 RUB'
    const capitalAmount = `${availableAmount.toFixed(4)} RUB`
    const projectAmount = '0.0000 RUB'

    console.log(`Конвертация tester4: кошелек=${walletAmount}, капитализация=${capitalAmount}, проект=${projectAmount}`)

    totalToCapitalConvertAmount += parseFloat(capitalAmount.split(' ')[0])
    totalToProjectConvertAmount += parseFloat(projectAmount.split(' ')[0])
    const result = await processConvertSegment(
      blockchain,
      'voskhod',
      tester4,
      componentProject.project_hash,
      walletAmount,
      capitalAmount,
      projectAmount,
    )

    expect(result.transactionId).toBeDefined()
    expect(result.segmentBefore.status).toBe('contributed')
    expect(result.segmentAfter).toBeUndefined()

    console.log(`✅ Сегмент ${tester4} конвертирован в смешанные направления`)
  })

  it('конвертируем сегмент tester5 в капитализацию', async () => {
    // Получаем сегмент tester5 для определения доступных сумм
    const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, tester5)
    console.log(`Сегмент tester5 перед конвертацией:`, segment)

    // Конвертируем все доступные средства в капитализацию
    const availableAmount = parseFloat(segment.total_segment_cost.split(' ')[0]) - parseFloat(segment.debt_amount.split(' ')[0])
    const walletAmount = '0.0000 RUB'
    const capitalAmount = `${availableAmount.toFixed(4)} RUB`
    const projectAmount = '0.0000 RUB'

    console.log(`Конвертация tester5: кошелек=${walletAmount}, капитализация=${capitalAmount}, проект=${projectAmount}`)

    totalToCapitalConvertAmount += parseFloat(capitalAmount.split(' ')[0])
    totalToProjectConvertAmount += parseFloat(projectAmount.split(' ')[0])
    const result = await processConvertSegment(
      blockchain,
      'voskhod',
      tester5,
      componentProject.project_hash,
      walletAmount,
      capitalAmount,
      projectAmount,
    )

    expect(result.transactionId).toBeDefined()
    expect(result.segmentBefore.status).toBe('contributed')
    expect(result.segmentAfter).toBeUndefined()

    console.log(`✅ Сегмент ${tester5} конвертирован в капитализацию`)
  })

  it('конвертируем сегмент investor1 в капитализацию', async () => {
    // Обновляем сегмент инвестора перед конвертацией
    await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, investor1)

    // Получаем сегмент investor1 для определения доступных сумм
    const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, investor1)
    console.log(`Сегмент investor1 перед конвертацией:`, segment)

    // Конвертируем все доступные средства в капитализацию
    const availableAmount = parseFloat(segment.total_segment_cost.split(' ')[0]) - parseFloat(segment.debt_amount.split(' ')[0])
    const walletAmount = '0.0000 RUB'
    const capitalAmount = `${availableAmount.toFixed(4)} RUB`
    const projectAmount = '0.0000 RUB'

    console.log(`Конвертация investor1: кошелек=${walletAmount}, капитализация=${capitalAmount}, проект=${projectAmount}`)

    totalToCapitalConvertAmount += parseFloat(capitalAmount.split(' ')[0])
    totalToProjectConvertAmount += parseFloat(projectAmount.split(' ')[0])
    const result = await processConvertSegment(
      blockchain,
      'voskhod',
      investor1,
      componentProject.project_hash,
      walletAmount,
      capitalAmount,
      projectAmount,
    )

    expect(result.transactionId).toBeDefined()
    expect(result.segmentBefore.status).toBe('ready')
    expect(result.segmentAfter).toBeUndefined()

    console.log(`✅ Сегмент ${investor1} конвертирован в капитализацию`)
  })

  it('конвертируем сегмент investor2 в проект', async () => {
    // Обновляем сегмент инвестора перед конвертацией
    await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, investor2)

    // Получаем сегмент investor2 для определения доступных сумм
    const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, investor2)
    console.log(`Сегмент investor2 перед конвертацией:`, segment)

    // Конвертируем все доступные средства в проект
    const availableAmount = parseFloat(segment.total_segment_cost.split(' ')[0]) - parseFloat(segment.debt_amount.split(' ')[0])
    const walletAmount = '0.0000 RUB'
    const capitalAmount = '0.0000 RUB'
    const projectAmount = `${availableAmount.toFixed(4)} RUB`

    console.log(`Конвертация investor2: кошелек=${walletAmount}, капитализация=${capitalAmount}, проект=${projectAmount}`)

    totalToCapitalConvertAmount += parseFloat(capitalAmount.split(' ')[0])
    totalToProjectConvertAmount += parseFloat(projectAmount.split(' ')[0])

    const result = await processConvertSegment(
      blockchain,
      'voskhod',
      investor2,
      componentProject.project_hash,
      walletAmount,
      capitalAmount,
      projectAmount,
    )

    expect(result.transactionId).toBeDefined()
    expect(result.segmentBefore.status).toBe('ready')
    expect(result.segmentAfter).toBeUndefined()

    console.log(`✅ Сегмент ${investor2} конвертирован в проект`)
  })

  it('конвертируем сегмент investor3 в капитализацию', async () => {
    // Обновляем сегмент инвестора перед конвертацией
    await refreshSegment(blockchain, 'voskhod', componentProject.project_hash, investor3)

    // Получаем сегмент investor3 для определения доступных сумм
    const segment = await getSegment(blockchain, 'voskhod', componentProject.project_hash, investor3)
    console.log(`Сегмент investor3 перед конвертацией:`, segment)

    // Конвертируем все доступные средства в капитализацию
    const availableAmount = parseFloat(segment.total_segment_cost.split(' ')[0]) - parseFloat(segment.debt_amount.split(' ')[0])
    const walletAmount = '0.0000 RUB'
    const capitalAmount = `${availableAmount.toFixed(4)} RUB`
    const projectAmount = '0.0000 RUB'

    console.log(`Конвертация investor3: кошелек=${walletAmount}, капитализация=${capitalAmount}, проект=${projectAmount}`)

    totalToCapitalConvertAmount += parseFloat(capitalAmount.split(' ')[0])
    totalToProjectConvertAmount += parseFloat(projectAmount.split(' ')[0])
    const result = await processConvertSegment(
      blockchain,
      'voskhod',
      investor3,
      componentProject.project_hash,
      walletAmount,
      capitalAmount,
      projectAmount,
    )

    expect(result.transactionId).toBeDefined()
    expect(result.segmentBefore.status).toBe('ready')
    expect(result.segmentAfter).toBeUndefined()

    console.log(`✅ Сегмент ${investor3} конвертирован в капитализацию`)
  })

  // Продолжение тестирования мета-проектов и компонент-проектов

  it('проверяем что вся сумма конвертаций в проект ушла в мета-проект', async () => {
    // Получаем состояние мета-проекта и проверяем что в него поступили средства из компонент-проекта

    const metaProjectState = await getProject(blockchain, 'voskhod', metaProject.project_hash)
    console.log('Состояние мета-проекта:', metaProjectState)

    const projectState = await getProject(blockchain, 'voskhod', componentProject.project_hash)
    console.log('Состояние компонент-проекта:', projectState)
    // tester2 конвертировал всё в проект, эта сумма должна была пойти в мета-проект
    expect(parseFloat(metaProjectState.membership.total_shares)).toBe(totalToProjectConvertAmount)
    expect(parseFloat(projectState.membership.total_shares)).toBe(0)

    console.log(`✅ Сумма конвертаций в проекте ушла в мета-проект: ${metaProjectState.membership.total_shares}`)
    console.log(`✅ Сумма конвертаций которая осталась в проекте-компоненте: ${projectState.membership.total_shares}`)
  })

  it('удаляем компонент-проект', async () => {
    const result = await processDeleteProject(blockchain, 'voskhod', componentProject.project_hash)

    expect(result.transactionId).toBeDefined()
    expect(result.projectBefore).toBeDefined()
    expect(result.projectAfter).toBeNull() // Проект должен быть удален

    console.log(`✅ Компонент-проект удален: ${componentProject.project_hash}`)
  })

  it('создаём новый компонент-проект', async () => {
    const newComponentHash = generateRandomSHA256()

    const newComponentData: CapitalContract.Actions.CreateProject.ICreateProject = {
      coopname: 'voskhod',
      project_hash: newComponentHash,
      parent_hash: metaProject.project_hash, // Родительский хэш указывает на мета-проект
      title: `Новый компонент-проект ${newComponentHash.slice(0, 10)}`,
      description: generateRandomDescription(),
      meta: generateRandomMeta(),
      invite: '',
      data: generateRandomProjectData(1200, 3000),
      can_convert_to_project: true,
    }

    newComponentProject = newComponentData

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
            data: newComponentData,
          },
        ],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      },
    )

    expect(result.transaction_id).toBeDefined()
    getTotalRamUsage(result)

    console.log(`✅ Создан новый компонент-проект: ${newComponentProject.project_hash}`)
  })

  it('подписываем новое приложение к договору УХД со множеством участников', async () => {
    // NOTE: При одобрении appendix председателем автоматически вызывается regshare
    // для всех участников с балансом капитализации, регистрируя их долю в проекте
    const testerNames = [tester1, tester2, tester3, tester4, tester5, investor1, investor2, investor3]
    for (const tester of testerNames) {
      const appendixHash = generateRandomSHA256()

      await signAppendix(blockchain, 'voskhod', tester, newComponentProject.project_hash, appendixHash)
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
      expect(contributor.appendixes).toContain(componentProject.project_hash)
      expect(contributor.status).toBe('active')
    }
  }, 1000_000)

  it('проверяем что вклады участников с балансом капитализации зарегистрированы автоматически', async () => {
    // Список всех участников, которые подписали appendix
    const allParticipants = [tester1, tester2, tester3, tester4, tester5, investor1, investor2, investor3]

    console.log('\n=== ДИАГНОСТИКА: Проверка балансов капитализации и сегментов ===\n')

    let totalCapitalBalances = 0
    let totalRegisteredInProject = 0
    const participantsWithCapital = []

    for (const participant of allParticipants) {
      // Проверяем баланс в программе капитализации
      const capitalWallet = await getUserProgramWalletAmount(blockchain, 'voskhod', participant, capitalProgramId)
      const capitalAmount = parseFloat(capitalWallet.split(' ')[0])

      console.log(`\n${participant}:`)
      console.log(`  - Баланс в программе капитализации: ${capitalWallet}`)

      if (capitalAmount > 0) {
        totalCapitalBalances += capitalAmount
        participantsWithCapital.push(participant)
      }

      // Проверяем сегмент в проекте
      try {
        const segment = await getSegment(blockchain, 'voskhod', newComponentProject.project_hash, participant)
        if (segment) {
          console.log(`  - Сегмент в проекте: ЕСТЬ`)
          console.log(`  - is_contributor: ${segment.is_contributor}`)
          console.log(`  - capital_contributor_shares: ${segment.capital_contributor_shares}`)

          if (segment.is_contributor) {
            const segmentCapital = parseFloat(segment.capital_contributor_shares.split(' ')[0])
            totalRegisteredInProject += segmentCapital

            // Проверяем что баланс в сегменте совпадает с балансом в программе
            if (capitalAmount > 0) {
              expect(segment.capital_contributor_shares).toBe(capitalWallet)
              console.log(`  ✅ Баланс в сегменте совпадает с балансом в программе`)
            }
          }
        }
      }
      catch (error) {
        console.log(`  - Сегмент в проекте: НЕТ`)
      }
    }

    console.log('\n=== ИТОГОВЫЕ СУММЫ ===')
    console.log(`Участники с балансом капитализации: ${participantsWithCapital.join(', ')}`)
    console.log(`Сумма балансов в программе капитализации: ${totalCapitalBalances.toFixed(4)} RUB`)
    console.log(`Сумма зарегистрированная в проекте: ${totalRegisteredInProject.toFixed(4)} RUB`)

    const projectState = await getProject(blockchain, 'voskhod', newComponentProject.project_hash)
    console.log(`Сумма в проекте (total_capital_contributors_shares): ${projectState.crps.total_capital_contributors_shares}`)

    const projectTotal = parseFloat(projectState.crps.total_capital_contributors_shares.split(' ')[0])
    console.log(`\nРасхождение: ${(projectTotal - totalCapitalBalances).toFixed(4)} RUB`)

    // Проверяем что сумма в проекте совпадает с суммой балансов участников
    expect(projectTotal).toBeCloseTo(totalCapitalBalances, 4)

    // Проверяем что зарегистрированы все участники с балансом капитализации
    expect(participantsWithCapital.length).toBe(7)
    expect(projectTotal).toBe(485044.9701)

    console.log(`✅ Все ${participantsWithCapital.length} вкладчиков зарегистрированы корректно, общая сумма: ${projectTotal.toFixed(4)} RUB`)
  })

  it.skip('проверяем что повторная регистрация вкладчика невозможна', async () => {
    await sleep(1000)
    // NOTE: Тест пропущен - ручная регистрация через processAddContributor больше не используется
    // Регистрация теперь происходит автоматически при одобрении допуска председателем
    console.log('Тест пропущен: ручная регистрация через processAddContributor больше не используется')
  })

  it('добавляем мастера к новому проекту', async () => {
    const data: CapitalContract.Actions.SetMaster.ISetMaster = {
      coopname: 'voskhod',
      project_hash: newComponentProject.project_hash,
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

    const project = await getProject(blockchain, 'voskhod', newComponentProject.project_hash)
    expect(project.master).toBe(tester1)

    const segment = await getSegment(blockchain, 'voskhod', newComponentProject.project_hash, tester1)
    expect(segment.is_author).toBe(1)
  })

  it('устанавливаем план нового проекта', async () => {
    const data: CapitalContract.Actions.SetPlan.ISetPlan = {
      coopname: 'voskhod',
      master: tester1,
      project_hash: newComponentProject.project_hash,
      plan_creators_hours: 50,
      plan_expenses: '5000.0000 RUB',
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
  })

  it('стартуем новый проект', async () => {
    const data: CapitalContract.Actions.StartProject.IStartProject = {
      coopname: 'voskhod',
      project_hash: newComponentProject.project_hash,
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
  })

  it('cRPS алгоритм: точная проверка распределения премий вкладчиков', async () => {
    console.log('\n=== ДИАГНОСТИКА cRPS: Начальное состояние проекта ===\n')

    const allParticipants = [tester1, tester2, tester3, tester4, tester5, investor1, investor2, investor3]

    // Собираем информацию о всех участниках с балансом капитализации
    const contributorsInfo = []
    let totalCapitalInProject = 0

    for (const participant of allParticipants) {
      try {
        const segment = await getSegment(blockchain, 'voskhod', newComponentProject.project_hash, participant)
        if (segment && segment.is_contributor) {
          const capitalShares = parseFloat(segment.capital_contributor_shares.split(' ')[0])
          totalCapitalInProject += capitalShares
          contributorsInfo.push({
            name: participant,
            capitalShares,
            contributorBonus: segment.contributor_bonus,
          })
          console.log(`${participant}: capital_shares=${segment.capital_contributor_shares}, contributor_bonus=${segment.contributor_bonus}`)
        }
      }
      catch (error) {
        // Участник не в проекте
      }
    }

    console.log(`\nВсего вкладчиков в проекте: ${contributorsInfo.length}`)
    console.log(`Общая сумма капитализации: ${totalCapitalInProject.toFixed(4)} RUB`)

    const projectBefore = await getProject(blockchain, 'voskhod', newComponentProject.project_hash)
    console.log(`total_capital_contributors_shares из проекта: ${projectBefore.crps.total_capital_contributors_shares}`)
    console.log(`contributors_bonus_pool: ${projectBefore.fact.contributors_bonus_pool}`)

    // Делаем коммит от tester1
    console.log('\n=== Коммит от tester1 (10 часов) ===\n')
    const commitResult1 = await commitToResult(blockchain, 'voskhod', newComponentProject.project_hash, tester1, 10)

    console.log(`Новый contributors_bonus_pool: ${commitResult1.finalProject.fact.contributors_bonus_pool}`)

    // Проверяем распределение премий между всеми вкладчиками
    console.log('\n=== Распределение премий после коммита ===\n')
    let totalBonuses = 0

    for (const info of contributorsInfo) {
      const segment = await refreshSegment(blockchain, 'voskhod', newComponentProject.project_hash, info.name)
      const bonus = parseFloat(segment.updatedSegment.contributor_bonus.split(' ')[0])
      totalBonuses += bonus

      const share = (info.capitalShares / totalCapitalInProject * 100).toFixed(2)
      console.log(`${info.name}:`)
      console.log(`  - Доля капитализации: ${info.capitalShares.toFixed(4)} RUB (${share}%)`)
      console.log(`  - Премия вкладчика: ${segment.updatedSegment.contributor_bonus}`)
    }

    console.log(`\nОбщая сумма премий вкладчиков: ${totalBonuses.toFixed(4)} RUB`)
    const bonusPool = parseFloat(commitResult1.finalProject.fact.contributors_bonus_pool.split(' ')[0])
    console.log(`Пул премий в проекте: ${commitResult1.finalProject.fact.contributors_bonus_pool}`)

    // Проверяем точное распределение премий
    expect(contributorsInfo.length).toBe(7) // 7 вкладчиков зарегистрированы
    expect(totalBonuses).toBeCloseTo(19998.48, 2) // Общая сумма премий
    expect(bonusPool).toBeCloseTo(19998.48, 2) // Пул премий в проекте
    expect(totalCapitalInProject).toBeCloseTo(485044.9701, 4) // Общая капитализация

    console.log(`✅ Премии ${totalBonuses.toFixed(4)} RUB корректно распределены между ${contributorsInfo.length} вкладчиками пропорционально их долям`)
  })

  it('тестирование распределения членских взносов в программе капитализации', async () => {
    const fundAmount = '10000.0000 RUB'

    // Финансирование программы капитализации
    const fundResult = await processFundProgram(
      blockchain,
      'voskhod',
      fundAmount,
      'Тестовое финансирование программы капитализации',
    )

    expect(fundResult.transactionId).toBeDefined()
    expect(fundResult.programWalletBefore).toBeDefined()
    expect(fundResult.programWalletAfter).toBeDefined()

    console.log('✅ Финансирование программы капитализации выполнено успешно')

    // Обновление CRPS для одного из пользователей (tester1)
    const refreshResult = await processRefreshProg(
      blockchain,
      'voskhod',
      tester1,
    )

    expect(refreshResult.transactionId).toBeDefined()
    expect(refreshResult.programWalletBefore).toBeDefined()
    expect(refreshResult.programWalletAfter).toBeDefined()

    console.log('✅ Обновление CRPS в программе капитализации выполнено успешно')
  })

  it('тестирование распределения членских взносов в проекте', async () => {
    const fundAmount = '5000.0000 RUB'

    // Финансирование проекта
    const fundResult = await processFundProject(
      blockchain,
      'voskhod',
      metaProject.project_hash,
      fundAmount,
      'Тестовое финансирование проекта',
    )

    expect(fundResult.transactionId).toBeDefined()
    expect(fundResult.projectWalletBefore).toBeDefined()
    expect(fundResult.projectWalletAfter).toBeDefined()

    console.log('✅ Финансирование проекта выполнено успешно')

    // Обновление CRPS для одного из пользователей (tester1) в проекте
    const refreshResult = await processRefreshProj(
      blockchain,
      'voskhod',
      metaProject.project_hash,
      tester1,
    )

    expect(refreshResult.transactionId).toBeDefined()
    expect(refreshResult.projectWalletBefore).toBeDefined()
    expect(refreshResult.projectWalletAfter).toBeDefined()

    console.log('✅ Обновление CRPS в проекте выполнено успешно')
  })

  /// ////////// FINISH

  // it('быстрое голосование в новом проекте', async () => {
  //   // Стартуем голосование
  //   const startResult = await processStartVoting(blockchain, {
  //     coopname: 'voskhod',
  //     project_hash: newComponentProject.project_hash,
  //   })
  //   expect(startResult.projectAfter.status).toBe('voting')

  //   // Голосуем - каждый голосует за всех, кроме себя
  //   const voters = [tester1, tester3]
  //   for (const voter of voters) {
  //     const currentProject = (await blockchain.getTableRows(
  //       CapitalContract.contractName.production,
  //       'voskhod',
  //       'projects',
  //       1,
  //       newComponentProject.project_hash,
  //       newComponentProject.project_hash,
  //       3,
  //       'sha256',
  //     ))[0]

  //     const votingAmount = currentProject.voting.amounts.active_voting_amount
  //     // Создаем список получателей - все кроме голосующего
  //     const recipients = voters.filter(v => v !== voter)
  //     const voteDistribution = createVoteDistribution(recipients, voter, votingAmount)

  //     await submitVote(blockchain, 'voskhod', voter, newComponentProject.project_hash, voteDistribution)
  //   }

  //   // Завершаем голосование
  //   const completeResult = await processCompleteVoting(blockchain, {
  //     coopname: 'voskhod',
  //     project_hash: newComponentProject.project_hash,
  //   })
  //   expect(completeResult.projectAfter.status).toBe('completed')

  //   // Рассчитываем голоса
  //   for (const voter of voters) {
  //     await processCalculateVotes(blockchain, {
  //       coopname: 'voskhod',
  //       username: voter,
  //       project_hash: newComponentProject.project_hash,
  //     })
  //   }
  // })

  // it('вносим результаты в кооператив для нового проекта', async () => {
  //   const voters = [tester1, tester3]

  //   for (const voter of voters) {
  //     const segment = await getSegment(blockchain, 'voskhod', newComponentProject.project_hash, voter)
  //     const contributionAmount = segment.total_segment_cost
  //     const debtAmount = '0.0000 RUB' // В новом проекте долгов нет

  //     const result = await processPushResult(
  //       blockchain,
  //       'voskhod',
  //       voter,
  //       newComponentProject.project_hash,
  //       contributionAmount,
  //       debtAmount,
  //       [], // Нет долгов для погашения
  //     )

  //     expect(result.transactionId).toBeDefined()
  //     expect(result.segmentAfter.status).toBe('accepted')
  //   }
  // })

  // it('проверяем что проектные взносы нового проекта идут в мета-проект', async () => {
  //   // Получаем состояние мета-проекта до конвертации
  //   const metaProjectBefore = (await blockchain.getTableRows(
  //     CapitalContract.contractName.production,
  //     'voskhod',
  //     'projects',
  //     1,
  //     metaProject.project_hash,
  //     metaProject.project_hash,
  //     3,
  //     'sha256',
  //   ))[0]

  //   // Конвертируем один из сегментов в проект
  //   const segment = await getSegment(blockchain, 'voskhod', newComponentProject.project_hash, tester1)
  //   const availableAmount = parseFloat(segment.total_segment_cost.split(' ')[0])

  //   await processConvertSegment(
  //     blockchain,
  //     'voskhod',
  //     tester1,
  //     newComponentProject.project_hash,
  //     '0.0000 RUB',
  //     '0.0000 RUB',
  //     `${availableAmount.toFixed(4)} RUB`, // Всё в проект
  //   )

  //   // Получаем состояние мета-проекта после конвертации
  //   const metaProjectAfter = (await blockchain.getTableRows(
  //     CapitalContract.contractName.production,
  //     'voskhod',
  //     'projects',
  //     1,
  //     metaProject.project_hash,
  //     metaProject.project_hash,
  //     3,
  //     'sha256',
  //   ))[0]

  //   // Проверяем что мета-проект получил дополнительные средства
  //   const beforeContributors = parseFloat(metaProjectBefore.fact.contributors_pool.split(' ')[0])
  //   const afterContributors = parseFloat(metaProjectAfter.fact.contributors_pool.split(' ')[0])
  //   expect(afterContributors).toBeGreaterThan(beforeContributors)

  //   console.log(`✅ Мета-проект получил дополнительные взносы: ${beforeContributors} → ${afterContributors}`)
  // })

  // it('конвертируем все остальные сегменты перед удалением проекта', async () => {
  //   // Конвертируем оставшиеся сегменты всех участников
  //   const remainingParticipants = [tester3, tester4] // tester1 уже сконвертирован выше

  //   for (const participant of remainingParticipants) {
  //     const segment = await getSegment(blockchain, 'voskhod', newComponentProject.project_hash, participant)
  //     const availableAmount = parseFloat(segment.total_segment_cost.split(' ')[0])

  //     if (availableAmount > 0) {
  //       // Конвертируем в капитализацию
  //       await processConvertSegment(
  //         blockchain,
  //         'voskhod',
  //         participant,
  //         newComponentProject.project_hash,
  //         '0.0000 RUB',
  //         `${availableAmount.toFixed(4)} RUB`, // В капитализацию
  //         '0.0000 RUB',
  //       )
  //       console.log(`✅ Сегмент ${participant} конвертирован в капитализацию`)
  //     }
  //   }
  // })

  // it('финальное удаление нового компонент-проекта', async () => {
  //   const result = await processDeleteProject(blockchain, 'voskhod', newComponentProject.project_hash)

  //   expect(result.transactionId).toBeDefined()
  //   expect(result.projectBefore).toBeDefined()
  //   expect(result.projectAfter).toBeNull() // Проект должен быть удален

  //   console.log(`✅ Новый компонент-проект удален: ${newComponentProject.project_hash}`)
  //   console.log(`✅ Тестирование мета-проектов и компонент-проектов завершено`)
  // })
})
