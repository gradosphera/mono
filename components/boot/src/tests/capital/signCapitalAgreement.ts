import { expect } from 'vitest'
import { signAgreement } from '../soviet/signAgreement'
import { getCoopProgramWallet, getUserProgramWallet } from '../wallet/walletUtils'
import { capitalProgramId } from './consts'

export async function signCapitalAgreement(
  blockchain: any,
  coopname: string,
  username: string,
  fakeDocument: any,
) {
  const txId = await signAgreement(blockchain, coopname, username, 'source', fakeDocument)

  const wallet = await getUserProgramWallet(blockchain, coopname, username, capitalProgramId)

  expect(wallet).toEqual(expect.objectContaining({
    coopname,
    username,
    available: expect.any(String),
    blocked: expect.any(String),
    program_id: capitalProgramId,
    membership_contribution: expect.any(String),
  }))

  const program = await getCoopProgramWallet(blockchain, coopname, capitalProgramId)

  return { wallet, program, txId }
}
