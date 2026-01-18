import type { DecisionProcessedResultDomainInterface } from '../interfaces/tracking-rule-domain.interface';

/**
 * Событие успешного отслеживания и обработки решения
 * Эмитится когда найдено совпадение hash и обновлены vars
 */
export class DecisionTrackedEvent {
  static readonly eventName = 'decision.tracked';

  constructor(public readonly result: DecisionProcessedResultDomainInterface) {}
}
