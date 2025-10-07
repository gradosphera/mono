import type { IBaseDatabaseData } from '~/shared/sync/interfaces/base-database.interface';

/**
 * Интерфейс данных сегмента из базы данных
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISegmentDatabaseData extends IBaseDatabaseData {
  // Дополнительные поля базы данных, если нужны
  // Для сегментов ключ синхронизации составной: project_hash + username
}
