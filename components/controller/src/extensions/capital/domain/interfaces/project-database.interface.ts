/**
 * Интерфейс данных проекта из базы данных
 */
export interface IProjectDomainInterfaceDatabaseData {
  /** Внутренний ID базы данных */
  id: string;
  /** ID проекта в блокчейне */
  blockchain_id: string;
  /** Номер блока последнего обновления из блокчейна */
  block_num: number | null;
  /** Существует ли запись в блокчейне */
  present: boolean;
}
