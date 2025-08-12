import { expect } from 'vitest'
import { CapitalContract, SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { getCoopProgramWallet, getUserProgramWallet } from '../wallet/walletUtils'
import { processDecision } from '../soviet/processDecision'
import { processApprove } from './processApprove'
import { getSegment } from './getSegment'
import { sourceProgramId } from './consts'

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

  const prevUserWallet = await getUserProgramWallet(blockchain, coopname, investor, sourceProgramId) || { blocked: '0.0000 RUB' }
  const prevProgramWallet = await getCoopProgramWallet(blockchain, coopname, sourceProgramId) || { blocked: '0.0000 RUB', share_contributions: '0.0000 RUB' }

  console.log('📊 Балансы до инвестиции:')
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

  const blockchainInvest = (await blockchain.getTableRows(
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
  console.log(`\n✅ Подтверждение инвестиции ${investHash}`)
  const approveInvestResult = await processApprove(blockchain, coopname, investHash)

  // Проверка утвержденной инвестиции
  const blockchainEmptyInvest = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'invests',
    1,
    investHash,
    investHash,
    2,
    'sha256',
  ))[0]

  // Инвестиция удаляется после утверждения
  expect(blockchainEmptyInvest).toBeUndefined()

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

  const finalUserWallet = await getUserProgramWallet(blockchain, coopname, investor, sourceProgramId)
  const finalProgramWallet = await getCoopProgramWallet(blockchain, coopname, sourceProgramId)

  // Получение сегмента инвестора для данного проекта
  const segment = await getSegment(blockchain, coopname, projectHash, investor)

  console.log('\n📊 Балансы после инвестиции:')
  console.log('▶ Проект:', finalProject)
  console.log('▶ Сегмент:', segment)
  console.log('▶ Кошелек пользователя:', finalUserWallet)
  console.log('▶ Кошелек программы:', finalProgramWallet)

  // Проверка изменения балансов
  expect(parseFloat(finalUserWallet.blocked)).toBe(parseFloat(prevUserWallet.blocked) + parseFloat(investAmount))
  expect(parseFloat(finalProgramWallet.blocked)).toBe(parseFloat(prevProgramWallet.blocked) + parseFloat(investAmount))

  console.log(`\n✅ Инвестирование на ${investAmount} завершено успешно!`)

  return {
    investHash,
    invest: blockchainInvest,
    transactionId: approveInvestResult.transaction_id,
    prevProject,
    project: finalProject,
    segment,
  }
}
