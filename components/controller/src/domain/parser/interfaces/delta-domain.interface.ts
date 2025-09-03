/**
 * Доменный интерфейс для дельты таблицы блокчейна
 */
export interface DeltaDomainInterface {
  id: string;
  chain_id: string;
  block_num: number;
  block_id: string;
  present: boolean;
  code: string;
  scope: string;
  table: string;
  primary_key: string;
  value?: any;
  created_at: Date;
}
