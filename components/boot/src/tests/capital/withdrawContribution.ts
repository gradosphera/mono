import { expect } from 'vitest'
import { CapitalContract, SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { getCoopProgramWallet, getUserProgramWallet } from '../wallet/walletUtils'
import { processDecision } from '../soviet/processDecision'
import { capitalProgramId, walletProgramId } from './consts'

export async function withdrawContribution(
  blockchain: any,
  coopname: string,
  username: string,
  resultHash: string,
  projectHash: string, // Добавлен projectHash для проверки spend
  commitHashes: string[],
  withdrawAmount: string,
  fakeDocument: any,
) {
  const withdrawHash = generateRandomSHA256()
  console.log(`\n🔹 Начало возврата: ${withdrawHash}, сумма: ${withdrawAmount}`)

  // Получение текущих данных перед возвратом
  const prevCooFundUserWallet = await getUserProgramWallet(blockchain, coopname, username, capitalProgramId)
  const prevCooFundProgramWallet = await getCoopProgramWallet(blockchain, coopname, capitalProgramId)
  const prevUserWallet = await getUserProgramWallet(blockchain, coopname, username, walletProgramId)
  const prevProgramWallet = await getCoopProgramWallet(blockchain, coopname, walletProgramId)

  const prevProject = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0] || { spend: '0.0000 RUB' }

  console.log('📊 Балансы до возврата:')
  console.log('▶ cooFundUserWallet:', prevCooFundUserWallet)
  console.log('▶ cooFundProgramWallet:', prevCooFundProgramWallet)
  console.log('▶ userWallet:', prevUserWallet)
  console.log('▶ programWallet:', prevProgramWallet)
  console.log('▶ Проект:', prevProject)

  // Создание заявления на возврат
  const createWithdrawData: CapitalContract.Actions.CreateWithdraw1.ICreateWithdraw = {
    coopname,
    application: coopname,
    username,
    result_hash: resultHash,
    withdraw_hash: withdrawHash,
    commit_hashes: commitHashes,
    contribution_statement: fakeDocument,
    return_statement: fakeDocument,
  }

  console.log(`\n🚀 Отправка транзакции CreateWithdraw для ${username} на сумму ${withdrawAmount}`)
  const createWithdrawResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CreateWithdraw1.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: createWithdrawData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(createWithdrawResult)
  expect(createWithdrawResult.transaction_id).toBeDefined()

  let blockchainWithdraw = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'withdraws',
    1,
    withdrawHash,
    withdrawHash,
    2,
    'sha256',
  ))[0]

  console.log('🔍 Возврат в блокчейне:', blockchainWithdraw)
  expect(blockchainWithdraw).toBeDefined()
  expect(blockchainWithdraw.status).toBe('created')
  expect(blockchainWithdraw.amount).toBe(withdrawAmount)

  // Подтверждение возврата
  const approveWithdrawData: CapitalContract.Actions.ApproveWithdraw.IApproveWithdraw = {
    coopname,
    application: coopname,
    approver: 'ant',
    withdraw_hash: withdrawHash,
    approved_contribution_statement: fakeDocument,
    approved_return_statement: fakeDocument,
  }

  console.log(`\n✅ Подтверждение возврата ${withdrawHash}`)
  const approveWithdrawResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.ApproveWithdraw.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: approveWithdrawData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(approveWithdrawResult)
  expect(approveWithdrawResult.transaction_id).toBeDefined()

  blockchainWithdraw = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'withdraws',
    1,
    withdrawHash,
    withdrawHash,
    2,
    'sha256',
  ))[0]

  console.log('🔍 Возврат после подтверждения:', blockchainWithdraw)
  expect(blockchainWithdraw).toBeDefined()
  expect(blockchainWithdraw.status).toBe('approved')

  // Получение всех решений и выполнение последнего
  const decisions = await blockchain.getTableRows(
    SovietContract.contractName.production,
    coopname,
    'decisions',
    1000,
  )
  const lastDecision = decisions[decisions.length - 1]
  const prevLastDecision = decisions[decisions.length - 2]

  console.log(`\n📜 Выполнение решений: ${prevLastDecision.id}, ${lastDecision.id}`)

  await processDecision(blockchain, prevLastDecision.id)
  await processDecision(blockchain, lastDecision.id)

  blockchainWithdraw = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'withdraws',
    1,
    withdrawHash,
    withdrawHash,
    2,
    'sha256',
  ))[0]

  console.log('📌 Возврат после завершения:', blockchainWithdraw)
  expect(blockchainWithdraw).toBeUndefined()

  // Получение новых данных после возврата
  const cooFundUserWallet = await getUserProgramWallet(blockchain, coopname, username, capitalProgramId)
  const cooFundProgramWallet = await getCoopProgramWallet(blockchain, coopname, capitalProgramId)
  const userWallet = await getUserProgramWallet(blockchain, coopname, username, walletProgramId)
  const programWallet = await getCoopProgramWallet(blockchain, coopname, walletProgramId)

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

  console.log('\n📊 Балансы после возврата:')
  console.log('▶ cooFundUserWallet:', cooFundUserWallet)
  console.log('▶ cooFundProgramWallet:', cooFundProgramWallet)
  console.log('▶ userWallet:', userWallet)
  console.log('▶ programWallet:', programWallet)
  console.log('▶ Проект:', finalProject)

  // Проверка изменений балансов
  expect(parseFloat(cooFundUserWallet.available)).toBe(parseFloat(prevCooFundUserWallet.available))
  expect(parseFloat(cooFundUserWallet.blocked)).toBe(parseFloat(prevCooFundUserWallet.blocked))
  expect(parseFloat(cooFundProgramWallet.available)).toBe(parseFloat(prevCooFundProgramWallet.available))
  expect(parseFloat(cooFundProgramWallet.blocked)).toBe(parseFloat(prevCooFundProgramWallet.blocked))

  expect(parseFloat(userWallet.available)).toBe(parseFloat(prevUserWallet.available) + parseFloat(withdrawAmount))
  expect(parseFloat(programWallet.available)).toBe(parseFloat(prevProgramWallet.available) + parseFloat(withdrawAmount))
  expect(parseFloat(userWallet.blocked)).toBe(parseFloat(prevUserWallet.blocked))
  expect(parseFloat(programWallet.blocked)).toBe(parseFloat(prevProgramWallet.blocked))

  // Проверка изменения spend в проекте
  expect(parseFloat(finalProject.spend)).toBe(parseFloat(prevProject.spend) + parseFloat(withdrawAmount))

  console.log(`\n✅ Возврат на ${withdrawAmount} завершен успешно!`)

  return { withdrawHash, transactionId: approveWithdrawResult.transaction_id, finalProject }
}
