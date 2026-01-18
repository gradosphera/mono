import type {
  CreateTrackingRuleInputDomainInterface,
  TrackingRuleDomainInterface,
} from '../interfaces/tracking-rule-domain.interface';

/**
 * Доменный порт для отслеживания решений
 * Фабрика для регистрации правил отслеживания и автоматического обновления vars
 */
export interface DecisionTrackingPort {
  /**
   * Регистрирует новое правило отслеживания
   * @param input Данные для создания правила
   * @returns Созданное правило
   */
  registerTrackingRule(input: CreateTrackingRuleInputDomainInterface): Promise<TrackingRuleDomainInterface>;

  /**
   * Обновляет hash в существующем правиле
   * Используется при перезапуске общего собрания
   * @param oldHash Старый hash
   * @param newHash Новый hash
   */
  updateTrackingRuleHash(oldHash: string, newHash: string): Promise<void>;

  /**
   * Получает все активные правила отслеживания
   */
  getActiveRules(): Promise<TrackingRuleDomainInterface[]>;

  /**
   * Получает правило по hash
   * @param hash Hash документа
   */
  getRuleByHash(hash: string): Promise<TrackingRuleDomainInterface | null>;

  /**
   * Получает правило по ID
   * @param id ID правила
   */
  getRuleById(id: string): Promise<TrackingRuleDomainInterface | null>;

  /**
   * Деактивирует правило отслеживания
   * @param id ID правила
   */
  deactivateRule(id: string): Promise<void>;

  /**
   * Удаляет правило отслеживания
   * @param id ID правила
   */
  deleteRule(id: string): Promise<void>;
}

export const DECISION_TRACKING_PORT = Symbol('DecisionTrackingPort');
