/**
 * Интерфейс данных из базы данных
 */
export interface IBaseDatabaseData {
  /** Внутренний ID базы данных */
  _id: string;
  /** Номер блока последнего обновления */
  block_num?: number;
  /** Существует ли запись в блокчейне */
  present: boolean;
  /** Статус сущности */
  status?: string;
}
