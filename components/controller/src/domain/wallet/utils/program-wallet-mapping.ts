/**
 * Маппинг program_id → wallet_name'ов в L3-учёте `ledger2::userwallets`.
 *
 * Соответствует `LEDGER2_USER_SHARED_PROGRAM_MAPPING` в C++ контрактах
 * (Эпик 3 §6) и боевому маппингу из migrator/049_migrate_phase2_progwallets.ts:
 *
 *   1 (ЦК)         → w.wal.share + w.wal.member  (split: share-фонд + членский)
 *   3 (Генератор)  → w.cap.gen
 *   4 (Благорост)  → w.cap.blago
 *
 * Изменения здесь должны идти синхронно с C++ реестром, иначе нарушится
 * пост-мутационный invariant Σ L3 == L2 (NFR2).
 */
export const PROGRAM_ID_TO_WALLET_NAMES: Record<number, string[]> = {
  1: ['w.wal.share', 'w.wal.member'],
  3: ['w.cap.gen'],
  4: ['w.cap.blago'],
};

export const WALLET_NAME_TO_PROGRAM_ID: Record<string, number> = {
  'w.wal.share': 1,
  'w.wal.member': 1,
  'w.cap.gen': 3,
  'w.cap.blago': 4,
};

/** wallet_name, в который пишется membership_contribution (только ЦК). */
export const MEMBERSHIP_WALLET_NAME = 'w.wal.member';

export function walletNamesForProgram(program_id: number | string | undefined): string[] {
  if (program_id === undefined || program_id === null) return [];
  return PROGRAM_ID_TO_WALLET_NAMES[Number(program_id)] ?? [];
}

export function programIdForWallet(wallet_name: string | undefined): number | undefined {
  if (!wallet_name) return undefined;
  return WALLET_NAME_TO_PROGRAM_ID[wallet_name];
}
