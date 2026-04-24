/**
 * Загрузка исходных данных для таба «Пайщики» на странице Кошельки.
 *
 * Читаем напрямую из blockchain через fetchTable (паттерн
 * `src/entities/Wallet/api` — но там только per-user, а нам нужен весь
 * scope=coopname). Клиентская агрегация в pivot «пайщик × программа».
 *
 * Возвращаем сразу собранный pivot-срез — страница только рендерит.
 */
import { fetchTable } from 'src/shared/api'
import { SovietContract } from 'cooptypes'

export interface IParticipantRow {
  username: string
  type: string           // 'individual' | 'organization' | 'entrepreneur'
  status: string         // 'accepted' | 'blocked' | ...
}

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

export interface IParticipantWalletsMatrix {
  participants: IParticipantRow[]
  programs: IProgramColumn[]
  /** matrix[username][program_id] → {available, blocked}. Отсутствие ключа = кошелька нет. */
  matrix: Record<string, Record<number, IWalletCell>>
  /** Сумма по каждой программе (по всем accepted-пайщикам). */
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
 * Тянем 3 таблицы scope=coopname и строим pivot-срез.
 */
export async function loadParticipantWalletsMatrix(
  coopname: string,
): Promise<IParticipantWalletsMatrix> {
  // Программы, progwallets, participants — все scope=coopname.
  const [programsRaw, walletsRaw, participantsRaw] = await Promise.all([
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
    fetchTable(
      SovietContract.contractName.production,
      coopname,
      'participants',
    ),
  ])

  // Типизируем и фильтруем только активные программы.
  const programs: IProgramColumn[] = (programsRaw as Array<Record<string, unknown>>)
    .filter((p) => Number(p.is_active) === 1)
    .map((p) => ({
      id: Number(p.id),
      title: String(p.title ?? ''),
      program_type: String(p.program_type ?? ''),
      is_active: Number(p.is_active),
    }))
    .sort((a, b) => a.id - b.id)

  // Пайщики — только accepted, остальные не релевантны для миграции/учёта.
  const participants: IParticipantRow[] = (participantsRaw as Array<Record<string, unknown>>)
    .filter((p) => String(p.status) === 'accepted')
    .map((p) => ({
      username: String(p.username),
      type: String(p.type ?? ''),
      status: String(p.status ?? ''),
    }))
    .sort((a, b) => a.username.localeCompare(b.username))

  // Pivot: username → program_id → {avail, blocked}
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

  return { participants, programs, matrix, totals }
}
