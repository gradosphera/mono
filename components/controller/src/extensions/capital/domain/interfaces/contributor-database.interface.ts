import type { IBaseDatabaseData } from '~/shared/sync/interfaces/base-database.interface';
/**
 * Интерфейс данных участника из базы данных
 */
export type IContributorDatabaseData = IBaseDatabaseData & {
  contributor_hash: string;
  blockchain_status?: string;
  display_name: string;
  about?: string;
};
