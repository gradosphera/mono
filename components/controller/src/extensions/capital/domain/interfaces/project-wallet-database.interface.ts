import type { IBaseDatabaseData } from './base-database.interface';

/**
 * Интерфейс данных проектного кошелька из базы данных
 */
export type IProjectWalletDatabaseData = IBaseDatabaseData & {
  username: string;
  blockchain_status?: string;
};
