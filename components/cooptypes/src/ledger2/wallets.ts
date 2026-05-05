/**
 * Реестр кошельков ledger2 — source of truth в контракте:
 * `components/contracts/cpp/lib/core/ledger2/wallets.hpp`
 * (`LEDGER2_WALLET_REGISTRY`). При добавлении/переименовании кошелька
 * синхронизировать обе стороны.
 *
 * Идентификатор кошелька — `eosio::name` с префиксом `w.<contract>.<waltype>`
 * по аналогии с операциями (`o.<contract>.<verb>`) и процессами
 * (`p.<contract>.<noun>`). Длина ≤ 13 base32-символов.
 *
 * `human_name` — отображаемое имя в UI (standards-site, desktop).
 *
 * Классификация `WalletKind` (ADR-002):
 *   USER_SHARED  — обязателен L3-разрез по пайщику (`ledger2::userwallets`).
 *   COOPERATIVE  — единый кооперативный баланс, без L3.
 */
import type { IName } from '../interfaces/ledger2'

export type WalletKind = 'USER_SHARED' | 'COOPERATIVE'

export interface WalletMeta {
  /** Машинный идентификатор — eosio::name в контракте. */
  name: IName
  /** Человекочитаемое название для UI. */
  human_name: string
  /** Тип кошелька: USER_SHARED — L3-разрез по пайщику; COOPERATIVE — единый баланс. */
  kind: WalletKind
}

export const LEDGER2_WALLET_REGISTRY: readonly WalletMeta[] = [
  // USER_SHARED (5) — L3-разрез по пайщику
  { name: 'w.reg.minshr', human_name: 'Минимальный паевой взнос',                                kind: 'USER_SHARED' },
  { name: 'w.wal.share',  human_name: 'ЦК — паевая часть пайщика',                              kind: 'USER_SHARED' },
  { name: 'w.wal.member', human_name: 'ЦК — членская часть пайщика',                            kind: 'USER_SHARED' },
  { name: 'w.cap.blago',  human_name: 'ЦПП «Благорост» — единый кошелёк программы у пайщика',   kind: 'USER_SHARED' },
  { name: 'w.cap.gen',    human_name: 'ЦПП «Генератор» — единый кошелёк программы у пайщика',   kind: 'USER_SHARED' },

  // COOPERATIVE (6) — единый кооперативный баланс, без L3
  { name: 'w.reg.entry',  human_name: 'Вступительные взносы',                                   kind: 'COOPERATIVE' },
  { name: 'w.wal.wthdrw', human_name: 'Возвраты паевых взносов пайщикам',                       kind: 'COOPERATIVE' },
  { name: 'w.sov.infra',  human_name: 'Членские взносы за инфраструктуру кооп. платформы',      kind: 'COOPERATIVE' },
  { name: 'w.sov.delgte', human_name: 'Делегатские членские взносы',                            kind: 'COOPERATIVE' },
  { name: 'w.cap.loan',   human_name: 'Выданные пайщикам беспроцентные займы',                  kind: 'COOPERATIVE' },
  { name: 'w.mkt.payout', human_name: 'Выплаты поставщикам',                                    kind: 'COOPERATIVE' },
] as const

const walletHumanByName = new Map<string, string>(
  LEDGER2_WALLET_REGISTRY.map((w) => [w.name, w.human_name]),
)

const walletKindByName = new Map<string, WalletKind>(
  LEDGER2_WALLET_REGISTRY.map((w) => [w.name, w.kind]),
)

/**
 * Возвращает человекочитаемое имя кошелька по его eosio::name-идентификатору.
 * Возвращает undefined для незарегистрированных имён и для пустого имени
 * (sentinel "" — кошелёк-источник/сток вне системы при ISSUE/BURN).
 */
export function getWalletHumanName(name: IName | null | undefined): string | undefined {
  if (!name) return undefined
  return walletHumanByName.get(name)
}

/**
 * Возвращает `WalletKind` кошелька по его eosio::name (ADR-002, ADR-010).
 * Возвращает undefined для незарегистрированных имён.
 */
export function getWalletKind(name: IName | null | undefined): WalletKind | undefined {
  if (!name) return undefined
  return walletKindByName.get(name)
}
