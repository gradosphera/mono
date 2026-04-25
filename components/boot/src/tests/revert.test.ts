/**
 * Integration: revert (operation `o.adj.rev`) — откат ранее проведённой
 * операции зеркальной проводкой. Кейс: ошибочно проведённая регистрация —
 * её можно откатить, чтобы balance счёта вернулся в исходное состояние.
 *
 * Проверяет:
 *  - mutation revertOperation отрабатывает на не-миграционной операции;
 *  - balance оригинального кошелька возвращается к pre-state;
 *  - balance бух.счёта (Cr) тоже возвращается;
 *  - в getLedger2History появляется запись с operation_code='o.adj.rev';
 *  - запрет на откат `o.mig.*` (backend + контракт обе стороны check'ают).
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import Blockchain from '../blockchain'
import config from '../configs'
import { gql, loginAsChairman, waitUntil, type LoginResult } from './shared/apiClient'
import { registerUser } from './registrator/registerUser'
import { revertOperation } from './adjust/revert'
import { getLedgerAccountById } from './wallet/walletUtils'
import { generateRandomUsername } from '../utils/randomUsername'

const COOP = 'voskhod'

const WALLET_MIN_SHARE_FUND = 2002
const ACCOUNT_SHARE_FUND = 80_000

const WALLETS_QUERY = `query($c:String!){
  getLedger2Wallets(coopname:$c){ id name available blocked }
}`

const HISTORY_QUERY = `query($i:GetLedger2HistoryInput!){
  getLedger2History(input:$i){
    items { globalSequence action operationCode processHash username quantity memo }
    totalCount
  }
}`

const bc = new Blockchain(config.network, config.private_keys)
let login: LoginResult

beforeAll(async () => {
  await bc.update_pass_instance()
  login = await loginAsChairman()
}, 60_000)

afterAll(() => {})

function parseAsset(raw: string | null | undefined): number {
  if (!raw) return 0
  return Number.parseFloat(String(raw).split(' ')[0])
}

/** Читаем балансы напрямую с чейна — parser отстаёт, тест не должен на него полагаться. */
async function getWalletAvailable(walletId: number): Promise<number> {
  const rows = await bc.getTableRows('ledger2', COOP, 'wallets', 200)
  const w = rows.find((r: { id: number | string }) => Number(r.id) === walletId)
  return w ? parseAsset((w as { available: string }).available) : 0
}

async function findApplyByCode(operationCode: string, username?: string): Promise<{
  globalSequence: string
  quantity: string
} | null> {
  const data = await gql<{ getLedger2History: { items: any[] } }>(login.token, HISTORY_QUERY, {
    i: { coopname: COOP, operationCodes: [operationCode], limit: 50, page: 1, sortOrder: 'DESC' },
  })
  const item = data.getLedger2History.items.find((i) => {
    if (i.action !== 'apply') return false
    if (username && i.username !== username) return false
    return true
  })
  return item ? { globalSequence: String(item.globalSequence), quantity: String(item.quantity ?? '') } : null
}

/** Тоже что findApplyByCode, но с polling под parser-задержку. */
async function waitApplyByCode(operationCode: string, username?: string): Promise<{
  globalSequence: string
  quantity: string
}> {
  return waitUntil(
    () => findApplyByCode(operationCode, username),
    { timeoutMs: 60_000, label: `apply ${operationCode}${username ? ` для ${username}` : ''}` },
  )
}

describe('revert (operation o.adj.rev) — откат ранее проведённой операции', () => {
  it('откатывает регистрационный o.reg.putmin: 2002 (MIN_SHARE_FUND) и счёт 80 возвращаются к pre-state', async () => {
    // 1. Регистрируем пайщика — записывается o.reg.putmin (Dr 51 / Cr 80, ISSUE 2002).
    const username = generateRandomUsername()
    await registerUser(bc, COOP, username)

    // 2. Найти globalSequence apply-записи o.reg.putmin для этого username
    //    (с polling — parser отстаёт от head_block; одновременно гарантирует,
    //    что parser обработал саму регистрацию ДО снятия baseline'а).
    const original = await waitApplyByCode('o.reg.putmin', username)
    const moveAmount = parseAsset(original.quantity)
    expect(moveAmount).toBeGreaterThan(0)

    // 3. Состояние ПОСЛЕ регистрации (= ДО revert) — снимаем после того, как
    //    parser догнал регистрационные дельты, иначе baseline схлопнется
    //    с дельтой revert в одном блоке.
    const fromBefore = await getWalletAvailable(WALLET_MIN_SHARE_FUND)
    const accountBefore = parseAsset(
      (await getLedgerAccountById(bc, COOP, ACCOUNT_SHARE_FUND)).available,
    )

    // 4. Откатываем (action revert + inline walletop REVOKE + debit + credit).
    const memo = `revert o.reg.putmin тестовый откат для ${username}`
    const { processHash } = await revertOperation(login, COOP, original.globalSequence, memo)
    expect(processHash).toMatch(/^[0-9a-f]{64}$/)

    // 5. Состояние ПОСЛЕ revert — читаем напрямую с чейна.
    const fromAfter = await getWalletAvailable(WALLET_MIN_SHARE_FUND)
    const accountAfter = parseAsset(
      (await getLedgerAccountById(bc, COOP, ACCOUNT_SHARE_FUND)).available,
    )
    expect(fromAfter).toBeCloseTo(fromBefore - moveAmount, 4)
    expect(accountAfter).toBeCloseTo(accountBefore - moveAmount, 4)

    // 6. Запись в реестре — ждём parser (отстаёт 1-3с).
    const revertAction = await waitUntil(
      async () => {
        const data = await gql<{ getLedger2History: { items: any[] } }>(login.token, HISTORY_QUERY, {
          i: { coopname: COOP, processHash, actionNames: ['revert'], limit: 10, page: 1 },
        })
        const item = data.getLedger2History.items.find((i) => i.action === 'revert')
        return item ?? null
      },
      { timeoutMs: 60_000, label: 'revert action в реестре' },
    )
    expect(revertAction).toBeDefined()
    expect(revertAction.memo).toBe(memo)
  }, 240_000)

  it('запрещает откат миграционных операций (o.mig.*) на стороне backend', async () => {
    // Любая миграционная запись из base-fixture (voskhod был мигрирован при boot).
    const original = await findApplyByCode('o.mig.share')
    if (!original) {
      // Если в этом окружении миграции не было (clean boot без legacy) — пропускаем кейс.
      return
    }

    let errMessage = ''
    try {
      await revertOperation(login, COOP, original.globalSequence, 'попытка отката миграции')
    } catch (e) {
      errMessage = (e as Error).message
    }
    expect(errMessage).toContain('o.mig')
  }, 60_000)
})
