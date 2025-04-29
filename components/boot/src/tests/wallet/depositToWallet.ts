import { randomInt } from 'node:crypto'
import { GatewayContract, WalletContract } from 'cooptypes'
import { expect } from 'vitest'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { compareTokenAmounts, getCoopProgramWallet, getCoopWallet, getDeposit, getUserProgramWallet } from './walletUtils'

export async function depositToWallet(blockchain: any, coopname: string, username: string, amount: number) {
  const depositId = randomInt(100000)

  const data: WalletContract.Actions.CreateDeposit.ICreateDeposit = {
    coopname,
    username,
    deposit_hash: generateRandomSHA256(),
    quantity: `${amount.toFixed(4)} RUB`,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: WalletContract.contractName.production,
          name: WalletContract.Actions.CreateDeposit.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
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

  const deposit = await getDeposit(blockchain, coopname, data.deposit_hash)

  expect(deposit).toMatchObject({
    deposit_hash: data.deposit_hash,
    username,
    coopname,
    quantity: `${amount.toFixed(4)} RUB`,
    status: 'pending',
  })

  const prevUserWallet = await getUserProgramWallet(blockchain, coopname, username, 1)
  const prevUserWalletAvailable = prevUserWallet?.available || '0.0000 RUB'

  const prevCoopWallet = await getCoopWallet(blockchain, coopname)
  const prevCoopWalletAvailable = prevCoopWallet?.circulating_account?.available || '0.0000 RUB'

  const data2: GatewayContract.Actions.CompleteIncome.ICompleteIncome = {
    coopname,
    income_hash: data.deposit_hash,
  }

  const result2 = await blockchain.api.transact(
    {
      actions: [
        {
          account: GatewayContract.contractName.production,
          name: GatewayContract.Actions.CompleteIncome.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: data2,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(result2)

  const deposit2 = await getDeposit(blockchain, coopname, data.deposit_hash)
  expect(deposit2).toBeUndefined()

  const program = await getCoopProgramWallet(blockchain, coopname, 1)

  const userWallet = await getUserProgramWallet(blockchain, coopname, username, 1)
  console.log('▶ Кошелёк пользователя после пополнения: ', userWallet)

  // Проверяем изменение балансов
  compareTokenAmounts(prevUserWalletAvailable, userWallet.available, amount)
  compareTokenAmounts(prevCoopWalletAvailable, (await getCoopWallet(blockchain, coopname)).circulating_account.available, amount)

  return { depositId, program, userWallet }
}
