/**
 * Интерфейс данных инвестиции из базы данных
 */
export interface IInvestDatabaseData {
  /** Внутренний ID базы данных */
  id: string;
  /** ID инвестиции в блокчейне */
  blockchain_id: string;
  /** Номер блока последнего обновления */
  block_num: number | null;
  /** Существует ли запись в блокчейне */
  present: boolean;
}
