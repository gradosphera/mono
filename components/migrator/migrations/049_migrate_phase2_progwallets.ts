/**
 * Phase 2 (Эпик 3 / story 3.7): миграция soviet::progwallets → ledger2::userwallets
 * через ledger2::migrate3 (per-coop self-service).
 *
 * Маппинг program_id → wallet_name (см. эпик 3 §6 «Migrator Phase 2»):
 *   1 (ЦК) → split: w.wal.share + w.wal.member.
 *           На текущем prod membership_contribution = 0, поэтому всё уходит
 *           в w.wal.share, а w.wal.member не создаётся (no-op).
 *   3 (Генератор) → w.cap.gen
 *   4 (Благорост) → w.cap.blago
 *   2 (marketplace) — программных кошельков нет, пропускается.
 *
 * Особенности:
 *   - Идемпотентно: ledger2::migrate3 устанавливает значение (не +=).
 *   - Без удаления записей из soviet::progwallets — это сделает Эпик 4
 *     (финальный deploy soviet); до тех пор записи остаются как избыточная
 *     копия (новые operations пишут только в ledger2::userwallets).
 *
 * Pre-flight gate (NFR18) выполняется ВНЕШНИМ скриптом на staging:
 * сравнение Σ progwallets (pre) vs Σ userwallets (post) per (coopname, username,
 * program_id) — дельта 0 копеек до production rollout.
 */

import { Ledger2Contract, SovietContract } from 'cooptypes';
import type { Migration } from '../src/migration_interface';
import { api } from '../src/eos';
import { listCoops } from '../src/utils/listCoops';
import { fetchAllRows } from '../src/utils/fetchAllRows';

const PROGRAM_TO_WALLET: Record<number, string> = {
  1: 'w.wal.share',
  3: 'w.cap.gen',
  4: 'w.cap.blago',
};

const BATCH = 50;

export class MigratePhase2Progwallets implements Migration {
  async run(): Promise<void> {
    const coops = await listCoops();
    console.log(`[049] Кооперативов найдено: ${coops.length}`);

    let totalMigrated = 0;

    for (const coopname of coops) {
      const progwallets = await fetchAllRows<SovietContract.Tables.ProgramWallets.IProgramWallet>({
        code: SovietContract.contractName.production,
        scope: coopname,
        table: SovietContract.Tables.ProgramWallets.tableName,
      });

      const eligible = progwallets.filter((pw) => PROGRAM_TO_WALLET[Number(pw.program_id)]);
      if (eligible.length === 0) {
        console.log(`[049] ${coopname}: нет progwallets под маппинг — пропуск`);
        continue;
      }

      console.log(`[049] ${coopname}: progwallets ${eligible.length}`);

      for (let i = 0; i < eligible.length; i += BATCH) {
        const chunk = eligible.slice(i, i + BATCH);
        const actions = chunk.map((pw) => ({
          account: Ledger2Contract.contractName.production,
          name: Ledger2Contract.Actions.Migrate3.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: {
            coopname,
            wallet_name: PROGRAM_TO_WALLET[Number(pw.program_id)]!,
            username: pw.username,
            available: pw.available,
            blocked: pw.blocked,
          },
        }));

        await api.transact(
          { actions },
          { blocksBehind: 3, expireSeconds: 30 }
        );

        totalMigrated += chunk.length;
        console.log(`[049] ${coopname}: ${chunk.length} progwallets → userwallets`);
      }
    }

    console.log(`[049] Готово: всего L3-записей migrate3 ${totalMigrated}`);
  }
}
