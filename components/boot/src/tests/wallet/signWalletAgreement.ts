import { expect } from 'vitest'
import { signAgreement } from '../soviet/signAgreement'
import { getCoopProgramWallet, getUserProgramWallet } from './walletUtils'

export async function signWalletAgreement(
  blockchain: any,
  coopname: string,
  username: string,
  fakeDocument: any,
) {
  const txId = await signAgreement(blockchain, coopname, username, 'wallet', fakeDocument)

  const wallet = await getUserProgramWallet(blockchain, coopname, username, 1)
  expect(wallet).toEqual(expect.objectContaining({
    coopname,
    username,
    available: expect.any(String),
    blocked: expect.any(String),
    program_id: 1,
    membership_contribution: expect.any(String),
  }))

  const program = await getCoopProgramWallet(blockchain, coopname, 1)

  return { wallet, program, txId }
}
