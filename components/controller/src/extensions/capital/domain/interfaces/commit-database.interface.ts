import type { IBaseDatabaseData } from './base-database.interface';

/**
 * Интерфейс данных коммита из базы данных
 */
export type ICommitDatabaseData = IBaseDatabaseData & {
  commit_hash: string;
  blockchain_status?: string;
};
