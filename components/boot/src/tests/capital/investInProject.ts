import { expect } from 'vitest'
import { CapitalContract, SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { getCoopProgramWallet, getUserProgramWallet } from '../wallet/walletUtils'
import { processDecision } from '../soviet/processDecision'
import { capitalProgramId, sourceProgramId } from './consts'

export async function investInProject(
  blockchain: any,
  coopname: string,
  investor: string,
  projectHash: string,
  investAmount: string,
  fakeDocument: any,
) {
  const investHash = generateRandomSHA256()
  console.log(`\n🔹 Начало инвестиции: ${investHash}`)

  // Получение текущих данных перед инвестицией
  const prevContributor = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'contributors',
    1,
    investor,
    investor,
    2,
    'i64',
  ))[0] || { invested: '0.0000 RUB' }

  const prevProject = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0] || { invested: '0.0000 RUB', available: '0.0000 RUB' }

  const prevUserWallet = await getUserProgramWallet(blockchain, coopname, investor, capitalProgramId) || { blocked: '0.0000 RUB' }
  const prevProgramWallet = await getCoopProgramWallet(blockchain, coopname, capitalProgramId) || { blocked: '0.0000 RUB', share_contributions: '0.0000 RUB' }

  console.log('📊 Балансы до инвестиции:')
  console.log('▶ Контрибьютор:', prevContributor)
  console.log('▶ Проект:', prevProject)
  console.log('▶ Кошелек пользователя:', prevUserWallet)
  console.log('▶ Кошелек программы:', prevProgramWallet)

  // Создание инвестиции
  const createInvestData: CapitalContract.Actions.CreateInvest.ICreateInvest = {
    coopname,
    application: coopname,
    project_hash: projectHash,
    username: investor,
    invest_hash: investHash,
    amount: investAmount,
    statement: fakeDocument,
  }

  console.log(`\n🚀 Отправка транзакции CreateInvest для ${investor} на сумму ${investAmount}`)
  const createInvestResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CreateInvest.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: createInvestData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(createInvestResult)
  expect(createInvestResult.transaction_id).toBeDefined()

  let blockchainInvest = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'invests',
    1,
    investHash,
    investHash,
    2,
    'sha256',
  ))[0]

  console.log('🔍 Инвестиция в блокчейне:', blockchainInvest)
  expect(blockchainInvest).toBeDefined()
  expect(blockchainInvest.status).toBe('created')

  // Утверждение инвестиции
  const approveInvestData: CapitalContract.Actions.ApproveInvest.IApproveInvest = {
    coopname,
    application: coopname,
    approver: 'ant',
    invest_hash: investHash,
    approved_statement: fakeDocument,
  }

  console.log(`\n✅ Подтверждение инвестиции ${investHash}`)
  const approveInvestResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.ApproveInvest.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: approveInvestData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(approveInvestResult)
  expect(approveInvestResult.transaction_id).toBeDefined()

  blockchainInvest = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'invests',
    1,
    investHash,
    investHash,
    2,
    'sha256',
  ))[0]

  console.log('🔍 Инвестиция после утверждения:', blockchainInvest)
  expect(blockchainInvest).toBeDefined()
  expect(blockchainInvest.status).toBe('approved')

  // Получение всех решений и выполнение последнего
  const decisions = await blockchain.getTableRows(
    SovietContract.contractName.production,
    coopname,
    'decisions',
    1000,
  )
  const lastDecision = decisions[decisions.length - 1]

  console.log(`\n📜 Выполнение последнего решения: ${lastDecision.id}`)
  await processDecision(blockchain, lastDecision.id)

  blockchainInvest = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'invests',
    1,
    investHash,
    investHash,
    2,
    'sha256',
  ))[0]

  console.log('📌 Инвестиция после завершения:', blockchainInvest)
  expect(blockchainInvest).toBeUndefined()

  // Получение новых данных после инвестиции
  const contributor = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'contributors',
    1,
    investor,
    investor,
    2,
    'i64',
  ))[0]

  const project = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0]

  const userWallet = await getUserProgramWallet(blockchain, coopname, investor, capitalProgramId)
  const programWallet = await getCoopProgramWallet(blockchain, coopname, capitalProgramId)

  console.log('\n📊 Балансы после инвестиции:')
  console.log('▶ Контрибьютор:', contributor)
  console.log('▶ Проект:', project)
  console.log('▶ Кошелек пользователя:', userWallet)
  console.log('▶ Кошелек программы:', programWallet)

  // Проверка изменения балансов
  expect(parseFloat(contributor.invested)).toBe(parseFloat(prevContributor.invested) + parseFloat(investAmount))
  expect(parseFloat(project.invested)).toBe(parseFloat(prevProject.invested) + parseFloat(investAmount))
  expect(parseFloat(project.available)).toBe(parseFloat(prevProject.available) + parseFloat(investAmount))
  expect(parseFloat(userWallet.blocked)).toBe(parseFloat(prevUserWallet.blocked) + parseFloat(investAmount))
  expect(parseFloat(programWallet.blocked)).toBe(parseFloat(prevProgramWallet.blocked) + parseFloat(investAmount))
  expect(parseFloat(programWallet.share_contributions)).toBe(parseFloat(prevProgramWallet.share_contributions) + parseFloat(investAmount))

  console.log(`\n✅ Инвестирование на ${investAmount} завершено успешно!`)

  return { investHash, transactionId: approveInvestResult.transaction_id }
}
