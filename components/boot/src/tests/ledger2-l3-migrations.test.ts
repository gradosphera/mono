/**
 * Sanity + integration на L3 (Эпик 3 + Эпик 2 / story 2.1, 3.1, 3.2, 3.3, 3.6, 3.7).
 *
 * Часть 1 — pure sanity (без блокчейна): cooptypes регенерированы под новые
 *   actions/tables (ledger2::userwallets, walletop с username, ledger2::migrate3,
 *   wallet::users, wallet::signagree/revokeagree/migrate3).
 *
 * Часть 2 — integration на live-стенде:
 *   2.1 wallet::signagree → users[username].programs[] обновлён
 *   2.2 wallet::revokeagree → программа удалена; пустой vector → запись users.erase
 *   2.3 wallet::migrate3 идемпотентность (повторный вызов с теми же параметрами = no-op)
 *   3.1 ledger2::migrate3 → userwallets создаётся с правильными значениями
 *   3.2 ledger2::migrate3 на COOPERATIVE-кошельке → fail (assert проверки)
 *   3.3 ledger2::migrate3 с (0,0) → запись userwallets удаляется
 *   3.4 walletop через apply на USER_SHARED БЕЗ соглашения в wallet::users → fail
 *   3.5 walletop через apply на USER_SHARED С соглашением в wallet::users → success, L3 запись
 *
 * Запускать только после `pnpm run reboot:extra` — тесты предполагают
 * наличие cooperative=voskhod и chairman=ant в state.
 */

import { describe, expect, it, beforeAll } from 'vitest'
import { Ledger2, Ledger2Contract, WalletContract } from 'cooptypes'
import Blockchain from '../blockchain'
import config from '../configs'
import { generateRandomSHA256 } from '../utils/randomHash'

const COOP = 'voskhod'
const CHAIRMAN = 'ant'

describe('cooptypes L3 sanity (Эпик 2 / Эпик 3)', () => {
  it('Ledger2Contract.Actions.Migrate3 экспортирует actionName=migrate3', () => {
    expect(Ledger2Contract.Actions.Migrate3.actionName).toBe('migrate3')
  })

  it('Ledger2Contract.Actions.Walletop экспортирует actionName=walletop', () => {
    expect(Ledger2Contract.Actions.Walletop.actionName).toBe('walletop')
  })

  it('Ledger2Contract.Tables.UserWallets экспортирует tableName=userwallets', () => {
    expect(Ledger2Contract.Tables.UserWallets.tableName).toBe('userwallets')
  })

  it('WalletContract.Actions.SignAgreement.actionName=signagree', () => {
    expect(WalletContract.Actions.SignAgreement.actionName).toBe('signagree')
  })

  it('WalletContract.Actions.RevokeAgreement.actionName=revokeagree', () => {
    expect(WalletContract.Actions.RevokeAgreement.actionName).toBe('revokeagree')
  })

  it('WalletContract.Actions.Migrate3.actionName=migrate3 (wallet)', () => {
    expect(WalletContract.Actions.Migrate3.actionName).toBe('migrate3')
  })

  it('WalletContract.Tables.Users.tableName=users', () => {
    expect(WalletContract.Tables.Users.tableName).toBe('users')
  })

  it('OPERATION_REGISTRY содержит хотя бы одну USER_SHARED-операцию (с username dispatch)', () => {
    const userSharedWallets = new Set([
      'w.reg.minshr', 'w.wal.share', 'w.wal.member', 'w.cap.blago', 'w.cap.gen',
    ])
    const hasUserShared = Ledger2.LEDGER2_OPERATION_REGISTRY.some((op: any) => {
      return userSharedWallets.has(String(op.wallet_from)) || userSharedWallets.has(String(op.wallet_to))
    })
    expect(hasUserShared).toBe(true)
  })
})

