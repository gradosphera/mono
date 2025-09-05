/**
 * Интерфейс данных голоса из базы данных
 */
export interface IVoteDatabaseData {
  /** Внутренний ID базы данных */
  _id: string;
  /** ID голоса в блокчейне */
  id: string;
}
