/**
 * Интерфейс для элемента плана счетов
 */
export interface ChartOfAccountsItemDomainInterface {
  /** Идентификатор счета */
  id: number;
  /** Идентификатор счета для отображения (может быть дробным, например "86.6") */
  displayId: string;
  /** Название счета */
  name: string;
  /** Доступные средства */
  available: string;
  /** Заблокированные средства */
  blocked: string;
  /** Списанные средства */
  writeoff: string;
}
