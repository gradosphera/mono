import type { IBaseDatabaseData } from './base-database.interface';

/**
 * Интерфейс данных программной инвестиции из базы данных
 */
export type IProgramInvestDatabaseData = IBaseDatabaseData & {
  invest_hash: string;
  blockchain_status?: string;
};
