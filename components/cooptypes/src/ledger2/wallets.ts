/**
 * Реестр кошельков ledger2 — source of truth в контракте:
 * `components/contracts/cpp/lib/core/ledger2/wallets.hpp`
 * (`LEDGER2_WALLET_REGISTRY`). При добавлении/переименовании кошелька
 * синхронизировать обе стороны.
 *
 * Используется для tooltip-подсказок в UI (standards-site, desktop).
 */
export interface WalletMeta {
  id: number
  name: string
}

export const LEDGER2_WALLET_REGISTRY: readonly WalletMeta[] = [
  // id=0 — frontend-only: в контракте нет, но walletop issue/consume использует
  // 0 как «кошелёк-источник/сток извне системы» (эмиссия / сжигание).
  { id: 0, name: 'Выпуск' },
  { id: 2001, name: 'ЦПП «Цифровой Кошелёк» — паевые взносы деньгами' },
  { id: 2002, name: 'Минимальный паевой взнос' },
  { id: 2003, name: 'Паевой фонд — принятые РИД' },
  { id: 3001, name: 'Вступительные взносы' },
  { id: 3002, name: 'Членские взносы (платформенные)' },
  { id: 3003, name: 'Делегатские членские взносы' },
  { id: 4001, name: 'Возвраты паевых взносов пайщикам' },
  { id: 4002, name: 'Выплаты поставщикам' },
  { id: 4051, name: 'Выданные пайщикам беспроцентные займы' },
  { id: 5001, name: 'Ручные корректировки' },
  { id: 9001, name: 'ЦПП «Благорост» — инвестиции деньгами' },
  { id: 9002, name: 'ЦПП «Благорост» — принятые РИД' },
  { id: 9003, name: 'ЦПП «Благорост» — имущественные паевые взносы' },
  { id: 9004, name: 'ЦПП «Благорост» — членские взносы' },
  { id: 10001, name: 'ЦПП «Генератор» — принятый коммит (имущество)' },
  { id: 10002, name: 'ЦПП «Генератор» — членские взносы' },
  { id: 11001, name: 'ЦПП «Стол Заказов» — общий кошелёк' },
] as const

const walletNameById = new Map<number, string>(
  LEDGER2_WALLET_REGISTRY.map((w) => [w.id, w.name]),
)

export function getWalletName(id: number | null | undefined): string | undefined {
  if (id == null) return undefined
  return walletNameById.get(id)
}
