import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { fakeDocument } from '../shared/fakeDocument'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { processApprove } from './processApprove'

export async function registerContributor(
  blockchain: any,
  coopname: string,
  username: string,
  contributorHash: string,
  ratePerHour: string,
  hoursPerDay: number = 8,
) {
  const contract = fakeDocument
  contract.signatures[0].signer = username
  const data: CapitalContract.Actions.RegisterContributor.IRegisterContributor = {
    coopname,
    username,
    contributor_hash: contributorHash,
    rate_per_hour: ratePerHour,
    hours_per_day: hoursPerDay,
    is_external_contract: false,
    contract,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.RegisterContributor.actionName,
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

  // Аппрув председателя (через совет) по хэшу договора УХД
  await processApprove(blockchain, coopname, contributorHash)

  // Проверяем, что контрибьютор активирован и договор сохранён
  const contributor = (
    await blockchain.getTableRows(
      CapitalContract.contractName.production,
      coopname,
      'contributors',
      1,
      username,
      username,
      2,
      'i64',
    )
  )[0]

  expect(contributor).toBeDefined()
  expect(contributor.status).toBe('active')
  expect(contributor.contract).toBeDefined()
}
