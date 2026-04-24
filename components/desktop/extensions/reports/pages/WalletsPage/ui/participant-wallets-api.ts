/**
 * Загрузка исходных данных для таба «Пайщики» на странице Кошельки.
 *
 * Программы и progwallets тянем напрямую из blockchain через fetchTable
 * (scope=coopname). Пайщиков (ФИО + username + статус) грузит страница
 * отдельно через useAccountStore.getAccounts — чтобы получить private_account
 * с ФИО, что через чтение таблицы `participants` по контракту недоступно.
 *
 * Возвращаем собранный pivot-срез «program_id → username → cell» — страница
 * только рендерит.
 */
import { fetchTable } from 'src/shared/api'
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

/**
 * Тянем 2 таблицы scope=coopname (programs + progwallets) и строим pivot-срез.
 */
export async function loadProgramsAndWallets(
  coopname: string,
): Promise<IProgramsAndWallets> {
  const [programsRaw, walletsRaw] = await Promise.all([
    fetchTable(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Programs.tableName,
    ),
    fetchTable(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.ProgramWallets.tableName,
    ),
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

  for (const w of walletsRaw as Array<Record<string, unknown>>) {
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
