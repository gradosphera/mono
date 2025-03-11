import { randomInt } from 'node:crypto'
import { GatewayContract } from 'cooptypes'
import { expect } from 'vitest'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { compareTokenAmounts, getCoopProgramWallet, getCoopWallet, getDeposit, getUserProgramWallet } from './walletUtils'

export async function depositToWallet(blockchain: any, coopname: string, username: string, amount: number) {
  const depositId = randomInt(100000)

  const data: GatewayContract.Actions.CreateDeposit.ICreateDeposit = {
    coopname,
    username,
    deposit_id: depositId,
    type: 'deposit',
    quantity: `${amount.toFixed(4)} RUB`,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: GatewayContract.contractName.production,
          name: GatewayContract.Actions.CreateDeposit.actionName,
          authorization: [{ actor: username, permission: 'active' }],
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

  const deposit = await getDeposit(blockchain, coopname, depositId)

  expect(deposit).toEqual(expect.objectContaining({
    id: depositId,
    username,
    coopname,
    type: 'deposit',
    quantity: `${amount.toFixed(4)} RUB`,
    status: 'pending',
  }))

  const prevUserWallet = await getUserProgramWallet(blockchain, coopname, username, 1)
  const prevUserWalletAvailable = prevUserWallet?.available || '0.0000 RUB'

  const prevCoopWallet = await getCoopWallet(blockchain, coopname)
  const prevCoopWalletAvailable = prevCoopWallet?.circulating_account?.available || '0.0000 RUB'

  const data2: GatewayContract.Actions.CompleteDeposit.ICompleteDeposit = {
    coopname,
    admin: coopname,
    deposit_id: depositId,
    memo: '',
  }

  const result2 = await blockchain.api.transact(
    {
      actions: [
        {
          account: GatewayContract.contractName.production,
          name: GatewayContract.Actions.CompleteDeposit.actionName,
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
  const deposit2 = await getDeposit(blockchain, coopname, depositId)
  expect(deposit2.status).toBe('completed')

  const program = await getCoopProgramWallet(blockchain, coopname, 1)

  const userWallet = await getUserProgramWallet(blockchain, coopname, username, 1)

  // Проверяем изменение балансов
  compareTokenAmounts(prevUserWalletAvailable, userWallet.available, amount)
  compareTokenAmounts(prevCoopWalletAvailable, (await getCoopWallet(blockchain, coopname)).circulating_account.available, amount)

  return { depositId, program, userWallet }
}
