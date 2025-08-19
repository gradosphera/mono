import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { getCoopProgramWallet, getLedgerAccountById } from '../wallet/walletUtils'
import { processLastDecision } from '../soviet/processLastDecision'
import { processApprove } from './processApprove'
import { capitalProgramId, circulationAccountId } from './consts'

export async function processCreateProgramProperty(
  blockchain: Blockchain,
  data: CapitalContract.Actions.CreateProgramProperty.ICreateProgramProperty,
  fakeDocument: any,
) {
  const { coopname, username, property_hash } = data

  // Состояния до: кошелек программы капитализации и паевой счет в бухгалтерии
  const programWalletBefore = await getCoopProgramWallet(blockchain, coopname, capitalProgramId)
  const ledgerShareBefore = await getLedgerAccountById(blockchain, coopname, circulationAccountId)

  // 1) Создаём программное предложение имущественного взноса
  const txCreate = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CreateProgramProperty.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )
  getTotalRamUsage(txCreate)
  expect(txCreate.transaction_id).toBeDefined()

  // 2) Подтверждение одобрения председателем (через soviet)
  await processApprove(blockchain as any, coopname, property_hash as unknown as string)

  // 3) Обработка решения совета (AUTHORIZE_PROGRAM_PROPERTY)
  await processLastDecision(blockchain, coopname)

  // 4) Акт 1 — подписывает участник-вноситель (username)
  fakeDocument.signatures[0].signer = username
  const act1Data = {
    coopname,
    username,
    property_hash,
    act: fakeDocument,
  } as CapitalContract.Actions.Act1ProgramProperty.IAct1ProgramProperty

  const txAct1 = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.Act1ProgramProperty.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: act1Data,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )
  getTotalRamUsage(txAct1)
  expect(txAct1.transaction_id).toBeDefined()

  // 5) Акт 2 — подписывает председатель совета кооператива ('ant')
  fakeDocument.signatures[0].signer = 'ant'

  const act2Data = {
    coopname,
    property_hash,
    username: 'ant',
    act: fakeDocument,
  } as CapitalContract.Actions.Act2ProgramProperty.IAct2ProgramProperty

  const txAct2 = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.Act2ProgramProperty.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: act2Data,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )
  getTotalRamUsage(txAct2)
  expect(txAct2.transaction_id).toBeDefined()

  // Состояния после
  const programWalletAfter = await getCoopProgramWallet(blockchain, coopname, capitalProgramId)
  const ledgerShareAfter = await getLedgerAccountById(blockchain, coopname, circulationAccountId)

  return {
    propertyHash: property_hash,
    txCreateId: txCreate.transaction_id,
    txAct1Id: txAct1.transaction_id,
    txAct2Id: txAct2.transaction_id,
    programWalletBefore,
    programWalletAfter,
    ledgerShareBefore,
    ledgerShareAfter,
  }
}
