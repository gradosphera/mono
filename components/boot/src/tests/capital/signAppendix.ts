import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { fakeDocument } from '../shared/fakeDocument'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { processApprove } from './processApprove'

export async function signAppendix(
  blockchain: any,
  coopname: string,
  username: string,
  projectHash: string,
  appendixHash: string,
) {
  // Подписание приложения пайщиком (через кооператив, как и в контракте)
  const data: CapitalContract.Actions.GetClearance.IGetClearance = {
    coopname,
    username,
    project_hash: projectHash,
    appendix_hash: appendixHash,
    document: fakeDocument,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.GetClearance.actionName,
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

  // Аппрув председателя (через совет) по хэшу приложения
  await processApprove(blockchain, coopname, appendixHash)

  // Проверяем, что приложение применилось к контрибьютору, а запись удалена
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
  expect(contributor.appendixes).toContain(projectHash)
}
