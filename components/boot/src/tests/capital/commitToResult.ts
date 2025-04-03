import { expect } from 'vitest'
import { CapitalContract, SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { fakeDocument } from '../soviet/fakeDocument'
import { processDecision } from '../soviet/processDecision'
import { ratePerHour } from './consts'

export async function commitToResult(
  blockchain: any,
  coopname: string,
  resultHash: string,
  projectHash: string,
  creator: string,
  spendHours: number,
) {
  const commitHash = generateRandomSHA256()
  const totalSpended = `${(spendHours * parseFloat(ratePerHour)).toFixed(4)} RUB`
  console.log(`\n🔹 Начало коммита: ${commitHash}, часы: ${spendHours}, сумма: ${totalSpended}`)

  // Получение текущих данных перед коммитом
  const prevResult = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'results',
    1,
    resultHash,
    resultHash,
    2,
    'sha256',
  ))[0] || { spended: '0.0000 RUB', commits_count: 0 }

  const prevProject = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0] || { spended: '0.0000 RUB' }

  const prevContributor = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'contributors',
    1,
    creator,
    creator,
    2,
    'i64',
  ))[0] || { contributed_hours: 0, available: '0.0000 RUB' }

  console.log('📊 Балансы до коммита:')
  console.log('▶ Результат:', prevResult)
  console.log('▶ Проект:', prevProject)
  console.log('▶ Контрибьютор:', prevContributor)

  // Создание коммита
  const commitData: CapitalContract.Actions.CreateCommit.ICommit = {
    coopname,
    application: coopname,
    result_hash: resultHash,
    commit_hash: commitHash,
    contributed_hours: spendHours,
    username: creator,
  }

  console.log(`\n🚀 Отправка транзакции CreateCommit для результата ${resultHash}`)
  const createCommitResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CreateCommit.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: commitData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(createCommitResult)
  expect(createCommitResult.transaction_id).toBeDefined()

  // Проверка созданного коммита
  let blockchainCommit = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'commits',
    1,
    commitHash,
    commitHash,
    3,
    'sha256',
  ))[0]

  console.log('🔍 Коммит после создания:', blockchainCommit)
  expect(blockchainCommit).toBeDefined()
  expect(blockchainCommit.commit_hash).toBe(commitHash)
  expect(blockchainCommit.spended).toBe(totalSpended)
  expect(blockchainCommit.status).toBe('created')

  // Утверждение коммита
  const approveCommitData: SovietContract.Actions.Approves.ConfirmApprove.IConfirmApprove = {
    coopname,
    approval_hash: commitHash,
    approved_document: fakeDocument,
  }

  console.log(`\n✅ Подтверждение коммита ${commitHash}`)
  const approveCommitResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: SovietContract.contractName.production,
          name: SovietContract.Actions.Approves.ConfirmApprove.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: approveCommitData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(approveCommitResult)
  expect(approveCommitResult.transaction_id).toBeDefined()

  // Проверка утвержденного коммита
  blockchainCommit = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'commits',
    1,
    commitHash,
    commitHash,
    3,
    'sha256',
  ))[0]

  // Коммит удаляем после утверждения
  expect(blockchainCommit).toBeUndefined()

  // // Получение всех решений и выполнение последнего
  // const decisions = await blockchain.getTableRows(
  //   SovietContract.contractName.production,
  //   coopname,
  //   'decisions',
  //   1000,
  // )
  // const lastDecision = decisions[decisions.length - 1]

  // console.log(`\n📜 Выполнение последнего решения: ${lastDecision.id}`)
  // await processDecision(blockchain, lastDecision.id)

  // {
  //   // Утверждение коммита
  //   const act1Data: CapitalContract.Actions.SetAct1.ISetAct1 = {
  //     coopname,
  //     application: coopname,
  //     username: creator,
  //     commit_hash: commitHash,
  //     act: fakeDocument,
  //   }

  //   console.log(`\n✅ Установка акта1 по коммиту ${commitHash}`)
  //   const act1Result = await blockchain.api.transact(
  //     {
  //       actions: [
  //         {
  //           account: CapitalContract.contractName.production,
  //           name: CapitalContract.Actions.SetAct1.actionName,
  //           authorization: [{ actor: coopname, permission: 'active' }],
  //           data: act1Data,
  //         },
  //       ],
  //     },
  //     {
  //       blocksBehind: 3,
  //       expireSeconds: 30,
  //     },
  //   )

  //   getTotalRamUsage(act1Result)
  //   expect(act1Result.transaction_id).toBeDefined()
  // }

  // {
  //   // Утверждение коммита
  //   const act2Data: CapitalContract.Actions.SetAct2.ISetAct2 = {
  //     coopname,
  //     application: coopname,
  //     username: creator,
  //     commit_hash: commitHash,
  //     act: fakeDocument,
  //   }

  //   console.log(`\n✅ Установка акта2 по коммиту ${commitHash}`)
  //   const act2Result = await blockchain.api.transact(
  //     {
  //       actions: [
  //         {
  //           account: CapitalContract.contractName.production,
  //           name: CapitalContract.Actions.SetAct2.actionName,
  //           authorization: [{ actor: coopname, permission: 'active' }],
  //           data: act2Data,
  //         },
  //       ],
  //     },
  //     {
  //       blocksBehind: 3,
  //       expireSeconds: 30,
  //     },
  //   )

  //   getTotalRamUsage(act2Result)
  //   expect(act2Result.transaction_id).toBeDefined()
  // }

  // Проверка результата после утверждения коммита
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

  console.log('\n📊 Балансы после утверждения коммита:')
  console.log('▶ Результат:', finalResult)
  console.log('▶ Проект:', finalProject)
  console.log('▶ Контрибьютор:', finalContributor)

  // expect(parseFloat(finalResult.spended)).toBe(parseFloat(prevResult.spended) + parseFloat(totalSpended))
  // expect(parseFloat(finalProject.spended)).toBe(parseFloat(prevProject.spended))

  // Проверка, что у контрибьютора увеличились contributed_hours и available
  // expect(parseFloat(finalContributor.contributed_hours)).toBe(parseFloat(prevContributor.contributed_hours) + spendHours)
  // expect(parseFloat(finalContributor.available)).toBe(parseFloat(prevContributor.available) + parseFloat(totalSpended))

  console.log(`\n✅ Коммит ${commitHash} завершен успешно!`)

  return {
    commitHash,
    transactionId: approveCommitResult.transaction_id,
    finalResult,
    finalProject,
    finalContributor,
  }
}
