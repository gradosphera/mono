import type { IBaseDatabaseData } from '~/shared/sync/interfaces/base-database.interface';

/**
 * Интерфейс данных проектного кошелька из базы данных
 */
export type IProjectWalletDatabaseData = IBaseDatabaseData & {
  username: string;
  blockchain_status?: string;
};
