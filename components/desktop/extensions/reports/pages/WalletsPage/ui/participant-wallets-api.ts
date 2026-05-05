/**
 * Загрузка исходных данных для таба «Пайщики» на странице Кошельки.
 *
 * Программы тянем из blockchain через fetchTable (`soviet::programs`,
 * scope=coopname). Программные кошельки — через GraphQL `getProgramWallets`,
 * который собирает срезы из `ledger2::userwallets` (Эпик 3, ADR-008).
 * Пайщиков (ФИО + username + статус) грузит страница отдельно через
 * `useAccountStore.getAccounts`.
 *
 * Возвращаем собранный pivot-срез «program_id → username → cell» — страница
 * только рендерит.
 */
import { fetchTable } from 'src/shared/api'
import { client } from 'src/shared/api/client'
import { Queries } from '@coopenomics/sdk'
import { SovietContract } from 'cooptypes'

export interface IProgramColumn {
  id: number
  title: string
  program_type: string   // 'wallet' | 'generator' | 'blagorost' | ...
  is_active: number
}

export interface IWalletCell {
  available: number
  blocked: number
}

export interface IProgramsAndWallets {
  programs: IProgramColumn[]
  /** matrix[username][program_id] → {available, blocked}. Отсутствие ключа = кошелька нет. */
  matrix: Record<string, Record<number, IWalletCell>>
  /** Сумма по каждой программе (по всем кошелькам). */
  totals: Record<number, IWalletCell>
}

function parseAsset(s: unknown): number {
  if (!s) return 0
  if (typeof s !== 'string') return 0
  const parts = s.trim().split(/\s+/)
  const n = parseFloat(parts[0] ?? '0')
  return Number.isFinite(n) ? n : 0
}

export async function loadProgramsAndWallets(
  coopname: string,
): Promise<IProgramsAndWallets> {
  const [programsRaw, walletsResponse] = await Promise.all([
    fetchTable(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Programs.tableName,
    ),
    client.Query(Queries.Wallet.GetProgramWallets.query, {
      variables: {
        filter: { coopname },
        options: { page: 1, limit: 100000 },
      },
    }),
  ])

  const programs: IProgramColumn[] = (programsRaw as Array<Record<string, unknown>>)
    .filter((p) => Number(p.is_active) === 1)
    .map((p) => ({
      id: Number(p.id),
      title: String(p.title ?? ''),
      program_type: String(p.program_type ?? ''),
      is_active: Number(p.is_active),
    }))
    .sort((a, b) => a.id - b.id)

  const matrix: Record<string, Record<number, IWalletCell>> = {}
  const totals: Record<number, IWalletCell> = {}
  for (const p of programs) totals[p.id] = { available: 0, blocked: 0 }

  const wallets = walletsResponse[Queries.Wallet.GetProgramWallets.name]?.items ?? []

  for (const w of wallets) {
    const username = String(w.username)
    const program_id = Number(w.program_id)
    const avail = parseAsset(w.available)
    const blocked = parseAsset(w.blocked)
    if (!matrix[username]) matrix[username] = {}
    matrix[username][program_id] = { available: avail, blocked }
    const t = totals[program_id]
    if (t) {
      t.available += avail
      t.blocked += blocked
    }
  }

  return { programs, matrix, totals }
}
