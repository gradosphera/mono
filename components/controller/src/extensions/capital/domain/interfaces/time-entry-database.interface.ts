import type { IBaseDatabaseData } from '~/shared/sync/interfaces/base-database.interface';

/**
 * Интерфейс данных записи времени из базы данных
 */
export type ITimeEntryDatabaseData = IBaseDatabaseData & {
  contributor_hash: string;
  issue_hash: string;
  project_hash: string;
  coopname: string;
  date: string;
  hours: number;
  commit_hash?: string;
  is_committed: boolean;
};
