/**
 * Типы действий документов, поддерживаемые расширением 1CCoop.
 * Это подмножество полного DocumentAction enum.
 * Определяет какие типы документов передаются во внешнюю бухгалтерию.
 */
export enum OneCoopDocumentAction {
  /**
   * Вступление в кооператив - заявление на членство
   */
  JOINCOOP = 'joincoop',
}

/**
 * Массив всех поддерживаемых действий для использования в фильтрации
 */
export const SUPPORTED_DOCUMENT_ACTIONS: OneCoopDocumentAction[] = [OneCoopDocumentAction.JOINCOOP];
