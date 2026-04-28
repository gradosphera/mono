/**
 * Фаза 04b — активация УХД-договора председателя через `soviet::confirmapprv`.
 *
 * Phase 04 создаёт Contributor через Capital flow (Generate → Sign → Complete),
 * но возвращённый row остаётся в статусе `pending` — для активации совет
 * должен утвердить пакет одобрения, который Capital поставил в очередь
 * (`Soviet::make_pending_approve` внутри `capital::regcontrib`). При обычном
 * boot:extra (5 членов совета) утверждение проходит через стандартный
 * flow голосования; для plain boot (один председатель) этого не происходит.
 *
 * Без активного УХД любая попытка обновить ставку/часы/назначить мастера
 * валится с «Договор УХД с пайщиком не активен» — поэтому эта фаза
 * гасит approval напрямую через одну транзакцию `soviet::confirmapprv`,
 * подписанную председателем.
 *
 * Используется в минимальном «чистая мастерская» seed:
 *   pnpm --filter @coopenomics/boot exec esno src/scripts/seed-capital/index.ts \
 *     01-programs 02-extension-config 04-contributor 04b-approve-contributor
 *
 * Идемпотентно: если УХД уже active — фаза no-op.
 *
 * Зависит от phase 04 (Contributor создан, есть `contributor_hash` в таблице).
 */
import { CapitalContract, SovietContract } from 'cooptypes'
import Blockchain from '../../../blockchain'
import config from '../../../configs'

const log = (...a: unknown[]) => console.error('[seed-capital:04b]', ...a)

const COOPNAME = 'voskhod'
const CHAIRMAN = 'ant'

const FAKE_HASH = '157192b276da23cc84ab078fc8755c051c5f0430bf4802e55718221e6b76c777'

function fakeDocumentSignedBy(signer: string) {
  return {
    version: '1.0.0',
    hash: FAKE_HASH,
    doc_hash: FAKE_HASH,
    meta_hash: FAKE_HASH,
    meta: '{}',
    signatures: [{
      id: 1,
      signed_hash: FAKE_HASH,
      signer,
      public_key: 'EOS5JhMfxbsNebajHcTEK8yC9uNN9Dit9hEmzE8ri8yMhhzxrLg3J',
      signature: 'SIG_K1_KmKWPBC8dZGGDGhbKEoZEzPr3h5crRrR2uLdGRF5DJbeibY1MY1bZ9sPwHsgmPfiGFv9psfoCVsXFh9TekcLuvaeuxRKA8',
      signed_at: '2025-05-14T12:22:26',
      meta: '{}',
    }],
  }
}

interface IContributorRow {
  username?: string
  status?: string
  contributor_hash?: string
}

export async function phase04b(): Promise<void> {
  const blockchain = new Blockchain(config.network, config.private_keys)
  await blockchain.update_pass_instance()

  const rows = await blockchain.getTableRows(
    CapitalContract.contractName.production,
    COOPNAME,
    'contributors',
    1,
    CHAIRMAN,
    CHAIRMAN,
    2,
    'i64',
  ) as IContributorRow[]
  const row = rows[0]
  if (!row) {
    throw new Error(`Contributor ${CHAIRMAN} не найден — сначала запусти phase 04`)
  }
  if (row.status === 'active') {
    log(`УХД-договор ${CHAIRMAN} уже active — пропуск`)
    return
  }
  if (!row.contributor_hash) {
    throw new Error(`У ${CHAIRMAN} нет contributor_hash в строке ${JSON.stringify(row)}`)
  }

  log(`soviet::confirmapprv ${CHAIRMAN} (approval_hash=${row.contributor_hash.slice(0, 10)}...)`)
  await blockchain.api.transact({
    actions: [{
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Approves.ConfirmApprove.actionName,
      authorization: [{ actor: COOPNAME, permission: 'active' }],
      data: {
        coopname: COOPNAME,
        username: CHAIRMAN,
        approval_hash: row.contributor_hash,
        approved_document: fakeDocumentSignedBy(CHAIRMAN),
      },
    }],
  }, { blocksBehind: 3, expireSeconds: 30 })

  log(`фаза 04b завершена — УХД-договор ${CHAIRMAN} активен`)
}
