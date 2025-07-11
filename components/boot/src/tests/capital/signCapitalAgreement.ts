import { expect } from 'vitest'
import { signAgreement } from '../soviet/signAgreement'
import { getCoopProgramWallet, getUserProgramWallet } from '../wallet/walletUtils'
import { capitalProgramName, sourceProgramId } from './consts'

export async function signCapitalAgreement(
  blockchain: any,
  coopname: string,
  username: string,
  fakeDocument: any,
) {
  const txId = await signAgreement(blockchain, coopname, username, capitalProgramName, fakeDocument)

  const wallet = await getUserProgramWallet(blockchain, coopname, username, sourceProgramId)

  expect(wallet).toEqual(expect.objectContaining({
    coopname,
    username,
    available: expect.any(String),
    blocked: expect.any(String),
    program_id: sourceProgramId,
    membership_contribution: expect.any(String),
  }))

  const program = await getCoopProgramWallet(blockchain, coopname, sourceProgramId)

  return { wallet, program, txId }
}
