import { FundContract, GatewayContract, SovietContract } from 'cooptypes'
import { expect } from 'vitest'

export async function getUserProgramWallet(blockchain: any, coopname: string, username: string, program_id: number) {
  const wallets = await blockchain.getTableRows(
    SovietContract.contractName.production,
    coopname,
    'progwallets',
    100,
    username,
    username,
    2,
  )

  return wallets.find((el: any) => el.program_id === program_id)
}

export async function getCoopProgramWallet(blockchain: any, coopname: string, program_id: number) {
  const program = await blockchain.getTableRows(
    SovietContract.contractName.production,
    coopname,
    'programs',
    1000,
    program_id.toString(),
    program_id.toString(),
  )
  console.log('PROGRAMS:', program)
  return program[0]
}

export async function getCoopWallet(blockchain: any, coopname: string) {
  return (await blockchain.getTableRows(
    FundContract.contractName.production,
    coopname,
    'coopwallet',
    1,
  ))[0]
}

export async function getDeposit(blockchain: any, coopname: string, deposit_id: number) {
  return (await blockchain.getTableRows(
    GatewayContract.contractName.production,
    coopname,
    'deposits',
    1,
    deposit_id.toString(),
    deposit_id.toString(),
  ))[0]
}

export function compareTokenAmounts(prevAmount: string, currentAmount: string, expectedIncrease: number): void {
  const prev = parseFloat(prevAmount.split(' ')[0])
  const current = parseFloat(currentAmount.split(' ')[0])
  const expected = prev + expectedIncrease

  expect(current).toBe(expected)
}
