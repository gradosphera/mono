import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { fakeDocument } from '../shared/fakeDocument'
import type Blockchain from '../../blockchain'
import { getCoopProgramWallet, getUserProgramWallet } from '../wallet/walletUtils'
import { getSegment } from './getSegment'
import { getProjectWallet } from './getProjectWallet'
import { capitalProgramId, walletProgramId } from './consts'
import { getProject } from './getProject'

/**
 * Функция для конвертации сегмента участника
 * @param blockchain экземпляр блокчейна
 * @param coopname название кооператива
 * @param username имя пользователя
 * @param projectHash хеш проекта
 * @param walletAmount сумма для конвертации в главный кошелек
 * @param capitalAmount сумма для конвертации в благорост
 * @param projectAmount сумма для конвертации в кошелек проекта
 */
export async function processConvertSegment(
  blockchain: Blockchain,
  coopname: string,
  username: string,
  projectHash: string,
  walletAmount: string,
  capitalAmount: string,
  projectAmount: string,
) {
  const convertHash = generateRandomSHA256()
  console.log(`\n🔹 Начало процесса конвертации сегмента: ${convertHash}`)

  // Получаем сегмент до конвертации
  const segmentBefore = await getSegment(blockchain, coopname, projectHash, username)
  console.log('📊 Сегмент до конвертации:', segmentBefore)

  // Получаем кошельки до конвертации
  const mainWalletBefore = await getCoopProgramWallet(blockchain, coopname, walletProgramId)
  const capitalWalletBefore = await getCoopProgramWallet(blockchain, coopname, capitalProgramId)
  const userCapitalWalletBefore = await getUserProgramWallet(blockchain, coopname, username, capitalProgramId)
  const projectWalletBefore = await getProjectWallet(blockchain, coopname, projectHash, username)
  const projectBefore = await getProject(blockchain, coopname, projectHash)

  console.log('💰 Кошельки до конвертации:')
  console.log('  ▶ Главный кошелек программы:', mainWalletBefore)
  console.log('  ▶ Глобальный кошелек программы благороста:', capitalWalletBefore)
  console.log('  ▶ Кошелек пользователя в программе благороста:', userCapitalWalletBefore)
  console.log('  ▶ Кошелек проекта:', projectWalletBefore)
  console.log('  ▶ Проект до конвертации: ', projectBefore)

  // 1. Конвертируем сегмент
  const convertSegmentData: CapitalContract.Actions.ConvertSegment.IConvertSegment = {
    coopname,
    username,
    project_hash: projectHash,
    convert_hash: convertHash,
    wallet_amount: walletAmount,
    capital_amount: capitalAmount,
    convert_statement: fakeDocument,
  }

  console.log(`\n🚀 Отправка транзакции ConvertSegment для ${username}`)
  console.log(`   В главный кошелек: ${walletAmount}`)
  console.log(`   В благорост: ${capitalAmount}`)
  console.log(`   В проект: ${projectAmount}`)

  const convertResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.ConvertSegment.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: convertSegmentData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(convertResult)
  expect(convertResult.transaction_id).toBeDefined()
  console.log('✅ Сегмент конвертирован:', convertHash)

  // Получаем сегмент после конвертации (должен быть удален)
  const segmentAfter = await getSegment(blockchain, coopname, projectHash, username)

  // Получаем кошельки после конвертации
  const mainWalletAfter = await getCoopProgramWallet(blockchain, coopname, walletProgramId)
  const capitalWalletAfter = await getCoopProgramWallet(blockchain, coopname, capitalProgramId)
  const userCapitalWalletAfter = await getUserProgramWallet(blockchain, coopname, username, capitalProgramId)
  const projectWalletAfter = await getProjectWallet(blockchain, coopname, projectHash, username)

  console.log('💰 Кошельки после конвертации:')
  console.log('  ▶ Главный кошелек программы:', mainWalletAfter)
  console.log('  ▶ Глобальный кошелек программы благороста:', capitalWalletAfter)
  console.log('  ▶ Кошелек пользователя в программе благороста:', userCapitalWalletAfter)
  console.log('  ▶ Кошелек проекта:', projectWalletAfter)

  // Проверяем что сегмент удален после конвертации
  expect(segmentAfter).toBeUndefined()
  console.log('🔍 Сегмент после конвертации: ', segmentAfter)

  // Проверяем изменения в кошельках
  console.log('\n🔍 Проверка изменений в кошельках:')

  // Проверяем главный кошелек программы (wallet_amount)
  if (walletAmount !== '0.0000 RUB') {
    const walletAmountValue = parseFloat(walletAmount.split(' ')[0])
    const beforeAvailable = mainWalletBefore ? parseFloat(mainWalletBefore.available.split(' ')[0]) : 0
    const afterAvailable = mainWalletAfter ? parseFloat(mainWalletAfter.available.split(' ')[0]) : 0
    const expectedIncrease = beforeAvailable + walletAmountValue
    console.log(`✅ Главный кошелек программы: ${beforeAvailable} → ${afterAvailable} (+${walletAmountValue})`)
    expect(afterAvailable).toBeCloseTo(expectedIncrease, 1)
  }

  // Проверяем глобальный кошелек программы благороста (capital_amount)
  // investor_base уже заблокирован в _capital_program при инвестировании (createinvest)
  // В capitalAmount теперь передается только чистая дельта интеллектуального вклада
  if (capitalAmount !== '0.0000 RUB') {
    const capitalAmountValue = parseFloat(capitalAmount.split(' ')[0])
    const actualCapitalIncrease = capitalAmountValue
    const beforeBlocked = capitalWalletBefore ? parseFloat(capitalWalletBefore.blocked.split(' ')[0]) : 0
    const afterBlocked = capitalWalletAfter ? parseFloat(capitalWalletAfter.blocked.split(' ')[0]) : 0
    const expectedIncrease = beforeBlocked + actualCapitalIncrease
    console.log(`✅ Глобальный кошелек программы благороста: ${beforeBlocked} → ${afterBlocked} (+${actualCapitalIncrease})`)
    expect(afterBlocked).toBeCloseTo(expectedIncrease, 1)
  }

  // Проверяем кошелек пользователя в программе благороста (capital_amount)
  if (capitalAmount !== '0.0000 RUB') {
    const capitalAmountValue = parseFloat(capitalAmount.split(' ')[0])
    const actualCapitalIncrease = capitalAmountValue
    const beforeBlocked = userCapitalWalletBefore ? parseFloat(userCapitalWalletBefore.blocked.split(' ')[0]) : 0
    const afterBlocked = userCapitalWalletAfter ? parseFloat(userCapitalWalletAfter.blocked.split(' ')[0]) : 0
    const expectedIncrease = beforeBlocked + actualCapitalIncrease
    console.log(`✅ Кошелек пользователя в программе благороста: ${beforeBlocked} → ${afterBlocked} (+${actualCapitalIncrease})`)
    expect(afterBlocked).toBeCloseTo(expectedIncrease, 1)
  }

  // Проверяем кошелек проекта (project_amount)
  if (projectAmount !== '0.0000 RUB' && projectBefore.parent_hash.includes('0000000000')) {
    const projectAmountValue = parseFloat(projectAmount.split(' ')[0])
    const beforeShares = projectWalletBefore ? parseFloat(projectWalletBefore.shares.split(' ')[0]) : 0
    const afterShares = projectWalletAfter ? parseFloat(projectWalletAfter.shares.split(' ')[0]) : 0
    const expectedIncrease = beforeShares + projectAmountValue
    console.log(`✅ Кошелек проекта: ${beforeShares} → ${afterShares} (+${projectAmountValue})`)
    expect(afterShares).toBeCloseTo(expectedIncrease, 1)
  }

  console.log('\n📊 Результаты после конвертации сегмента:')
  console.log('▶ Сегмент до:', segmentBefore)
  console.log('▶ Сегмент после удалён: ', segmentAfter)

  console.log(`\n✅ Процесс конвертации сегмента завершен успешно!`)

  return {
    convertHash,
    segmentBefore,
    segmentAfter,
    mainWalletBefore,
    mainWalletAfter,
    capitalWalletBefore,
    capitalWalletAfter,
    userCapitalWalletBefore,
    userCapitalWalletAfter,
    projectWalletBefore,
    projectWalletAfter,
    transactionId: convertResult.transaction_id,
  }
}
