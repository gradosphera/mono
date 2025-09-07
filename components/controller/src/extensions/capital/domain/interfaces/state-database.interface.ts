import type { IBaseDatabaseData } from './base-database.interface';
/**
 * Интерфейс данных состояния из базы данных
 */
export type IStateDatabaseData = IBaseDatabaseData & {
  coopname: string;
};
