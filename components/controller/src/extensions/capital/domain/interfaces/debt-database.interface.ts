/**
 * Интерфейс данных долга из базы данных
 */
export interface IDebtDatabaseData {
  /** Внутренний ID базы данных */
  _id: string;
  /** ID долга в блокчейне */
  id: string;
}
