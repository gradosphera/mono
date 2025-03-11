import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { fakeDocument } from '../soviet/fakeDocument'

export async function registerAndApproveUHDContract(
  blockchain: any,
  username: string,
  project_hash: string,
) {
  const info = await blockchain.getInfo()
  console.log(`Регистрация договора УХД для ${username}, блок: ${info.head_block_time}`)

  // Регистрация контрибьютора
  const registerData: CapitalContract.Actions.RegisterContributor.IRegisterContributor = {
    coopname: 'voskhod',
    application: 'voskhod',
    project_hash,
    username,
    created_at: info.head_block_time,
    agreement: fakeDocument,
    convert_percent: 0,
    rate_per_hour: '1000.0000 RUB',
  }

  const registerResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.RegisterContributor.actionName,
          authorization: [{ actor: 'voskhod', permission: 'active' }],
          data: registerData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )
  getTotalRamUsage(registerResult)
  expect(registerResult.transaction_id).toBeDefined()

  let contributor = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    'voskhod',
    'contributors',
    1,
    username,
    username,
    2,
    'i64',
  ))[0]

  console.log(`Контрибьютор ${username} после регистрации: `, contributor)
  expect(contributor).toBeDefined()

  // Утверждение регистрации
  const approveData: CapitalContract.Actions.ApproveRegister.IApproveRegister = {
    coopname: 'voskhod',
    application: 'voskhod',
    project_hash,
    username,
    approver: 'ant',
    approved_agreement: fakeDocument,
  }

  const approveResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.ApproveRegister.actionName,
          authorization: [{ actor: 'voskhod', permission: 'active' }],
          data: approveData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )
  getTotalRamUsage(approveResult)
  expect(approveResult.transaction_id).toBeDefined()

  contributor = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    'voskhod',
    'contributors',
    1,
    username,
    username,
    2,
    'i64',
  ))[0]

  console.log(`Контрибьютор ${username} после утверждения: `, contributor)
  expect(contributor).toBeDefined()
  expect(contributor.status).toBe('approved')

  return contributor
}
