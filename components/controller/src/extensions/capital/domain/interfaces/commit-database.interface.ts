import type { IBaseDatabaseData } from '~/shared/sync/interfaces/base-database.interface';

/**
 * Интерфейс данных коммита из базы данных
 */
export type ICommitDatabaseData = IBaseDatabaseData & {
  commit_hash: string;
  blockchain_status?: string;
  /** Обогащенные данные коммита (diff, источник и т.д.) */
  data: any;
};
