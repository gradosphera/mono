import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { CapitalContract, GatewayContract, SovietContract, TokenContract } from 'cooptypes'
import Blockchain from '../blockchain'
import config from '../configs'
import { getTotalRamUsage, globalRamStats } from '../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../utils/randomHash'
import { addUser } from '../init/participant'
import { generateRandomUsername } from '../utils/randomUsername'
import { sleep } from '../utils'
import { processDecision } from './soviet/processDecision'
import { registerAndApproveUHDContract } from './capital/registerAndApproveUHDContract'
import { depositToWallet } from './wallet/depositToWallet'
import { signWalletAgreement } from './wallet/signWalletAgreement'
import { signAgreement } from './soviet/signAgreement'
import { signCapitalAgreement } from './capital/signCapitalAgreement'
import { getCoopProgramWallet, getUserProgramWallet } from './wallet/walletUtils'
import { investInProject } from './capital/investInProject'
import { allocateFundsToResult } from './capital/allocateFundsToResult'
import { commitToResult } from './capital/commitToResult'
import { capitalProgramId, ratePerHour, sourceProgramId, walletProgramId } from './capital/consts'
import { withdrawContribution } from './capital/withdrawContribution'
import { registerExpense } from './capital/registerExpense'

// const CLI_PATH = 'src/index.ts'

const blockchain = new Blockchain(config.network, config.private_keys)
let project1: CapitalContract.Actions.CreateProject.ICreateProject
let _project2: CapitalContract.Actions.CreateProject.ICreateProject
let _project3: CapitalContract.Actions.CreateProject.ICreateProject

let tester1: string
let tester2: string
let tester3: string

let investor1: string

let result1: CapitalContract.Actions.CreateResult.ICreateResult
let _result2: CapitalContract.Actions.CreateResult.ICreateResult
let _result3: CapitalContract.Actions.CreateResult.ICreateResult

const commits: string[] = []
const tester1CommitHours = 10
const tester2CommitHours = 10
const investAmount = '100000.0000 RUB'

