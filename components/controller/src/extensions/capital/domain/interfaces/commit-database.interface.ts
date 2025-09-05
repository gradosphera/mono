/**
 * Интерфейс данных коммита из базы данных
 */
export interface ICommitDatabaseData {
  /** Внутренний ID базы данных */
  _id: string;
  /** ID коммита в блокчейне */
  id: string;
}
