/**
 * Интерфейс данных состояния из базы данных
 */
export interface IStateDatabaseData {
  /** Внутренний ID базы данных */
  _id: string;
  /** ID состояния в блокчейне */
  id: string;
}