const fakeDocument = {
  hash: '157192B276DA23CC84AB078FC8755C051C5F0430BF4802E55718221E6B76C777',
  public_key: 'PUB_K1_5JhMfxbsNebajHcTEK8yC9uNN9Dit9hEmzE8ri8yMhhzzEtUA4',
  signature: 'SIG_K1_KmKWPBC8dZGGDGhbKEoZEzPr3h5crRrR2uLdGRF5DJbeibY1MY1bZ9sPwHsgmPfiGFv9psfoCVsXFh9TekcLuvaeuxRKA8',
  meta: '{}',
}

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

  it('инициализируем контракт CAPITAL', async () => {
    const data: CapitalContract.Actions.Init.IInit = {
      coopname: 'voskhod',
      initiator: 'voskhod',
    }

    const state = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      CapitalContract.contractName.production,
      'state',
      1,
      'voskhod',
      'voskhod',
    ))[0]

    if (state) {
      expect(state.coopname).toBe('voskhod')
    }
    else {
      const result = await blockchain.api.transact(
        {
          actions: [
            {
              account: CapitalContract.contractName.production,
              name: CapitalContract.Actions.Init.actionName,
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
    }
  })

  it('создаём проект', async () => {
    const hash = generateRandomSHA256()
    const parentHash = '0000000000000000000000000000000000000000000000000000000000000000'

    const data: CapitalContract.Actions.CreateProject.ICreateProject = {
      coopname: 'voskhod',
      application: 'voskhod',
      title: `Идея ${hash.slice(0, 10)}`,
      description: `Описание ${hash.slice(0, 10)}`,
      project_hash: hash,
      parent_project_hash: parentHash,
      parent_distribution_ratio: 0,
      terms: '',
      subject: '',
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

    expect(project.status).toBe('created')
    expect(project.target).toBe('0.0000 RUB')
    expect(project.invested).toBe('0.0000 RUB')
    expect(project.authors_count).toBe(0)
    expect(project.authors_shares).toBe(0)
    expect(project.project_hash).toBe(data.project_hash)
    expect(project.title).toBe(data.title)
    expect(project.description).toBe(data.description)
    getTotalRamUsage(result)
  })

  it('заключаем договор УХД с автором по проекту', async () => {
    const testerNames = [tester1, tester2, investor1] // Можно передавать любое количество пользователей

    for (const tester of testerNames) {
      await registerAndApproveUHDContract(blockchain, tester, project1.project_hash)

      // Получаем все решения и утверждаем последнее
      const decisions = await blockchain.getTableRows(
        SovietContract.contractName.production,
        'voskhod',
        'decisions',
        1000,
      )
      const lastDecision = decisions[decisions.length - 1]

      console.log(`Последнее решение: `, lastDecision)
      await processDecision(blockchain, lastDecision.id)

      // Проверка финального статуса контрибьютора
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

      console.log(`Контрибьютор ${tester} после авторизации: `, contributor)
      expect(contributor).toBeDefined()
      expect(contributor.status).toBe('authorized')
    }
  })

  it('добавляем автора к идее', async () => {
    const data: CapitalContract.Actions.AddAuthor.IAddAuthor = {
      coopname: 'voskhod',
      application: 'voskhod',
      project_hash: project1.project_hash,
      author: tester1,
      shares: '100',
    }

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.AddAuthor.actionName,
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

    const author = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'authors',
      1,
      project1.project_hash,
      project1.project_hash,
      3,
      'sha256',
    ))[0]
    console.log('author: ', author)
    expect(author).toBeDefined()
    expect(author.username).toBe(tester1)
    expect(author.shares).toBe(100)
    expect(author.project_hash).toBe(project1.project_hash)

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
    expect(project.authors_count).toBe(1)
    expect(project.authors_shares).toBe(100)
  })

  it('создать результат', async () => {
    const data: CapitalContract.Actions.CreateResult.ICreateResult = {
      coopname: 'voskhod',
      application: 'voskhod',
      project_hash: project1.project_hash,
      result_hash: generateRandomSHA256(),
      assignee: 'ant',
      assignment: 'Задание #1: тут описание',
    }

    result1 = data

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.CreateResult.actionName,
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

    const blockchainResult = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'results',
      1,
      result1.result_hash,
      result1.result_hash,
      2,
      'sha256',
    ))[0]

    expect(blockchainResult).toBeDefined()
    expect(blockchainResult.result_hash).toBe(result1.result_hash)
    expect(blockchainResult.project_hash).toBe(project1.project_hash)
    expect(blockchainResult.coopname).toBe('voskhod')
  })

  it(`подписать соглашение о ЦПП "Цифровой Кошелек" и пополнить баланс кошелька investor1`, async () => {
    {
      const { wallet, program } = await signWalletAgreement(blockchain, 'voskhod', investor1, fakeDocument)
      console.log('wallet investor1: ', wallet)
    }
    {
      const { depositId, program, userWallet } = await depositToWallet(blockchain, 'voskhod', investor1, 100000)
    }
  })

  it('подписать соглашение о ЦПП "Капитализация"', async () => {
    const testerNames = [tester1, tester2, investor1] // Можно передавать любое количество пользователей

    for (const tester of testerNames) {
      await signCapitalAgreement(blockchain, 'voskhod', tester, fakeDocument)
    }
  })

  it('инвестировать в проект аккаунтом investor1', async () => {
    await investInProject(blockchain, 'voskhod', investor1, project1.project_hash, investAmount, fakeDocument)
  })

  it('финансировать результат проекта на 10000 RUB', async () => {
    await allocateFundsToResult(blockchain, 'voskhod', project1.project_hash, result1.result_hash, '10000.0000 RUB')
  })

  it('финансировать результат проекта на 20000 RUB', async () => {
    await allocateFundsToResult(blockchain, 'voskhod', project1.project_hash, result1.result_hash, '20000.0000 RUB')
  })

  it('добавить коммит создателя tester1 на 10 часов по 1000 RUB', async () => {
    const { finalResult, commitHash } = await commitToResult(blockchain, 'voskhod', result1.result_hash, result1.project_hash, tester1, tester1CommitHours)
    commits.push(commitHash)

    expect(finalResult.creators_base).toBe('10000.0000 RUB')
    expect(finalResult.creators_bonus).toBe('3820.0000 RUB')
    expect(finalResult.authors_bonus).toBe('16180.0000 RUB')
    expect(finalResult.generated).toBe('30000.0000 RUB')
    expect(finalResult.capitalists_bonus).toBe('48540.0000 RUB')
    expect(finalResult.total).toBe('78540.0000 RUB')
  })

  it('добавить коммит создателя tester2 на 10 часов по 1000 RUB', async () => {
    const { finalResult, commitHash } = await commitToResult(blockchain, 'voskhod', result1.result_hash, result1.project_hash, tester2, tester2CommitHours)
    commits.push(commitHash)

    expect(finalResult.creators_base).toBe('20000.0000 RUB')
    expect(finalResult.creators_bonus).toBe('7640.0000 RUB')
    expect(finalResult.authors_bonus).toBe('32360.0000 RUB')
    expect(finalResult.generated).toBe('60000.0000 RUB')
    expect(finalResult.capitalists_bonus).toBe('97080.0000 RUB')
    expect(finalResult.total).toBe('157080.0000 RUB')
  })

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

  it('регистрируем расход на 1000 RUB', async () => {
    const expenseAmount = '1000.0000 RUB'

    const { expenseHash } = await registerExpense(
      blockchain,
      'voskhod', // coopname
      result1.result_hash, // resultHash
      project1.project_hash, // projectHash
      tester1, // creator
      4, // fund_id (фонд хозяйственных расходов)
      expenseAmount,
      fakeDocument, // fakeDocument
    )
  })

  it('регистрируем расход на 5000 RUB', async () => {
    const expenseAmount = '5000.0000 RUB'

    const { expenseHash } = await registerExpense(
      blockchain,
      'voskhod', // coopname
      result1.result_hash, // resultHash
      project1.project_hash, // projectHash
      tester1, // creator
      4, // fund_id (фонд хозяйственных расходов)
      expenseAmount,
      fakeDocument, // fakeDocument
    )
  })

  /// ____________
  it('завершаем цикл и стартуем распределение', async () => {
    const data: CapitalContract.Actions.StartDistribution.IStart = {
      coopname: 'voskhod',
      application: 'voskhod',
      result_hash: result1.result_hash,
    }

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.StartDistribution.actionName,
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

    const blockchainResult = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'results',
      1,
      result1.result_hash,
      result1.result_hash,
      2,
      'sha256',
    ))[0]

    expect(blockchainResult).toBeDefined()
    expect(blockchainResult.result_hash).toBe(result1.result_hash)
    expect(blockchainResult.project_hash).toBe(project1.project_hash)
    expect(blockchainResult.coopname).toBe('voskhod')
    expect(blockchainResult.status).toBe('closed')

    expect(blockchainResult.creators_amount_remain).toBe(blockchainResult.creators_amount)
    expect(blockchainResult.creators_bonus_remain).toBe(blockchainResult.creators_bonus)
    expect(blockchainResult.authors_bonus_remain).toBe(blockchainResult.authors_bonus)
    expect(blockchainResult.capitalists_bonus_remain).toBe(blockchainResult.capitalists_bonus)
    console.log('Результат после старта приёма: ', blockchainResult)
  })

  it('обновляем капитал первого создателя в результате', async () => {
    const claim_hash = generateRandomSHA256()

    const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
      coopname: 'voskhod',
      application: 'voskhod',
      result_hash: result1.result_hash,
      username: tester1,
      claim_hash,
    }

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.CreateClaim.actionName,
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

    const blockchainResult = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'results',
      1,
      result1.result_hash,
      result1.result_hash,
      2,
      'sha256',
    ))[0]

    expect(blockchainResult).toBeDefined()
    console.log('blockchainResult: ', blockchainResult)
  })

  it('обновляем капитал второго создателя в результате', async () => {
    const claim_hash = generateRandomSHA256()

    const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
      coopname: 'voskhod',
      application: 'voskhod',
      result_hash: result1.result_hash,
      username: tester2,
      claim_hash,
    }

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.CreateClaim.actionName,
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

    const blockchainResult = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'results',
      1,
      result1.result_hash,
      result1.result_hash,
      2,
      'sha256',
    ))[0]

    expect(blockchainResult).toBeDefined()
    console.log('blockchainResult: ', blockchainResult)
  })

  it('повторно обновляем капитал второго создателя в результате и ожидаем ошибку', async () => {
    const claim_hash = generateRandomSHA256()

    const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
      coopname: 'voskhod',
      application: 'voskhod',
      result_hash: result1.result_hash,
      username: tester2,
      claim_hash,
    }

    try {
      await sleep(1000)
      await blockchain.api.transact(
        {
          actions: [
            {
              account: CapitalContract.contractName.production,
              name: CapitalContract.Actions.CreateClaim.actionName,
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
      throw new Error('Ожидалась ошибка, но транзакция прошла успешно')
    }
    catch (error: any) {
      const message = error.json?.error?.details?.[0]?.message
      expect(message).toMatch(/Клайм уже существует/i)
    }
  })

  it('обновляем капитал инвестора в результате', async () => {
    const claim_hash = generateRandomSHA256()

    const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
      coopname: 'voskhod',
      application: 'voskhod',
      result_hash: result1.result_hash,
      username: investor1,
      claim_hash,
    }

    const result = await blockchain.api.transact(
      {
        actions: [
          {
            account: CapitalContract.contractName.production,
            name: CapitalContract.Actions.CreateClaim.actionName,
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

    const blockchainResult = (await blockchain.getTableRows(
      CapitalContract.contractName.production,
      'voskhod',
      'results',
      1,
      result1.result_hash,
      result1.result_hash,
      2,
      'sha256',
    ))[0]

    expect(blockchainResult).toBeDefined()
    console.log('investorResult: ', blockchainResult)
  })

  it('повторно обновляем капитал инвестора в результате и ожидаем ошибку', async () => {
    const claim_hash = generateRandomSHA256()

    const data: CapitalContract.Actions.CreateClaim.ICreateClaim = {
      coopname: 'voskhod',
      application: 'voskhod',
      result_hash: result1.result_hash,
      username: investor1,
      claim_hash,
    }

    try {
      await sleep(1000)
      await blockchain.api.transact(
        {
          actions: [
            {
              account: CapitalContract.contractName.production,
              name: CapitalContract.Actions.CreateClaim.actionName,
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
      throw new Error('Ожидалась ошибка, но транзакция прошла успешно')
    }
    catch (error: any) {
      const message = error.json?.error?.details?.[0]?.message
      expect(message).toMatch(/Клайм уже существует/i)
    }
  })
})
