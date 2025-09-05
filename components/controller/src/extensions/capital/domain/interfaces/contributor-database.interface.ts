/**
 * Интерфейс данных вкладчика из базы данных
 */
export interface IContributorDatabaseData {
  /** Внутренний ID базы данных */
  id: string;
  /** ID вкладчика в блокчейне */
  blockchain_id: number;
  /** Номер блока последнего обновления */
  block_num: number | null;
  /** Существует ли запись в блокчейне */
  present: boolean;
}
