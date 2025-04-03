import { expect } from 'vitest'
import { CapitalContract, GatewayContract, SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { processDecision } from '../soviet/processDecision'

export async function registerExpense(
  blockchain: any,
  coopname: string,
  resultHash: string,
  projectHash: string,
  creator: string,
  fundId: number,
  expenseAmount: string,
  fakeDocument: any,
) {
  const expenseHash = generateRandomSHA256()
  console.log(`\n🔹 Начало регистрации расхода: ${expenseHash}, сумма: ${expenseAmount}`)

  // Получаем текущие балансы
  const prevResult = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'results',
    1,
    resultHash,
    resultHash,
    2,
    'sha256',
  ))[0] || { available: '0.0000 RUB', expensed: '0.0000 RUB' }

  const prevProject = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0] || { expensed: '0.0000 RUB' }

  const prevContributor = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'contributors',
    1,
    creator,
    creator,
    2,
    'i64',
  ))[0] || { expensed: '0.0000 RUB' }

  console.log('📊 Балансы до расхода:')
  console.log('▶ Результат:', prevResult)
  console.log('▶ Проект:', prevProject)
  console.log('▶ Контрибьютор:', prevContributor)

  // Создание расхода
  const createExpenseData: CapitalContract.Actions.CreateExpense.ICreateExpense = {
    coopname,
    application: coopname,
    expense_hash: expenseHash,
    result_hash: resultHash,
    creator,
    fund_id: fundId,
    amount: expenseAmount,
    description: 'Купил подписку на то-сё',
    statement: fakeDocument,
  }

  console.log(`\n🚀 Отправка транзакции CreateExpense для расхода ${expenseHash}`)
  const createExpenseResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CreateExpense.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: createExpenseData,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )

  getTotalRamUsage(createExpenseResult)
  expect(createExpenseResult.transaction_id).toBeDefined()

  let blockchainExpense = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'expenses',
    1,
    expenseHash,
    expenseHash,
    3,
    'sha256',
  ))[0]

  console.log('🔍 Расход после создания:', blockchainExpense)
  expect(blockchainExpense).toBeDefined()
  expect(blockchainExpense.status).toBe('created')

  // Подтверждение расхода
  const approveExpenseData: CapitalContract.Actions.ApproveExpense.IApproveExpense = {
    coopname,
    application: coopname,
    approver: 'ant',
    expense_hash: expenseHash,
    approved_statement: fakeDocument,
  }

  console.log(`\n✅ Подтверждение расхода ${expenseHash}`)
  const approveExpenseResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.ApproveExpense.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: approveExpenseData,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )

  getTotalRamUsage(approveExpenseResult)
  expect(approveExpenseResult.transaction_id).toBeDefined()

  blockchainExpense = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'expenses',
    1,
    expenseHash,
    expenseHash,
    3,
    'sha256',
  ))[0]

  console.log('🔍 Расход после подтверждения:', blockchainExpense)
  expect(blockchainExpense).toBeDefined()
  expect(blockchainExpense.status).toBe('approved')

  // Получение решений и выполнение последнего
  const decisions = await blockchain.getTableRows(
    SovietContract.contractName.production,
    coopname,
    'decisions',
    1000,
  )
  const lastDecision = decisions[decisions.length - 1]

  console.log(`\n📜 Выполнение последнего решения:`, lastDecision)
  await processDecision(blockchain, lastDecision.id)

  blockchainExpense = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'expenses',
    1,
    expenseHash,
    expenseHash,
    3,
    'sha256',
  ))[0]

  console.log('🔍 Расход после авторизации:', blockchainExpense)
  expect(blockchainExpense).toBeDefined()
  expect(blockchainExpense.status).toBe('authorized')

  const blockchainWithdraw = (await blockchain.getTableRows(
    GatewayContract.contractName.production,
    coopname,
    GatewayContract.Tables.Outcomes.tableName,
    1,
    expenseHash,
    expenseHash,
    2,
    'sha256',
  ))[0]

  console.log('🔍 Вывод средств:', blockchainWithdraw)
  expect(blockchainWithdraw).toBeDefined()
  expect(blockchainWithdraw.outcome_hash).toBe(expenseHash)
  expect(blockchainWithdraw.quantity).toBe(expenseAmount)
  expect(blockchainWithdraw.status).toBe('pending')

  // Завершение вывода
  const completeWithdrawData: GatewayContract.Actions.CompleteOutcome.ICompleteOutcome = {
    coopname,
    outcome_hash: expenseHash,
  }

  console.log(`\n✅ Завершение вывода ${expenseHash}`)
  const completeWithdrawResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: GatewayContract.contractName.production,
          name: GatewayContract.Actions.CompleteOutcome.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: completeWithdrawData,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )

  getTotalRamUsage(completeWithdrawResult)
  expect(completeWithdrawResult.transaction_id).toBeDefined()

  const finalProject = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0]

  console.log('\n📊 Проект после расхода:', finalProject)
  expect(finalProject).toBeDefined()
  expect(finalProject.expensed).toBe(
    `${(parseFloat(prevProject.expensed) + parseFloat(expenseAmount)).toFixed(4)} RUB`,
  )

  const finalResult = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'results',
    1,
    resultHash,
    resultHash,
    2,
    'sha256',
  ))[0]

  console.log('\n📌 Результат после расхода:', finalResult)
  expect(finalResult).toBeDefined()
  expect(finalResult.available).toBe(
    `${(parseFloat(prevResult.available) - parseFloat(expenseAmount)).toFixed(4)} RUB`,
  )
  expect(finalResult.expensed).toBe(
    `${(parseFloat(prevResult.expensed) + parseFloat(expenseAmount)).toFixed(4)} RUB`,
  )

  const finalContributor = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'contributors',
    1,
    creator,
    creator,
    2,
    'i64',
  ))[0]

  console.log(`\n👤 Контрибьютор ${creator} после расхода:`, finalContributor)
  expect(finalContributor).toBeDefined()
  expect(finalContributor.expensed).toBe(
    `${(parseFloat(prevContributor.expensed) + parseFloat(expenseAmount)).toFixed(4)} RUB`,
  )

  console.log(`\n✅ Расход ${expenseHash} успешно завершен!`)

  return { expenseHash, transactionId: completeWithdrawResult.transaction_id, finalProject, finalResult, finalContributor }
}
