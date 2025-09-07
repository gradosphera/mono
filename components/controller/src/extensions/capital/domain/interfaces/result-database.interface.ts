import type { IBaseDatabaseData } from './base-database.interface';
/**
 * Интерфейс данных результата из базы данных
 */
export type IResultDatabaseData = IBaseDatabaseData & {
  result_hash: string;
  blockchain_status?: string;
};
