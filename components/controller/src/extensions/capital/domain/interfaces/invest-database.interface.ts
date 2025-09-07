import type { IBaseDatabaseData } from './base-database.interface';
/**
 * Интерфейс данных инвестиции из базы данных
 */
export type IInvestDatabaseData = IBaseDatabaseData & {
  invest_hash: string;
  blockchain_status?: string;
};
