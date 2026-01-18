/**
 * Тип события решения
 */
export enum DecisionEventType {
  /**
   * Решение совета
   */
  SOVIET_DECISION = 'soviet_decision',
  /**
   * Решение общего собрания
   */
  MEET_DECISION = 'meet_decision',
}

/**
 * Строковый тип для совместимости с базой данных
 */
export type DecisionEventTypeString = 'soviet_decision' | 'meet_decision';

/**
 * Правило отслеживания решения
 * Определяет связь между hash документа и полем vars для обновления
 */
export interface TrackingRuleDomainInterface {
  /**
   * Уникальный идентификатор правила
   */
  id: string;

  /**
   * Hash документа для отслеживания
   */
  hash: string;

  /**
   * Тип события (решение совета или общего собрания)
   */
  event_type: DecisionEventType;

  /**
   * Ключ в vars для обновления при совпадении hash
   */
  vars_field: string;

  /**
   * Метаданные для пост-обработки
   */
  metadata: Record<string, any>;

  /**
   * Активно ли правило
   */
  active: boolean;

  /**
   * Дата создания правила
   */
  created_at: Date;
}

/**
 * Входные данные для создания правила отслеживания
 */
export interface CreateTrackingRuleInputDomainInterface {
  /**
   * Hash документа для отслеживания
   */
  hash: string;

  /**
   * Тип события (решение совета или общего собрания)
   */
  event_type: DecisionEventType;

  /**
   * Ключ в vars для обновления при совпадении hash
   */
  vars_field: string;

  /**
   * Метаданные для пост-обработки
   */
  metadata: Record<string, any>;
}

/**
 * Результат обработки решения
 */
export interface DecisionProcessedResultDomainInterface {
  /**
   * Был ли найден match
   */
  matched: boolean;

  /**
   * ID правила которое совпало
   */
  rule_id?: string;

  /**
   * Hash документа
   */
  hash: string;

  /**
   * Тип события
   */
  event_type: DecisionEventType;

  /**
   * Обновленное поле vars
   */
  vars_field?: string;

  /**
   * ID решения
   */
  decision_id?: string;

  /**
   * Дата решения
   */
  decision_date?: string;

  /**
   * Метаданные из правила
   */
  metadata: Record<string, any>;
}
