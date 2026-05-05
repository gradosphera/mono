/**
 * Phase 1 ускоренный инкремент (Эпик 3 / story 3.6; ADR-008): миграция
 * минимальных паевых взносов w.reg.minshr per-coop из soviet::participants
 * в ledger2::userwallets через ledger2::migrate3.
 *
 * Логика:
 *   Для каждого coop из registrator::coops:
 *     1. Читаем coop → coop.minimum (для individual/entrepreneur)
 *                     coop.org_minimum (для organization)
 *     2. Читаем soviet::participants[scope=coopname] со status=accepted
 *     3. Для каждого пайщика:
 *          amount = coop.org_minimum (если type=organization) либо coop.minimum
 *          ledger2::migrate3(coopname, w.reg.minshr, username, available=amount, blocked=0)
 *
 * Особенность ADR-008: w.reg.minshr — USER_SHARED, исключённый из cross-contract
 * проверки соглашений (сразу при регистрации, до подписания ЦК-соглашения).
 *
 * w.reg.entry (вступительные, COOPERATIVE) НЕ затрагивается этой миграцией —
 * он агрегатный (без L3-разбивки) и заполнен Эпиком 1 миграцией legacy::accounts.
 *
 * Идемпотентно: ledger2::migrate3 устанавливает значение (не +=).
 */

import { Ledger2Contract, RegistratorContract, SovietContract } from 'cooptypes';
import type { Migration } from '../src/migration_interface';
import { api, rpc } from '../src/eos';
import { listCoops } from '../src/utils/listCoops';
import { fetchAllRows } from '../src/utils/fetchAllRows';

const W_REG_MINSHR = 'w.reg.minshr';
const BATCH = 50;

interface ICoop {
  username: string;
  minimum: string;
  org_minimum?: string;
}

async function getCoop(coopname: string): Promise<ICoop | null> {
  const rows = await rpc.get_table_rows({
    json: true,
    code: RegistratorContract.contractName.production,
    scope: RegistratorContract.contractName.production,
    table: RegistratorContract.Tables.Cooperatives.tableName,
    lower_bound: coopname,
    upper_bound: coopname,
    limit: 1,
  });
  return (rows.rows[0] as ICoop | undefined) ?? null;
}

function pickMinimum(coop: ICoop, participantType: string | undefined): string {
  if (participantType === 'organization' && coop.org_minimum) {
    return coop.org_minimum;
  }
  return coop.minimum;
}

function zeroOf(asset: string): string {
  // "100.0000 RUB" → "0.0000 RUB"
  const [amount, sym] = asset.split(' ');
  const decimals = (amount.split('.')[1] || '').length;
  return `${(0).toFixed(decimals)} ${sym}`;
}

export class MigratePhase1Minshare implements Migration {
  async run(): Promise<void> {
    const coops = await listCoops();
    console.log(`[048] Кооперативов найдено: ${coops.length}`);

    let totalMigrated = 0;

    for (const coopname of coops) {
      const coop = await getCoop(coopname);
      if (!coop) {
        console.warn(`[048] ${coopname}: не найден в registrator::coops — пропуск`);
        continue;
      }

      const participants = await fetchAllRows<SovietContract.Tables.Participants.IParticipants>({
        code: SovietContract.contractName.production,
        scope: coopname,
        table: SovietContract.Tables.Participants.tableName,
      });

      const accepted = participants.filter((p) => p.status === 'accepted');
      if (accepted.length === 0) {
        console.log(`[048] ${coopname}: нет accepted-пайщиков — пропуск`);
        continue;
      }

      console.log(`[048] ${coopname}: accepted-пайщиков ${accepted.length}`);
      const blockedZero = zeroOf(coop.minimum);

      for (let i = 0; i < accepted.length; i += BATCH) {
        const chunk = accepted.slice(i, i + BATCH);
        const actions = chunk.map((p) => {
          const available = pickMinimum(coop, (p as any).type);
          return {
            account: Ledger2Contract.contractName.production,
            name: Ledger2Contract.Actions.Migrate3.actionName,
            authorization: [{ actor: coopname, permission: 'active' }],
            data: {
              coopname,
              wallet_name: W_REG_MINSHR,
              username: p.username,
              available,
              blocked: blockedZero,
            },
          };
        });

        await api.transact(
          { actions },
          { blocksBehind: 3, expireSeconds: 30 }
        );

        totalMigrated += chunk.length;
        console.log(`[048] ${coopname}: ${chunk.length} пайщиков → ${W_REG_MINSHR}`);
      }
    }

    console.log(`[048] Готово: всего L3-записей w.reg.minshr создано ${totalMigrated}`);
  }
}