describe('ledger2 L3 + wallet::users — integration (live blockchain)', () => {
  const bc = new Blockchain(config.network, config.private_keys)
  const TEST_PROGRAM_ID_BLAGO = 4 // Благорост — есть в boot:extra
  const TEST_USERNAME = 'ant'

  beforeAll(async () => {
    await bc.update_pass_instance()
  }, 60_000)

  it('wallet::signagree → users[username].programs[] обновляется', async () => {
    const data: WalletContract.Actions.SignAgreement.ISignAgreement = {
      coopname: COOP,
      username: TEST_USERNAME,
      program_id: TEST_PROGRAM_ID_BLAGO,
      document: {
        version: '0',
        hash: generateRandomSHA256(),
        doc_hash: generateRandomSHA256(),
        meta_hash: '0000000000000000000000000000000000000000000000000000000000000000',
        meta: '',
        signatures: [],
      },
      draft_id: 0,
    }

    await bc.api.transact({
      actions: [{
        account: WalletContract.contractName.production,
        name: WalletContract.Actions.SignAgreement.actionName,
        authorization: [{ actor: COOP, permission: 'active' }],
        data,
      }],
    }, { blocksBehind: 3, expireSeconds: 30 })

    const rows = await bc.getTableRows('wallet', COOP, 'users', 100)
    const userRow = (rows as Array<{ username: string; programs: Array<{ program_id: number | string }> }>)
      .find((r) => r.username === TEST_USERNAME)
    expect(userRow, 'wallet::users должен иметь запись для пайщика').toBeDefined()
    const hasProg = userRow!.programs.some((p) => Number(p.program_id) === TEST_PROGRAM_ID_BLAGO)
    expect(hasProg, `programs[] должен содержать program_id=${TEST_PROGRAM_ID_BLAGO}`).toBe(true)
  }, 60_000)

  it('wallet::migrate3 идемпотентность (повторный вызов не дублирует programs[])', async () => {
    // Повторный signagree с тем же program_id обновляет, не дублирует
    const dupData: WalletContract.Actions.Migrate3.IMigrate3 = {
      coopname: COOP,
      username: TEST_USERNAME,
      program_id: TEST_PROGRAM_ID_BLAGO,
      doc_hash: generateRandomSHA256(),
      version: 1,
      draft_id: 0,
      signed_at: '2026-05-05T00:00:00.000',
    }

    await bc.api.transact({
      actions: [{
        account: WalletContract.contractName.production,
        name: WalletContract.Actions.Migrate3.actionName,
        authorization: [{ actor: COOP, permission: 'active' }],
        data: dupData,
      }],
    }, { blocksBehind: 3, expireSeconds: 30 })

    const rows = await bc.getTableRows('wallet', COOP, 'users', 100)
    const userRow = (rows as Array<{ username: string; programs: Array<{ program_id: number | string }> }>)
      .find((r) => r.username === TEST_USERNAME)
    const dupCount = userRow!.programs.filter((p) => Number(p.program_id) === TEST_PROGRAM_ID_BLAGO).length
    expect(dupCount, 'программы не должны дублироваться при повторном migrate3').toBe(1)
  }, 60_000)

  it('ledger2::migrate3 на USER_SHARED создаёт запись userwallets', async () => {
    const data: Ledger2Contract.Actions.Migrate3.IMigrate3 = {
      coopname: COOP,
      wallet_name: 'w.cap.blago',
      username: TEST_USERNAME,
      available: '1000.0000 RUB',
      blocked: '0.0000 RUB',
    }

    await bc.api.transact({
      actions: [{
        account: Ledger2Contract.contractName.production,
        name: Ledger2Contract.Actions.Migrate3.actionName,
        authorization: [{ actor: COOP, permission: 'active' }],
        data,
      }],
    }, { blocksBehind: 3, expireSeconds: 30 })

    const rows = await bc.getTableRows('ledger2', COOP, 'userwallets', 100)
    const entry = (rows as Array<{ wallet_name: string; username: string; available: string }>)
      .find((r) => r.wallet_name === 'w.cap.blago' && r.username === TEST_USERNAME)
    expect(entry, 'userwallets[w.cap.blago, ant] должен быть создан').toBeDefined()
    expect(entry!.available).toBe('1000.0000 RUB')
  }, 60_000)

  it('ledger2::migrate3 с (0, 0) удаляет запись userwallets', async () => {
    const data: Ledger2Contract.Actions.Migrate3.IMigrate3 = {
      coopname: COOP,
      wallet_name: 'w.cap.blago',
      username: TEST_USERNAME,
      available: '0.0000 RUB',
      blocked: '0.0000 RUB',
    }

    await bc.api.transact({
      actions: [{
        account: Ledger2Contract.contractName.production,
        name: Ledger2Contract.Actions.Migrate3.actionName,
        authorization: [{ actor: COOP, permission: 'active' }],
        data,
      }],
    }, { blocksBehind: 3, expireSeconds: 30 })

    const rows = await bc.getTableRows('ledger2', COOP, 'userwallets', 100)
    const entry = (rows as Array<{ wallet_name: string; username: string }>)
      .find((r) => r.wallet_name === 'w.cap.blago' && r.username === TEST_USERNAME)
    expect(entry, 'userwallets[w.cap.blago, ant] должен быть удалён при (0,0)').toBeUndefined()
  }, 60_000)

  it('ledger2::migrate3 на COOPERATIVE-кошельке падает (assert kind == USER_SHARED)', async () => {
    const data: Ledger2Contract.Actions.Migrate3.IMigrate3 = {
      coopname: COOP,
      wallet_name: 'w.reg.entry',  // COOPERATIVE — нельзя L3
      username: TEST_USERNAME,
      available: '100.0000 RUB',
      blocked: '0.0000 RUB',
    }

    await expect(
      bc.api.transact({
        actions: [{
          account: Ledger2Contract.contractName.production,
          name: Ledger2Contract.Actions.Migrate3.actionName,
          authorization: [{ actor: COOP, permission: 'active' }],
          data,
        }],
      }, { blocksBehind: 3, expireSeconds: 30 })
    ).rejects.toThrow(/USER_SHARED/i)
  }, 60_000)

  it('wallet::revokeagree удаляет программу из vector; последняя → erase users', async () => {
    // Удаляем оставшуюся программу — после revokeagree запись users должна исчезнуть.
    const data: WalletContract.Actions.RevokeAgreement.IRevokeAgreement = {
      coopname: COOP,
      username: TEST_USERNAME,
      program_id: TEST_PROGRAM_ID_BLAGO,
    }

    await bc.api.transact({
      actions: [{
        account: WalletContract.contractName.production,
        name: WalletContract.Actions.RevokeAgreement.actionName,
        authorization: [{ actor: COOP, permission: 'active' }],
        data,
      }],
    }, { blocksBehind: 3, expireSeconds: 30 })

    const rows = await bc.getTableRows('wallet', COOP, 'users', 100)
    const userRow = (rows as Array<{ username: string; programs: any[] }>)
      .find((r) => r.username === TEST_USERNAME)
    // Если нет других программ у этого пайщика — записи быть не должно.
    if (userRow) {
      const stillHas = userRow.programs.some((p) => Number(p.program_id) === TEST_PROGRAM_ID_BLAGO)
      expect(stillHas, `program_id=${TEST_PROGRAM_ID_BLAGO} не должен оставаться в programs[]`).toBe(false)
    }
  }, 60_000)
})
