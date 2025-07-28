/**
 * Доменный интерфейс для бухгалтерского счета
 */
export interface LedgerAccountDomainInterface {
  /** Идентификатор счета */
  id: number;
  /** Название счета */
  name: string;
  /** Доступные средства */
  available: string;
  /** Заблокированные средства */
  blocked: string;
  /** Списанные средства */
  writeoff: string;
}
