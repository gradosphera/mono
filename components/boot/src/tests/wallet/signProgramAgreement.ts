import { expect } from 'vitest'
import { WalletContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { getCoopProgramWallet } from './walletUtils'

interface UserProgramAgreement {
  program_id: number | string
  doc_hash: string
  version: number | string
  draft_id: number | string
  signed_at: string
}

interface WalletUserRecord {
  username: string
  programs: UserProgramAgreement[]
}

// Подписание программного соглашения через `wallet::signagree` (ADR-008, Эпик 2).
// После компонента 48 `soviet::sndagreement` отказывается на program_id > 0 —
// программные соглашения переехали в контракт wallet, источник правды
// «участник ЦПП X» = `wallet::users[username].programs[]`.
//
// Auth: coopname@active (или любой системный контракт из contracts_whitelist
// контракта wallet). В boot-тестах ключ кооператива всегда есть в keychain,
// подписываем coopname'ом.
export async function signProgramAgreement(
  blockchain: any,
  coopname: string,
  username: string,
  program_id: number,
  draft_id: number,
  document: any,
) {
  const data: WalletContract.Actions.SignAgreement.ISignAgreement = {
    coopname,
    username,
    program_id,
    document,
    draft_id,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: WalletContract.contractName.production,
          name: WalletContract.Actions.SignAgreement.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )

  getTotalRamUsage(result)
  expect(result.transaction_id).toBeDefined()

  const userRows = await blockchain.getTableRows(
    WalletContract.contractName.production,
    coopname,
    WalletContract.Tables.Users.tableName,
    1000,
  ) as WalletUserRecord[]

  const userRecord = userRows.find(r => r.username === username)
  expect(
    userRecord,
    `wallet::users[${coopname}, ${username}] должен быть создан после signagree`,
  ).toBeDefined()
  const signedProgram = userRecord!.programs.find(p => Number(p.program_id) === program_id)
  expect(
    signedProgram,
    `wallet::users[${username}].programs[] должен содержать program_id=${program_id}`,
  ).toBeDefined()

  const program = await getCoopProgramWallet(blockchain, coopname, program_id)
  expect(
    program,
    `soviet::programs[${coopname}, ${program_id}] должна существовать`,
  ).toBeDefined()

  return {
    txId: result.transaction_id,
    wallet: { username, ...signedProgram! },
    program,
  }
}
