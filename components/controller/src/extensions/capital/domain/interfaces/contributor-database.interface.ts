import type { IBaseDatabaseData } from './base-database.interface';
/**
 * Интерфейс данных вкладчика из базы данных
 */
export type IContributorDatabaseData = IBaseDatabaseData & {
  contributor_hash: string;
  blockchain_status?: string;
};
