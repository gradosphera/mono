/**
 * Доменный интерфейс для форка блокчейна
 */
export interface ForkDomainInterface {
  id: string;
  chain_id: string;
  block_num: number;
  created_at: Date;
}
