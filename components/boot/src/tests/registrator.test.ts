import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { GatewayContract, RegistratorContract, SovietContract } from 'cooptypes'
import { sha256 } from 'eosjs/dist/eosjs-key-conversions'
import Blockchain from '../blockchain'
import config from '../configs'
import { getTotalRamUsage, globalRamStats } from '../utils/getTotalRamUsage'
import { addUser } from '../init/participant'
import { generateRandomUsername } from '../utils/randomUsername'
import { generateRandomSHA256 } from '../utils/randomHash'
import { signWalletAgreement } from './wallet/signWalletAgreement'
import { depositToWallet } from './wallet/depositToWallet'
import { processDecision } from './soviet/processDecision'
import { getParticipant } from './registrator/getParticipant'
import { registerUser } from './registrator/registerUser'

const blockchain = new Blockchain(config.network, config.private_keys)
let tester1: string
const walletProgramStates1: any[] = []

const fakeDocument = {
  hash: '157192B276DA23CC84AB078FC8755C051C5F0430BF4802E55718221E6B76C777',
  public_key: 'PUB_K1_5JhMfxbsNebajHcTEK8yC9uNN9Dit9hEmzE8ri8yMhhzzEtUA4',
  signature: 'SIG_K1_KmKWPBC8dZGGDGhbKEoZEzPr3h5crRrR2uLdGRF5DJbeibY1MY1bZ9sPwHsgmPfiGFv9psfoCVsXFh9TekcLuvaeuxRKA8',
  meta: '{}',
}

beforeAll(async () => {
  await blockchain.update_pass_instance()
}, 500_000)

afterAll(() => {
  console.log('\n📊 **RAM USAGE SUMMARY** 📊')
  let totalGlobalRam = 0

  for (const [key, ramUsed] of Object.entries(globalRamStats)) {
    console.log(`  ${key} = ${(ramUsed / 1024).toFixed(2)} kb`)
    totalGlobalRam += ramUsed
  }

  console.log(`\n💾 **TOTAL RAM USED IN TESTS**: ${(totalGlobalRam / 1024).toFixed(2)} kb\n`)
})

describe('тест Registrator', () => {
  it('регистируем пайщика 1', async () => {
    const coopname = 'voskhod'
    const tester1 = generateRandomUsername()

    await registerUser(blockchain, coopname, tester1)
  })

  it('регистируем пайщика 2', async () => {
    const coopname = 'voskhod'
    const tester2 = generateRandomUsername()

    await registerUser(blockchain, coopname, tester2)
  })
})
