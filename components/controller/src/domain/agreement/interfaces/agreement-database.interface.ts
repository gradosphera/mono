import type { IBaseDatabaseData } from '~/shared/sync/interfaces/base-database.interface';

/**
 * Интерфейс данных соглашения из базы данных
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IAgreementDatabaseData extends IBaseDatabaseData {
  // Дополнительные поля базы данных, если нужны
  // Например, кэшированные вычисляемые поля или индексы
}
