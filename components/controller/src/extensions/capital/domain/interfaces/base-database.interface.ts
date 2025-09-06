/**
 * Интерфейс данных из базы данных
 */
export interface IBaseDatabaseData {
  /** Внутренний ID базы данных */
  id: string;
  /** ID коммита в блокчейне */
  blockchain_id: string;
  /** Номер блока последнего обновления */
  block_num: number | null;
  /** Существует ли запись в блокчейне */
  present: boolean;
}
