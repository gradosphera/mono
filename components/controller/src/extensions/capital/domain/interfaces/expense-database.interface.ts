/**
 * Интерфейс данных расхода из базы данных
 */
export interface IExpenseDatabaseData {
  /** Внутренний ID базы данных */
  _id: string;
  /** ID расхода в блокчейне */
  id: string;
}
