import { FundContract, GatewayContract, SovietContract, WalletContract } from 'cooptypes'
import { expect } from 'vitest'
import type Blockchain from '../../blockchain'

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

export async function getDeposit(blockchain: Blockchain, coopname: string, deposit_hash: string) {
  return (await blockchain.getTableRows(
    WalletContract.contractName.production,
    coopname,
    WalletContract.Tables.Deposits.tableName,
    1,
    deposit_hash,
    deposit_hash,
    2,
    'sha256',
  ))[0]
}

export function compareTokenAmounts(prevAmount: string, currentAmount: string, expectedIncrease: number): void {
  const prev = parseFloat(prevAmount.split(' ')[0])
  const current = parseFloat(currentAmount.split(' ')[0])
  const expected = prev + expectedIncrease

  expect(current).toBe(expected)
}
