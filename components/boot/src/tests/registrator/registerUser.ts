import { GatewayContract, RegistratorContract, SovietContract } from 'cooptypes'
import { expect } from 'vitest'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { processDecision } from '../soviet/processDecision'
import { getParticipant } from '../registrator/getParticipant'
import { fakeDocument } from '../soviet/fakeDocument'
import { compareTokenAmounts, getCoopWallet } from '../wallet/walletUtils'

export async function registerUser(blockchain: any, coopname: string, username: string) {
  const registration_hash = generateRandomSHA256()

  const account = await blockchain.generateKeypair(username, undefined, 'Аккаунт кооператива')

  // 🔹 Получаем балансы до регистрации
  const prevCoopWallet = await getCoopWallet(blockchain, coopname)
  const prevAvailable = prevCoopWallet?.circulating_account?.available || '0.0000 RUB'
  const prevInitial = prevCoopWallet?.initial_account?.available || '0.0000 RUB'
  console.log('📦 CoopWallet BEFORE:', prevCoopWallet)

  // 🔹 1. Создание аккаунта
  {
    const data: RegistratorContract.Actions.CreateAccount.ICreateAccount = {
      coopname,
      referer: '',
      username,
      public_key: account.publicKey,
      meta: '',
    }

    const result = await blockchain.api.transact({
      actions: [{
        account: RegistratorContract.contractName.production,
        name: RegistratorContract.Actions.CreateAccount.actionName,
        authorization: [{ actor: coopname, permission: 'active' }],
        data,
      }],
    }, { blocksBehind: 3, expireSeconds: 30 })

    getTotalRamUsage(result)
    console.log('✅ Аккаунт создан')
  }

  // 🔹 2. Регистрация пайщика
  {
    const data: RegistratorContract.Actions.RegisterUser.IRegisterUser = {
      coopname,
      braname: '',
      username,
      type: 'individual',
      statement: fakeDocument,
      registration_hash,
    }

    const result = await blockchain.api.transact({
      actions: [{
        account: RegistratorContract.contractName.production,
        name: RegistratorContract.Actions.RegisterUser.actionName,
        authorization: [{ actor: coopname, permission: 'active' }],
        data,
      }],
    }, { blocksBehind: 3, expireSeconds: 30 })

    getTotalRamUsage(result)
    console.log('✅ Пайщик зарегистрирован')
  }

  // 🔹 3. Подтверждение прихода
  {
    const data: GatewayContract.Actions.CompleteIncome.ICompeteIncome = {
      coopname,
      income_hash: registration_hash,
    }

    const result = await blockchain.api.transact({
      actions: [{
        account: GatewayContract.contractName.production,
        name: GatewayContract.Actions.CompleteIncome.actionName,
        authorization: [{ actor: coopname, permission: 'active' }],
        data,
      }],
    }, { blocksBehind: 3, expireSeconds: 30 })

    getTotalRamUsage(result)
    console.log('✅ Приход подтвержден')
  }

  // 🔹 4. Исполнение решения
  const decisions = await blockchain.getTableRows(
    SovietContract.contractName.production,
    coopname,
    'decisions',
    1000,
  )
  const lastDecision = decisions.at(-1)
  console.log('📜 Последнее решение:', lastDecision)
  await processDecision(blockchain, lastDecision.id)
  console.log('✅ Решение выполнено')

  // 🔹 5. Проверка участника
  const participant = await getParticipant(blockchain, coopname, username)
  console.log('🙋 Участник:', participant)

  expect(participant).toBeDefined()
  expect(participant.has_vote).toBe(1)
  expect(participant.status).toBe('accepted')
  expect(participant.username).toBe(username)

  // 🔹 6. Проверка балансов после регистрации
  const coopWalletAfter = await getCoopWallet(blockchain, coopname)
  const newAvailable = coopWalletAfter?.circulating_account?.available || '0.0000 RUB'
  const newInitial = coopWalletAfter?.initial_account?.available || '0.0000 RUB'

  console.log('💰 CoopWallet AFTER:', coopWalletAfter)

  const minAmount = parseFloat(participant.minimum_amount.split(' ')[0])
  const initAmount = parseFloat(participant.initial_amount.split(' ')[0])

  compareTokenAmounts(prevAvailable, newAvailable, minAmount)
  compareTokenAmounts(prevInitial, newInitial, initAmount)

  return participant
}
